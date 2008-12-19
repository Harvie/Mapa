var CzfInfo =
{
	actTab: null,
	tabs: null,
	headers: null,
	
	initialize: function(element)
	{
		this.tabs = [ { id: "nodeinfo", label: tr("Node"), contents: "" },
			          { id: "linkinfo", label: tr("Links"), contents: "" } ];
		
		element.innerHTML = this.createTabs(this.tabs);
		this.headers = document.getElementById("info.headers");
		
		CzfNodeInfo.initialize(document.getElementById("nodeinfo"));
		CzfLinkInfo.initialize(document.getElementById("linkinfo"));
	}
	,
	createTabs: function(tabs)
	{
		var headers = '<div id="info.headers">';
		for (i in tabs)
		{
			headers += '<span class="tab_label" id="' + tabs[i].id + '.header"';
			headers += 'onclick="CzfInfo.openTab(\'' + tabs[i].id + '\')">';
			headers += tabs[i].label + '</span> ';
		}
		headers += '</div>';
			
		var blocks = '<div id="info.tabs">';
		for (i in tabs)
		{
			blocks += '<div class="tab_block" id="' + tabs[i].id + '">';
			blocks += tabs[i].contents + '</div>';
		}
		blocks += '</div>';
		
		return headers + blocks;
	}
	,
	openTab: function(tabid)
	{
		if (this.actTab == tabid)
			return;
		
		if (this.actTab)
			this.hideTab(this.actTab);
		
		this.showTab(tabid);
		this.actTab = tabid;
	}
	,
	showTab: function(tabid)
	{
		document.getElementById(tabid).style.display = "block";
		document.getElementById(tabid + ".header").className = "active_tab_label";
	}
	,
	hideTab: function(tabid)
	{
		document.getElementById(tabid).style.display = "none";
		document.getElementById(tabid + ".header").className = "tab_label";
	}
	,
	enableTabs: function()
	{
		this.headers.style.display = "block";
		
		for (i in this.tabs)
			this.hideTab(this.tabs[i].id);
	}
	,
	disableTabs: function()
	{
		this.headers.style.display = "none";
		
		for (i in this.tabs)
			this.showTab(this.tabs[i].id);
	}
}
