var CzfMap =
{
	icons: new Object(),
	map: null,
	marker: null,
	
	initialize: function(mapID, panelID)
	{
		if (GBrowserIsCompatible())
		{
			CzfLang.setLang("cs_CZ");
			this.show(document.getElementById(mapID));
			CzfPanel.initialize(panelID);
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
		
		this.map.enableScrollWheelZoom();
		this.map.enableDoubleClickZoom();
		
		this.loadIcons();
		
		GEvent.addListener(this.map, "moveend", this.methodCall(this.moved));
		GEvent.addListener(this.map, "zoomend", this.methodCall(this.zoomed));
		GEvent.addListener(this.map, "click", this.methodCall(this.clicked));
		GEvent.addListener(this.map, "maptypechanged", this.methodCall(this.typechanged));
	},
	
	setPosition: function(state)
	{
		var lat = state.lat ? parseFloat(state.lat) : CzfConst.defaults.lat;
		var lng = state.lng ? parseFloat(state.lng) : CzfConst.defaults.lng;
		var zoom = state.zoom ? parseInt(state.zoom) : CzfConst.defaults.zoom;
		var type = state.type ? state.type : CzfConst.defaults.type;
		
		switch (type)
		{	//The API has conversion to string, but not the other way around
			case "m": this.map.setMapType(G_NORMAL_MAP); break;
			case "h": this.map.setMapType(G_HYBRID_MAP); break;
			default: this.map.setMapType(G_SATELLITE_MAP); break;
		}
		
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
	
	typechanged: function()
	{
		var state = CzfPanel.getState();
		state.type = this.map.getCurrentMapType().getUrlArg();
		CzfPanel.setState(state);
	},
	
	clicked: function(overlay, point)
	{
		if (overlay && overlay.nodeid)
			CzfPanel.setNode(overlay.nodeid);
	},
	
	loadIcons: function()
	{
		for (t in CzfConst.nodeTypes)
			for (s in CzfConst.nodeStates)
			{
				iconindex = parseInt(t) * 100 + parseInt(s);
				this.icons[iconindex] = new GIcon();
				this.icons[iconindex].image = "images/node/" + t + "-" + s + ".png";
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
			if (i in CzfConst.ajaxParams)
				urlParams[i] = state[i];
		
		CzfAjax.get("data", urlParams, this.methodCall(this.readData));
	},
	
	readData: function(jsonData)
	{
		var state = CzfPanel.getState();
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
			var color = CzfConst.mediaColors[link.media];
			var width = link.backbone ? 3 : 1;
			var opacity = link.active ? 1 : 0.4;
			
			this.map.addOverlay(new GPolyline(linePoints, "#000000", width + 2, opacity));
			this.map.addOverlay(new GPolyline(linePoints, color, width, opacity));
		}
		
		if (this.marker)
			this.map.addOverlay(this.marker);
	},
	
	addMarker: function(pos, fn)
	{
		this.marker = new GMarker(pos, {draggable: true});
		this.map.addOverlay(this.marker);
		GEvent.addListener(this.marker, "dragend", fn);
	},
	
	removeMarker: function()
	{
		if (this.marker)
		{
			this.marker.hide();
			this.marker = null;
		}
	},
	
	getCenter: function()
	{
		return this.map.getCenter();
	},
	
	methodCall: function(fn)
	{
		var _this = this;
		return function() { fn.apply(_this, arguments); };
	}
}
