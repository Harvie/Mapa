var CzfFilters =
{
	autoFilter:  { actnode: 1, aponly: 1, actlink: 1, bbonly: 1 },
	state: new Object(),
	filters: null,
	
	initialize: function(element)
	{
		this.filters = element;
		
		var params = { onchange: "CzfFilters.changed(this)" };
		var html = "";
		
		html += CzfHtml.checkbox("hideall", tr("Hide everything"), false, params);
		html += CzfHtml.checkbox("hidelabels", tr("Hide labels"), false, params);
		html += CzfHtml.checkbox("hidelinks", tr("Hide lines"), false, params);
		html += CzfHtml.checkbox("autofilter", tr("Automatic filter"), false, params);
		
		html += tr("Node filter") + ":<br/>";
		html += CzfHtml.checkbox("actnode", tr("Only active"), false, params);
		html += CzfHtml.checkbox("aponly", tr("Only AP"), false, params);
		html += CzfHtml.checkbox("obsolete", tr("Show obsolete"), false, params);
		html += CzfHtml.checkbox("alien", tr("Show non-czfree"), false, params);
		
		html += tr("Link filter") + ":<br/>";
		html += CzfHtml.checkbox("actlink", tr("Only active"), false, params);
		html += CzfHtml.checkbox("bbonly", tr("Only backbone"), false, params);
		html += CzfHtml.checkbox("vpn", tr("Show VPN links"), false, params);
		
		this.filters.innerHTML = html;
	}
	,
	updateAutoFilter: function(newZoom)
	{
		var state = CzfMain.getState();
		
		if (state.autofilter)
		{
			if (newZoom <= 16)
			{
				state.aponly = 1;
				state.bbonly = 1;
			}
			else
			{
				delete state.aponly;
				delete state.bbonly;
			}
			
			if (newZoom <= 14)
			{
				state.actlink = 1;
				state.actnode = 1;
			}
			else
			{
				delete state.actlink;
				delete state.actnode;
			}
			
			this.updateControls(state);
		}
	}
	,
	updateControls: function(state)
	{
		for (i in this.filters.childNodes)
		{
			child = this.filters.childNodes[i];
			if (child.nodeName == "INPUT")
			{
				child.checked = (state[child.name] == 1);
				if (this.autoFilter[child.name])
					child.disabled = (state.autofilter == 1);
			}
		}
	}
	,
	changed: function(box)
	{
		var state = CzfMain.getState();
		
		if (box.checked)
			state[box.name] = 1;
		else
			delete state[box.name];
		
		if (box.name == "autofilter")
		{
			if (box.checked)
				this.updateAutoFilter(state.zoom);
			else
			{
				state["autofilter"] = 0; //It must exist
				this.updateControls(state);
			}
		}
		
		CzfMain.setState(state);
		CzfMap.moved();
	}
}
