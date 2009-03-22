var CzfInfo =
{
	info: null,
	element: null,
	showOnMap: false,
	editData: new Object(),
	tabs: [ { id: "nodeinfo", label: "Info" },
	        { id: "linkinfo", label: "Links" } ],
	
	initialize: function(element)
	{
		this.element = element;
		
		CzfNodeInfo.initialize("nodeinfo");
		CzfLinkInfo.initialize("linkinfo");
		
		this.updateInfo();
	}
	,
	setNode: function(nodeid, showOnMap)
	{
		this.showOnMap = showOnMap;
		
		if (this.editData[nodeid])
		{
			this.setInfo(this.editData[nodeid]);
			return;
		}
		
		if (nodeid == 0)
		{
			this.setInfo(null);
			return;
		}
		
		CzfAjax.get("nodeinfo", { id: nodeid }, GEvent.callback(this, this.setInfo));
	}
	,
	setInfo: function(newInfo)
	{
		this.info = newInfo;
		this.updateInfo();
		
		if (this.showOnMap)
		{
			this.showOnMap = false;
			this.center();
		}
	}
	,
	updateInfo: function()
	{
		this.element.innerHTML = this.createHTML();
		
		if (this.info && this.info.editing)
			this.showTab(this.info.actTab);
		
		CzfNodeInfo.setInfo(this.info);
		CzfLinkInfo.setInfo(this.info);
	}
	,
	center: function()
	{
		CzfMain.setPos(this.info.lat, this.info.lng);
	}
	,
	addNode: function()
	{
		if (this.editData[0])
		{
			this.setInfo(this.editData[0]);
			return false;
		}
		
		var info = CzfNodeInfo.createNode();
		info.actTab = "nodeinfo";
		this.editData[0] = info;
		this.setInfo(info);
		return false;
	}
	,
	editNode: function()
	{
		this.info.editing = true;
		this.info.actTab = "nodeinfo";
		this.editData[this.info.id] = this.info;
		this.updateInfo();
	}
	,
	deleteNode: function()
	{
		var msg = "Do you really want to delete node '%s'? This action cannot be undone.";
		if (confirm(CzfLang.format(msg, this.info.name)))
		{
			this.info.deleteNode = true;
			this.submit();
		}
	}
	,
	save: function()
	{
		if (!CzfNodeInfo.checkForm())
			return;
		
		document.infoform.save.disabled = true;
		document.infoform.cancel.disabled = true;
		
		CzfNodeInfo.copyFormData();
		CzfLinkInfo.copyFormData();
		this.submit();
	}
	,
	submit: function()
	{
		CzfAjax.post("submit", this.info, GEvent.callback(this, this.saveDone));
	}
	,
	saveDone: function(result)
	{
		if (result.error === undefined)
		{
			delete this.editData[this.info.id];
			this.setNode(result.id);
			CzfMap.moved();
		}
		else
		{
			if (result.error == "DUPLICATE_NAME")
				alert(CzfLang.format("Node with name '%s' already exists.", this.info.name));
			else
				alert(result.error);
			
			document.infoform.save.disabled = false;
			document.infoform.cancel.disabled = false;
		}
	}
	,
	cancelEdit: function()
	{
		delete this.editData[this.info.id];
		this.setNode(this.info.id);
	}
	,
	copyFormData: function(fields, form, storage)
	{
		for (i in fields)
		{
			var value;
			var field = form[fields[i]];
			
			if (field === undefined)
				continue;
			
			if (field.type == "checkbox")
				value = field.checked ? 1 : 0;
			else //Convert to UNIX line breaks
				value = field.value.replace(/\r/g, "");
			
			storage[fields[i]] = (value === "") ? null : value;
		}
	}
	,
	createHTML: function()
	{
		var html = "";
		
		if (this.info && this.info.editing)
		{
			html += this.createTabs(this.tabs);
			var buttons = CzfHtml.button("save", tr("Save"), "CzfInfo.save()")
			            + CzfHtml.button("cancel", tr("Cancel"), "CzfInfo.cancelEdit()");
			html += CzfHtml.form(CzfHtml.p(buttons), "infoform", "return false;");
			html += CzfHtml.clear(true);
		}
		else
		{
			if (this.info && this.info.rights.edit)
			{
				html += CzfHtml.button("edit", tr("Edit"), "CzfInfo.editNode()");
				html += CzfHtml.button("edit", tr("Delete"), "CzfInfo.deleteNode()");
			}
			
			if (!this.info)
				html += CzfHtml.p(tr("Left click on a node on the map to display information."), "note");
			
			html += '<div id="nodeinfo"></div>';
			
			if (this.info)
				html += CzfHtml.p(CzfHtml.click(tr("Nodes in neighborhood"), "CzfInfo.showNeighb()"));
			
			html += '<div id="linkinfo"></div>';
		}
		
		return html;
	}
	,
	createTabs: function(tabs)
	{
		var headers = '<div id="info.headers">';
		for (i in tabs)
		{
			headers += '<span class="tab_label" id="' + tabs[i].id + '.header"';
			headers += 'onclick="CzfInfo.openTab(\'' + tabs[i].id + '\')">';
			headers += tr(tabs[i].label) + '</span> ';
		}
		headers += '</div>';
			
		var blocks = '<div id="info.tabs">';
		for (i in tabs)
			blocks += '<div class="tab_block" id="' + tabs[i].id + '"></div>';
		blocks += '</div>';
		
		return headers + blocks;
	}
	,
	openTab: function(tabid)
	{
		if (this.info.actTab == tabid)
			return;
		
		if (this.info.actTab)
			this.hideTab(this.info.actTab);
		
		this.showTab(tabid);
		this.info.actTab = tabid;
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
	userLink: function(userInfo)
	{
		return CzfHtml.link(userInfo.name, userInfo.profile)
	}
	,
	showNeighb: function()
	{
		this.element.innerHTML = CzfNeighb.createHTML(this.info);
	}
}
