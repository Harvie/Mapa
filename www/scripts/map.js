var CzfMap =
{
	min45DegreesZoom: 18,
	mediaColors: { 0: "#000000",  1: "#008800",  7: "#888888", 12: "#CCCCCC", 8: "#FFFFFF", 
                       13: "#FF9999", 14: "#88FF00", 10: "#FFFF00", 2: "#AA0000", 6: "#FF2222",
                       3: "#66CCFF", 4: "#AA22AA", 9: "#FFBB00", 11: "#0000FF", 5: "#00FFFF",    
                       97: "#C88FE7", 98: "#ff7f27", 99: "#777733" },
	map: null,
	nodes: null,
	icons: {},
	overlays: [],
	
	initialize: function(element, embedded)
	{
		var options = {
			center: new google.maps.LatLng(CzfMain.defaults.lat, CzfMain.defaults.lng),
			zoom: CzfMain.defaults.zoom,
			mapTypeId: google.maps.MapTypeId.SATELLITE,
			disableDefaultUI: true };
		
		if (!embedded)
		{
			options.panControl = true;
			options.zoomControl = true;
			options.mapTypeControl = true;
			options.overviewMapControl = true;
			options.scaleControl = true;
		}
		
		this.map = new google.maps.Map(element, options);
		this.drawMapperRect();
		this.loadIcons();
		
		this.bindEvent("idle", this.moved);
		this.bindEvent("zoom_changed", this.zoomed);
		this.bindEvent("maptypeid_changed", this.typeChanged);
		this.bindEvent("tilt_changed", this.tiltChanged);
		this.bindEvent("heading_changed", this.tiltChanged);
		this.bindEvent("rightclick", this.rightClick);
	}
	,
	bindEvent: function(eventName, eventHandler)
	{
		google.maps.event.addListener(this.map, eventName,
		                              CzfMain.callback(this, eventHandler));
	}
	,
	setPosition: function(state)
	{
		var lat = parseFloat(state.lat);
		var lng = parseFloat(state.lng);
		var zoom = parseInt(state.zoom);
		var tilt = parseInt(state.tilt);
		var heading = parseInt(state.heading);
		
		var type = google.maps.MapTypeId.SATELLITE;
		switch (state.type)
		{
			case "m":
			case "roadmap":
				type = google.maps.MapTypeId.ROADMAP;
				break;
			
			case "h":
			case "hybrid":
				type = google.maps.MapTypeId.HYBRID;
				break;
			
			case "t":
			case "terrain":
				type = google.maps.MapTypeId.TERRAIN;
				break;
		}
		
		this.map.setCenter(new google.maps.LatLng(lat, lng));
		this.map.setZoom(zoom);
		this.map.setMapTypeId(type);
		this.map.setTilt(tilt);
		this.map.setHeading(heading);
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
			this.clearMap();
		else
			this.loadData(state);
	}
	,
	zoomed: function()
	{
		CzfFilters.updateAutoFilter(this.map.getZoom());
	}
	,
	typeChanged: function()
	{
		var state = CzfMain.getState();
		state.type = this.map.getMapTypeId();
		CzfMain.setState(state);
	}
	,
	tiltChanged: function()
	{
		if ((this.map.getZoom() < this.min45DegreesZoom) ||
		    ((this.map.getMapTypeId() != google.maps.MapTypeId.SATELLITE) &&
		     (this.map.getMapTypeId() != google.maps.MapTypeId.HYBRID)) )
			return;
		
		var state = CzfMain.getState();
		state.tilt = this.map.getTilt();
		state.heading = this.map.getHeading();
		CzfMain.setState(state);
	}
	,
	nodeClick: function()
	{
		CzfMain.setNode(this.czfNode.id);
	}
	,
	nodeRightClick: function()
	{
		CzfLinkInfo.nodeRightClick(this.czfNode);
		return false;
	}
	,
	rightClick: function(event)
	{
		CzfLinkInfo.rightClick(event.latLng);
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
				var icon = {
					url: this.getNodeImg(t,s),
					size: new google.maps.Size(15,15),
					anchor: new google.maps.Point(7,7) };
				
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
		if (state.testnode)   urlParams.nodes.status_include = [10,40,79,80,90];
		if (state.onlynonagr)   urlParams.nodes.status_include = [40,79];
		if (state.onlyinplan)   urlParams.nodes.status_include = [80];
		if (state.onlyconstruct)   urlParams.nodes.status_include = [10,79];
		if (!state.obsolete) urlParams.nodes.status_exclude = [90];
		if (!state.alien)    urlParams.nodes.type_exclude = [99];
		if (state.netfilter) urlParams.nodes.network_include = [state.netfilter];
		
		urlParams.links = new Object();
		if (state.bbonly)    urlParams.links.backbone_include = [1];
		if (state.actlink)   urlParams.links.active_include = [1];
		if (!state.vpn)      urlParams.links.media_exclude = [5,11];
		
		CzfAjax.get("data", urlParams, CzfMain.callback(this, this.readData));
	}
	,
	readData: function(jsonData)
	{
		var state = CzfMain.getState();
		this.clearMap();
		this.drawNodes(jsonData.nodes, state.hidelabels);
		if (!state.hidelinks)
			this.drawLinks(jsonData.links, state.hidelabels);
		this.nodes = jsonData.nodes;
	}
	,
	clearMap: function()
	{
		while(this.overlays[0])
			this.overlays.pop().setMap(null);
	}
	,
	drawNodes: function(nodes, hidelabels)
	{
		for (i in nodes)
		{
			var node = nodes[i];
			var latlng = new google.maps.LatLng(node.lat, node.lng);
			var iconindex = node.type * 100 + node.status;
			var zIndex = 2 * (node.status == 1) + (node.type >= 9 && node.type <= 11);
			var options = { map: this.map,
			                title: "" + node.name,
			                position: latlng,
			                icon: this.icons[iconindex],
			                zIndex: zIndex };
			
			var marker = new google.maps.Marker(options);
			marker.czfNode = node;
			google.maps.event.addListener(marker, "click", this.nodeClick);
			google.maps.event.addListener(marker, "rightclick", this.nodeRightClick);
			this.overlays.push(marker);
			
			if (!hidelabels && node.type != 97)
			{
				var label = new CzfLabel(marker);
				this.overlays.push(label);
			}
		}
	}
	,
	drawLinks: function(links)
	{
		var zIndex = -1000000;
		
		for (i in links)
		{
			var link = links[i];
			var latlng1 = new google.maps.LatLng(link.lat1, link.lng1);
			var latlng2 = new google.maps.LatLng(link.lat2, link.lng2);
			
			var options = {
				map: this.map,
				path: [ latlng1, latlng2 ],
				strokeColor: "#000000",
				strokeWeight: link.backbone ? 5 : 3,
				strokeOpacity: link.active ? 1 : 0.4,
				zIndex: zIndex++,
				clickable: false
			};
			this.overlays.push(new google.maps.Polyline(options));
			
			options.strokeColor = this.mediaColors[link.media];
			options.strokeWeight -= 2;
			options.zIndex = zIndex++;
			this.overlays.push(new google.maps.Polyline(options));
		}
	}
	,
	drawMapperRect: function()
	{
		if (CzfConfig.mapperArea && !CzfConfig.mapperArea.global)
		{
			var area = CzfConfig.mapperArea;
			var corners = [
				new google.maps.LatLng(area.north, area.west),
				new google.maps.LatLng(area.north, area.east),
				new google.maps.LatLng(area.south, area.east),
				new google.maps.LatLng(area.south, area.west),
				new google.maps.LatLng(area.north, area.west)
			];
		
			var options = {
				map: this.map,
				paths: corners,
				strokeColor: "#FF0000",
				strokeOpacity: 1,
				strokeWeight : 1,
				fillOpacity: 0 };
			
			var rect = new google.maps.Polygon(options);
			google.maps.event.addListener(rect, "rightclick", this.rightClick);
		}
	}
	,
	createMarker: function(options)
	{
		var pos = new google.maps.LatLng(0,0);
		var marker = new google.maps.Marker({ position: pos, map: this.map });
		marker.setVisible(false);
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
