var CzfMap =
{
	icons: new Object(),
	map: null,
	marker: null,
	
	initialize: function(element)
	{
		this.map = new GMap2(element);
		
		this.map.addControl(new GLargeMapControl());
		this.map.addControl(new GMapTypeControl());
		this.map.addControl(new GOverviewMapControl());
		this.map.addControl(new GScaleControl());
		
		this.map.enableScrollWheelZoom();
		this.map.enableDoubleClickZoom();
		
		this.loadIcons();
		
		GEvent.bind(this.map, "moveend", this, this.moved);
		GEvent.bind(this.map, "resize", this, this.moved);
		GEvent.bind(this.map, "zoomend", this, this.zoomed);
		GEvent.bind(this.map, "click", this, this.clicked);
		GEvent.bind(this.map, "maptypechanged", this, this.typechanged);
		GEvent.bind(this.map, "singlerightclick", this, this.rightclick);
	}
	,
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
	}
	,
	moved: function()
	{
		var state = CzfMain.getState();
		state.lat = this.map.getCenter().lat();
		state.lng = this.map.getCenter().lng();
		state.zoom = this.map.getZoom();
		CzfMain.setState(state);
		
		if (state.hideall)
			this.map.clearOverlays();
		else
			this.loadData(state);
	}
	,
	zoomed: function(oldZoom, newZoom)
	{
		CzfFilters.updateAutoFilter(newZoom);
	}
	,
	typechanged: function()
	{
		var state = CzfMain.getState();
		state.type = this.map.getCurrentMapType().getUrlArg();
		CzfMain.setState(state);
	}
	,
	clicked: function(overlay, point)
	{
		if (overlay && overlay.czfNode)
			CzfMain.setNode(overlay.czfNode.id);
	}
	,
	rightclick: function(point, src, overlay)
	{
		if (overlay && overlay.czfNode)
			CzfLinkInfo.addLink(overlay.czfNode);
	}
	,
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
	}
	,
	loadData: function(state)
	{
		urlParams = new Object();
		
		var bounds = this.map.getBounds();
		urlParams.north = bounds.getNorthEast().lat();
		urlParams.east = bounds.getNorthEast().lng();
		urlParams.south = bounds.getSouthWest().lat();
		urlParams.west = bounds.getSouthWest().lng();
		
		urlParams.nodes = new Object();
		if (state.aponly)    urlParams.nodes.type_include = [9,10,11];
		if (state.actnode)   urlParams.nodes.status_include = [1];
		if (!state.obsolete) urlParams.nodes.status_exclude = [90];
		if (!state.alien)    urlParams.nodes.type_exclude = [99];
		
		urlParams.links = new Object();
		if (state.bbonly)    urlParams.links.backbone_include = [1];
		if (state.actlink)   urlParams.links.active_include = [1];
		if (!state.vpn)      urlParams.links.media_exclude = [5];

		CzfAjax.get("data", urlParams, GEvent.callback(this, this.readData));
	}
	,
	readData: function(jsonData)
	{
		var state = CzfMain.getState();
		this.map.clearOverlays();
		
		for (i in jsonData.nodes)
		{
			var node = jsonData.nodes[i];
			var latlng = new GLatLng(node.lat, node.lng); 
			var iconindex = node.type * 100 + node.status;
			var options = { icon: this.icons[iconindex], title: node.name };
			var marker = state.hidelabels ? new GMarker(latlng, options)
			                              : new CzfMarker(latlng, options);
			marker.czfNode = node;
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
	}
	,
	addMarker: function(pos, fn)
	{
		this.marker = new GMarker(pos, {draggable: true});
		this.map.addOverlay(this.marker);
		GEvent.addListener(this.marker, "dragend", fn);
	}
	,
	removeMarker: function()
	{
		if (this.marker)
		{
			this.marker.hide();
			this.marker = null;
		}
	}
	,
	getCenter: function()
	{
		return this.map.getCenter();
	}
}
