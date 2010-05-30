var CzfMap =
{
	mediaColors: { 0: "#000000", 1: "#00CC00", 2: "#BB0000", 3: "#66CCFF", 4: "#AA22AA", 5: "#00FFFF", 6: "#FF4444",
	               7: "#CCCCCC", 8: "#FFFFFF", 9: "#FF8800", 10: "#FFFF00", 11: "#0000FF", 99: "#777733" },
	map: null,
	nodes: null,
	icons: new Object(),
	markers: new Array(),
	
	initialize: function(element, embedded)
	{
		this.map = new GMap2(element);
		
		if (!embedded)
		{
			this.map.addControl(new GLargeMapControl());
			this.map.addControl(new GMapTypeControl());
			this.map.addControl(new GOverviewMapControl());
			this.map.addControl(new GScaleControl());
		}
		
		this.map.enableScrollWheelZoom();
		this.map.enableDoubleClickZoom();
		
		this.loadIcons();
		
		GEvent.bind(this.map, "moveend", this, this.moved);
		GEvent.bind(this.map, "resize", this, this.moved);
		GEvent.bind(this.map, "zoomend", this, this.zoomed);
		GEvent.bind(this.map, "click", this, this.clicked);
		GEvent.bind(this.map, "maptypechanged", this, this.typeChanged);
		GEvent.bind(this.map, "singlerightclick", this, this.rightClick);
	}
	,
	setPosition: function(state)
	{
		switch (state.type)
		{	//The API has conversion to string, but not the other way around
			case "m": this.map.setMapType(G_NORMAL_MAP); break;
			case "h": this.map.setMapType(G_HYBRID_MAP); break;
			default: this.map.setMapType(G_SATELLITE_MAP); break;
		}
		
		var lat = parseFloat(state.lat);
		var lng = parseFloat(state.lng);
		var zoom = parseInt(state.zoom);
		
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
			this.drawBasic();
		else
			this.loadData(state);
	}
	,
	zoomed: function(oldZoom, newZoom)
	{
		CzfFilters.updateAutoFilter(newZoom);
	}
	,
	typeChanged: function()
	{
		var state = CzfMain.getState();
		state.type = this.map.getCurrentMapType().getUrlArg();
		CzfMain.setState(state);
	}
	,
	clicked: function(overlay, point)
	{
		// Hack for Opera (no right click support)
		if (window.event && window.event.shiftKey)
			return this.rightClick(point, null, overlay);
		
		if (overlay && overlay.czfNode)
			CzfMain.setNode(overlay.czfNode.id);
	}
	,
	rightClick: function(point, src, overlay)
	{
		if (overlay && overlay.czfNode)
			CzfLinkInfo.rightClick(overlay.czfNode);
	}
	,
	getLinkColor: function(type)
	{
		return this.mediaColors[type];
	}
	,
	getNodeImg: function(type, status)
	{
		return "images/node/" + type + "-" + status + ".png"
	}
	,
	loadIcons: function()
	{
		for (t in tr("nodeTypes"))
			for (s in tr("nodeStates"))
			{
				var icon = new GIcon();
				icon.image = this.getNodeImg(t,s);
				icon.iconSize = new GSize(15,15);
				icon.iconAnchor = new GPoint(7,7);
				
				var iconindex = parseInt(t) * 100 + parseInt(s);
				this.icons[iconindex] = icon;
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
		if (!state.vpn)      urlParams.links.media_exclude = [5,11];

		CzfAjax.get("data", urlParams, GEvent.callback(this, this.readData));
	}
	,
	readData: function(jsonData)
	{
		var state = CzfMain.getState();
		this.nodes = jsonData.nodes;
		this.drawBasic();
		
		for (i in jsonData.nodes)
		{
			var node = jsonData.nodes[i];
			var latlng = new GLatLng(node.lat, node.lng);
			var iconindex = node.type * 100 + node.status;
			var options = { title: node.name,
			                icon: this.icons[iconindex],
			                zIndexProcess: this.zIndexProcess };
			
			if (state.hidelabels || node.type == 97)
				var marker = new GMarker(latlng, options)
			else
				var marker = new CzfMarker(latlng, options);
			
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
			var color = this.mediaColors[link.media];
			var width = link.backbone ? 3 : 1;
			var opacity = link.active ? 1 : 0.4;
			
			this.map.addOverlay(new GPolyline(linePoints, "#000000", width + 2, opacity));
			this.map.addOverlay(new GPolyline(linePoints, color, width, opacity));
		}
	}
	,
	zIndexProcess: function(marker)
	{
		if (marker.czfNode === undefined)
			return 0;
		
		var status = marker.czfNode.status;
		var type = marker.czfNode.type;
		
		//Put active nodes and access points in front
		return 2 * (status == 1) + (type >= 9 && type <= 11);
	}
	,
	drawBasic: function()
	{
		this.map.clearOverlays();
		
		if (CzfConfig.mapperArea && !CzfConfig.mapperArea.global)
		{
			var area = CzfConfig.mapperArea;
			var corners = [
				new GLatLng(area.north, area.west),
				new GLatLng(area.north, area.east),
				new GLatLng(area.south, area.east),
				new GLatLng(area.south, area.west),
				new GLatLng(area.north, area.west)
			];
		
			var rect = new GPolygon(corners, "#FF0000", 1, 1, 0, 0);
			this.map.addOverlay(rect);
		}
		
		for (i in this.markers)
		{	//Bug workaround: hidden marker is shown
			var marker = this.markers[i];
			var isHidden = marker.isHidden();
			this.map.addOverlay(marker);
			if (isHidden) marker.hide();
		}
	}
	,
	createMarker: function(options)
	{
		var pos = new GLatLng(0,0);
		var marker = new GMarker(pos, options);
		marker.hide();
		
		this.markers.push(marker);
		return marker;
	}
	,
	getCenter: function()
	{
		return this.map.getCenter();
	}
	,
	getNodes: function()
	{
		return this.nodes;
	}
}
