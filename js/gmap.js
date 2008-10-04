var CzfMap =
{
	mediaColors: [ "#000", "#0C0", "#A22", "#8DF", "#A2A", "#0FF", "#F00", "#CCC", "#FFF", "#F80" ],
	ajaxParams: { actnode: 1, aponly: 1, obsolete: 1, alien: 1, actlink: 1, bbonly: 1 },
	defaultPos: { lat: 50.006915, lng: 14.422809, zoom: 18 },
	icons: new Object(),
	map: null,
	
	initialize: function(mapID, panelID, infoID)
	{
		if (GBrowserIsCompatible())
		{
			CzfPanel.initialize(panelID, infoID);
			this.show(document.getElementById(mapID));
		}
	},
	
	unload: function()
	{
		GUnload();
	},
	
	show: function(element)
	{
		this.map = new GMap2(element);
		
		this.map.addControl(new GLargeMapControl());
		this.map.addControl(new GMapTypeControl());
		this.map.addControl(new GOverviewMapControl());
		this.map.addControl(new GScaleControl());
		
		this.map.setMapType(G_SATELLITE_MAP);
		this.map.enableScrollWheelZoom();
		this.map.enableDoubleClickZoom();
		
		this.anchor = new CzfAnchor(this.methodCall(this.setPosition));
		this.loadIcons();
		this.moved();
		
		GEvent.addListener(this.map, "moveend", this.methodCall(this.moved));
		GEvent.addListener(this.map, "zoomend", this.methodCall(this.zoomed));
		GEvent.addListener(this.map, "click", this.methodCall(this.clicked));
	},
	
	setPosition: function(state)
	{
		CzfPanel.setState(state);
		
		var lat = state.lat ? parseFloat(state.lat) : this.defaultPos.lat;
		var lng = state.lng ? parseFloat(state.lng) : this.defaultPos.lng;
		var zoom = state.zoom ? parseInt(state.zoom) : this.defaultPos.zoom;
		
		this.map.setCenter(new GLatLng(lat, lng), zoom);
	},
	
	moved: function()
	{
		var state = CzfPanel.getState();
		state.lat = this.map.getCenter().lat();
		state.lng = this.map.getCenter().lng();
		state.zoom = this.map.getZoom();

		this.anchor.update(state);
		
		if (state.hideall)
			this.map.clearOverlays();
		else
			this.loadData(state);
	},
	
	zoomed: function(oldZoom, newZoom)
	{
		var state = CzfPanel.getState();
		
		if (newZoom <= 16)
		{
			state.aponly = 1;
			state.bbonly = 1;
		}
		
		if (newZoom <= 14)
		{
			state.actlink = 1;
			state.actnode = 1;
		}
		
		CzfPanel.setState(state);
	},
	
	clicked: function(overlay, point)
	{
		if (overlay && overlay.nodeid)
			CzfPanel.showInfo(overlay.nodeid);
	},
	
	loadIcons: function()
	{
		var types = [0,1,9,10,98,99];
		var states = [1,40,79,80,90];
		
		for (i in types)
			for (j in states)
			{
				iconindex = types[i] * 100 + states[j];
				this.icons[iconindex] = new GIcon();
				this.icons[iconindex].image = "/images/node/" + types[i] + "-" + states[j] + ".png";
				this.icons[iconindex].iconSize = new GSize(15,15);
				this.icons[iconindex].iconAnchor = new GPoint(7,7);
			}
	},
	
	loadData: function(state)
	{
		urlParams = new Object();
		
		var bounds = this.map.getBounds();
		urlParams.north = bounds.getNorthEast().lat();
		urlParams.east = bounds.getNorthEast().lng();
		urlParams.south = bounds.getSouthWest().lat();
		urlParams.west = bounds.getSouthWest().lng();
		
		for (i in state)
			if (i in this.ajaxParams)
				urlParams[i] = state[i];
		
		var query = "?";
		for (i in urlParams)
			query += i + "=" + urlParams[i] + "&";
		
		GDownloadUrl("ajax/data.php" + query, this.methodCall(this.readData));
	},
	
	readData: function(doc)
	{
		var state = CzfPanel.getState();
		var jsonData = eval('(' + doc + ')');
		this.map.clearOverlays();
		
		for (i in jsonData.points)
		{
			var point = jsonData.points[i];
			var latlng = new GLatLng(point.lat, point.lng); 
			var iconindex = point.type * 100 + point.status;
			var options = { icon: this.icons[iconindex], title: point.label };
			var marker = state.hidelabels ? new GMarker(latlng, options)
			                              : new CzfMarker(latlng, options);
			marker.nodeid = point.id;
			this.map.addOverlay(marker);
		}
		
		if (state.hidelinks)
			return;
		
		for (i in jsonData.links)
		{
			var link = jsonData.links[i];
			var latlng1 = new GLatLng(link.lat1, link.lng1);
			var latlng2 = new GLatLng(link.lat2, link.lng2);
			
			var linePoints = [ latlng1, latlng2 ];
			var color = this.mediaColors[link.media];
			var width = link.backbone ? 3 : 1;
			var opacity = link.active ? 1 : 0.4;
			
			this.map.addOverlay(new GPolyline(linePoints, "black", width + 2, opacity));
			this.map.addOverlay(new GPolyline(linePoints, color, width, opacity));
		}
	},
	
	methodCall: function(fn)
	{
		var _this = this;
		return function() { fn.apply(_this, arguments); };
	}
}