var CzfMain =
{
	defaults: { lat: 50.006915, lng: 14.422809, zoom: 15, autofilter: 1, type: "k" },
	
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
		
		var callback = GEvent.callback(this, this.anchorChanged);
		this.anchor = new CzfAnchor(callback, this.clone(this.defaults));
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
		html += CzfHtml.button("addnode", tr("New node"), "CzfInfo.addNode()");
		html += CzfHtml.expandableBlock("", "search", tr("Search"));
		html += CzfHtml.expandableBlock("", "filters", tr("Filters"));
		html += CzfHtml.expandableBlock("", "info", tr("Node info"));
		element.innerHTML = html;
		
		CzfSearch.initialize(document.getElementById("search"));
		CzfFilters.initialize(document.getElementById("filters"));
		CzfInfo.initialize(document.getElementById("info"));
		
		CzfHtml.toggle("search");
		CzfHtml.toggle("info");
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
		
		CzfInfo.setNode(nodeid);
	}
	,
	clone: function(obj)
	{
		copy = new Object();
		
		for (i in obj)
			copy[i] = obj[i];
		
		return copy;
	}
}
