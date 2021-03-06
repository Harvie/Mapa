var CzfMain =
{
	state: null,
	defaults: { lat: 50.087803, lng: 14.406481, zoom: 15, tilt: 0, heading: 0, autofilter: 1, type: "satellite" },
	
	start: function(mapID, panelID)
	{
		var map = document.getElementById(mapID);
		var panel = document.getElementById(panelID);
		
		CzfLang.initialize();
		CzfMap.initialize(map, !panel);
		this.initPanel(panel);
		
		var callback = CzfMain.callback(this, this.anchorChanged);
		CzfAnchor.initialize(callback, this.defaults);
	}
	,
	initPanel: function(element)
	{
		document.title = tr("SPOJE.NET Node Monitor");
		
		if (element)
		{
			var html = this.createUserInfo();
			html += "<h1>" + document.title + "</h1>";
			
			html += '<div class="subtitle">';
			html += CzfHtml.link(tr("CZF Mapa"), "http://mapa.czfree.net");
			if (CzfConfig.nodeRights.edit)
				html += " " + CzfHtml.click(tr("Create new node"), "CzfInfo.addNode()");
			html += '</div>';
			
			html += CzfHtml.panelPart(this.createLegend(), "legend", tr("Legend"));
			html += CzfHtml.panelPart("", "search", tr("Search"));
			html += CzfHtml.panelPart("", "filters", tr("Filters"));
			html += CzfHtml.panelPart("", "info", tr("Node info"));
			element.innerHTML = html;
		}
		
		CzfSearch.initialize(document.getElementById("search"));
		CzfFilters.initialize(document.getElementById("filters"));
		CzfInfo.initialize(document.getElementById("info"));
		
		if (element)
		{
			CzfHtml.togglePanel("search");
			CzfHtml.togglePanel("info");
		}
	}
	,
	createUserInfo: function()
	{
		var html = '<div id="userinfo">';
		html += tr("User") + ": ";
		
		if (CzfConfig.user.id == 0)
			html += tr("not logged in");
		else
			html += CzfConfig.user.name;
		
		return html + '</div>';
	}
	,
	createLegend: function()
	{
		return this.createTypeLegend()
		     + this.createStatusLegend()
		     + this.createMediaLegend();
	}
	,
	createTypeLegend: function()
	{
		var nodeTypes = tr("nodeTypes");
		var rows = new Array();
		
		for (i in nodeTypes)
		{
			var img = CzfHtml.img("", CzfMap.getNodeImg(i,1));
			rows.push( [img, nodeTypes[i]] );
		}
		
		return tr("Node types") + ":" + CzfHtml.table(rows);
	}
	,
	createStatusLegend: function()
	{
		var nodeStates = tr("nodeStates");
		var rows = new Array();
		
		for (i in nodeStates)
		{
			var img = CzfHtml.img("", CzfMap.getNodeImg(1,i));
			rows.push( [img, nodeStates[i]] );
		}
		
		return tr("Node states") + ":" + CzfHtml.table(rows);
	}
	,
	createMediaLegend: function()
	{
		var mediaNames = tr("linkMedia");
		var mediaInfo = tr("mediaInfo");
		var rows = new Array();
		
		for (i in mediaNames)
		{
			var style = "background-color: " + CzfMap.getLinkColor(i);
			var square = CzfHtml.elem("div", { "class": "square", style: style }, "");
			var label = CzfHtml.expl(mediaInfo[i], mediaNames[i]);
			rows.push( [square, label] );
		}
		
		return tr("Link types") + ":" + CzfHtml.table(rows);
	}
	,
	getState: function()
	{
		return this.state;
	}
	,
	setState: function(newState)
	{
		this.state = newState;
		CzfAnchor.update(this.state);
	}
	,
	anchorChanged: function(newState)
	{
		this.state = newState;
		
		var showOnMap = !!this.state.goto;
		if (this.state.goto)
			delete this.state.goto;
		
		var newNodeMarker = !!this.state.newnode;
		if (this.state.newnode)
			delete this.state.newnode;
		
		if (this.state.node)
			this.setNode(this.state.node, showOnMap);
		
		if (this.state.geolocate)
			CzfSearch.remoteAddressSearch(this.state.geolocate, showOnMap, newNodeMarker);
		
		CzfFilters.updateControls(this.state);
		CzfMap.setPosition(this.state);
	}
	,
	setPos: function(lat, lng)
	{
		this.state.lat = lat
		this.state.lng = lng;
		this.state.zoom = 17;
		CzfMap.setPosition(this.state);
	}
	,
	setGeolocate: function(address)
	{
		this.state.geolocate = address;
		CzfAnchor.update(this.state);
	}
	,
	setNode: function(nodeid, showOnMap)
	{
		this.state.node = nodeid;
		CzfAnchor.update(this.state);
		CzfInfo.setNode(nodeid, showOnMap);
	}
	,
	postMessage: function(type, values)
	{
		var msg = type + "\n" + values.join("\n");
		parent.postMessage(msg, "*");
	}
	,
	clone: function(obj)
	{
		copy = new Object();
		
		for (i in obj)
			copy[i] = obj[i];
		
		return copy;
	}
	,
	callback: function(object, method)
	{
		return function() { method.apply(object, arguments); };
	}
}
