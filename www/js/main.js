var CzfMain =
{
	start: function(mapID, panelID)
	{
		if (!GBrowserIsCompatible())
		{
			alert("Please upgrade your browser.");
			return;
		}
		
		CzfLang.setLang("cs_CZ");
		
		CzfMap.initialize(document.getElementById(mapID));
		this.initPanel(document.getElementById(panelID));
		
		this.anchor = new CzfAnchor(this.methodCall(this.anchorChanged), CzfConst.clone("defaults"));
		this.anchor.update(this.state);
	}
	,
	stop: function()
	{
		GUnload();
	}
	,
	initPanel: function(element)
	{
		document.title = tr("CZFree Node Monitor");
		
		var html = "<h1>" + document.title + "</h1>";
		html += CzfHtml.button("addnode", tr("New node"), "CzfNodeInfo.addNode()");
		html += CzfHtml.expandableBlock("", "search", tr("Search"));
		html += CzfHtml.expandableBlock("", "filters", tr("Filters"));
		html += CzfHtml.expandableBlock("", "nodeinfo", tr("Node info"));
		element.innerHTML = html;
		
		CzfSearch.initialize(document.getElementById("search"));
		CzfFilters.initialize(document.getElementById("filters"));
		CzfNodeInfo.initialize(document.getElementById("nodeinfo"));
		
		CzfHtml.toggle("search");
		CzfHtml.toggle("nodeinfo");
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
		
		if (this.anchor)
			this.anchor.update(this.state);
	}
	,
	anchorChanged: function(newState)
	{
		this.state = newState;
		
		if (this.state.node)
			this.setNode(this.state.node);
		
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
	setNode: function(nodeid)
	{
		this.state.node = nodeid;
		
		if (this.anchor)
			this.anchor.update(this.state);
		
		CzfNodeInfo.setNode(nodeid);
	}
	,
	methodCall: function(fn)
	{
		var _this = this;
		return function() { fn.apply(_this, arguments); };
	}
}
