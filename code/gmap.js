var CzfMap =
{
	mediaColors: [ "#000", "#0C0", "#A22", "#8DF", "#A2A", "#0FF", "#F00", "#CCC", "#FFF", "#F80" ],
	defaultPos: { lat: 50.006915, lng: 14.422809, zoom: 18 },
	icons: new Object(),
	map: null,
	
	initialize: function(mapID, panelID)
	{
		if (GBrowserIsCompatible())
		{
			CzfPanel.initialize(panelID);
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
		var bounds = this.map.getBounds();
		var north = bounds.getNorthEast().lat();
		var east = bounds.getNorthEast().lng();
		var south = bounds.getSouthWest().lat();
		var west = bounds.getSouthWest().lng();
		
		var query = "?north=" + north + "&east=" + east + "&south=" + south + "&west=" + west;
		if (state.aponly) query += "&aponly=1";
		if (state.bbonly) query += "&bbonly=1";
		if (state.actnode) query += "&actnode=1";
		if (state.actlink) query += "&actlink=1";
		
		GDownloadUrl("data.php" + query, this.methodCall(this.readData));
	},
	
	readData: function(doc)
	{
		var jsonData = eval('(' + doc + ')');
		this.map.clearOverlays();
		
		for (i in jsonData.points)
		{
			var point = jsonData.points[i];
			var latlng = new GLatLng(point.lat, point.lng); 
			var iconindex = point.type * 100 + point.status;
			var options = { icon: this.icons[iconindex], title: point.label };
			var marker = new CzfMarker(latlng, options);
			this.map.addOverlay(marker);
		}
		
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
	},
}
