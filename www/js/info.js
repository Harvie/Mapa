var CzfInfo =
{
	actTab: null,
	tabs: null,
	headers: null,
	info: null,
	editData: new Object(),
	
	initialize: function(element)
	{
		this.tabs = [ { id: "nodeinfo", label: tr("Node"), contents: "" },
			          { id: "linkinfo", label: tr("Links"), contents: "" } ];
		
		var html = CzfHtml.button("edit", tr("Edit node"), "CzfInfo.editNode()");
		html += this.createTabs(this.tabs);
		
		var buttons = '';
		buttons += CzfHtml.button("save", tr("Save"), "CzfInfo.save()");
		buttons += "&nbsp;&nbsp;";
		buttons += CzfHtml.button("cancel", tr("Cancel"), "CzfInfo.cancelEdit()");
		html += CzfHtml.form(buttons, "infoform", "return false;");
		
		element.innerHTML = html;
		this.headers = document.getElementById("info.headers");
		
		CzfNodeInfo.initialize(document.getElementById("nodeinfo"));
		CzfLinkInfo.initialize(document.getElementById("linkinfo"));
	}
	,
	setNode: function(nodeid)
	{
		if (this.editData[nodeid])
		{
			this.setInfo(this.editData[nodeid]);
			return;
		}
		
		CzfAjax.get("nodeinfo", { id: nodeid }, this.methodCall(this.setInfo));
	}
	,
	setInfo: function(newInfo)
	{
		this.info = newInfo;
		this.updateInfo();
	}
	,
	updateInfo: function()
	{
		CzfNodeInfo.setInfo(this.info);
		CzfLinkInfo.setInfo(this.info);
	}
	,
	addNode: function()
	{
		if (this.editData["new"])
		{
			this.setInfo(this.editData["new"]);
			return false;
		}
		
		info = CzfNodeInfo.createNode();
		this.editData["new"] = info;
		this.setInfo(info);
		return false;
	}
	,
	editNode: function()
	{
		this.info.editing = true;
		this.editData[this.info.id] = this.info;
		this.updateInfo();
	}
	,
	save: function()
	{
		document.infoform.save.disabled = true;
		document.infoform.cancel.disabled = true;
		
		CzfNodeInfo.copyFormData();
		CzfLinkInfo.copyFormData();
		CzfAjax.post("submit", this.info, this.methodCall(this.saveDone));
	}
	,
	saveDone: function(result)
	{
		if (result.error === undefined)
		{
			this.info.id = result.id;
			this.cancelEdit();
			CzfMap.moved();
		}
		else
		{
			alert(result.error);
			document.infoform.save.disabled = false;
			document.infoform.cancel.disabled = false;
		}
	}
	,
	cancelEdit: function()
	{
		delete this.editData[this.info.id];
		
		if (this.info.id == "new")
			this.setInfo(null)
		else
			this.setNode(this.info.id);
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
	,
	methodCall: function(fn)
	{
		var _this = this;
		return function() { fn.apply(_this, arguments); };
	}
}
