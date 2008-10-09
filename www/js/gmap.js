var CzfMap =
{
	mediaColors: [ "#000", "#0C0", "#A22", "#8DF", "#A2A", "#0FF", "#F00", "#CCC", "#FFF", "#F80" ],
	ajaxParams:  { actnode: 1, aponly: 1, obsolete: 1, alien: 1, actlink: 1, bbonly: 1 },
	defaults:    { lat: 50.006915, lng: 14.422809, zoom: 15, autofilter: 1 },
	autoFilter:  { actnode: 1, aponly: 1, actlink: 1, bbonly: 1 },
	nodeTypes:   { 0: "Unknown", 1: "Client", 9: "Full AP", 10: "Steet access AP", 98: "InfoPoint", 99: "Non-CZF" },
	nodeStates:  { 1: "Active", 40: "In testing", 79: "Under (re)construction", 80: "In planning", 90: "Obsolete" },
	linkMedia:   { 0: "N/A", 1: "WiFi", 2: "FSO", 3: "Ethernet", 4: "Fiber", 5: "VPN", 6: "FSO + WiFi", 7: "5GHz", 8: "10GHz", 9: "FWA", 99: "Other" },
	
	icons: new Object(),
	map: null,
	
	initialize: function(mapID, panelID, infoID)
	{
		if (GBrowserIsCompatible())
		{
			this.show(document.getElementById(mapID));
			CzfPanel.initialize(panelID, infoID);
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
		
		this.loadIcons();
		
		GEvent.addListener(this.map, "moveend", this.methodCall(this.moved));
		GEvent.addListener(this.map, "zoomend", this.methodCall(this.zoomed));
		GEvent.addListener(this.map, "click", this.methodCall(this.clicked));
	},
	
	setPosition: function(state)
	{
		var lat = state.lat ? parseFloat(state.lat) : this.defaults.lat;
		var lng = state.lng ? parseFloat(state.lng) : this.defaults.lng;
		var zoom = state.zoom ? parseInt(state.zoom) : this.defaults.zoom;
		
		this.map.setCenter(new GLatLng(lat, lng), zoom);
	},
	
	moved: function()
	{
		var state = CzfPanel.getState();
		state.lat = this.map.getCenter().lat();
		state.lng = this.map.getCenter().lng();
		state.zoom = this.map.getZoom();
		CzfPanel.setState(state);
		
		if (state.hideall)
			this.map.clearOverlays();
		else
			this.loadData(state);
	},
	
	zoomed: function(oldZoom, newZoom)
	{
		CzfPanel.updateAutoFilter(newZoom);
	},
	
	clicked: function(overlay, point)
	{
		if (overlay && overlay.nodeid)
			CzfPanel.setNode(overlay.nodeid);
	},
	
	loadIcons: function()
	{
		for (t in this.nodeTypes)
			for (s in this.nodeStates)
			{
				iconindex = parseInt(t) * 100 + parseInt(s);
				this.icons[iconindex] = new GIcon();
				this.icons[iconindex].image = "/images/node/" + t + "-" + s + ".png";
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
