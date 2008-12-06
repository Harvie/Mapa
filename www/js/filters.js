var CzfFilters =
{
	state: new Object(),
	filters: null,
	
	initialize: function(element)
	{
		this.filters = element;
		
		var html = "";
		html += CzfHtml.checkbox("hideall", tr("Hide everything"), "CzfFilters.changed(this)");
		html += CzfHtml.checkbox("hidelabels", tr("Hide labels"), "CzfFilters.changed(this)");
		html += CzfHtml.checkbox("hidelinks", tr("Hide lines"), "CzfFilters.changed(this)");
		html += CzfHtml.checkbox("autofilter", tr("Automatic filter"), "CzfFilters.changed(this)");
		
		html += tr("Node filter") + ":<br/>";
		html += CzfHtml.checkbox("actnode", tr("Only active"), "CzfFilters.changed(this)");
		html += CzfHtml.checkbox("aponly", tr("Only AP"), "CzfFilters.changed(this)");
		html += CzfHtml.checkbox("obsolete", tr("Show obsolete"), "CzfFilters.changed(this)");
		html += CzfHtml.checkbox("alien", tr("Show non-czfree"), "CzfFilters.changed(this)");
		
		html += tr("Link filter") + ":<br/>";
		html += CzfHtml.checkbox("actlink", tr("Only active"), "CzfFilters.changed(this)");
		html += CzfHtml.checkbox("bbonly", tr("Only backbone"), "CzfFilters.changed(this)");
		html += CzfHtml.checkbox("vpn", tr("Show VPN links"), "CzfFilters.changed(this)");
		
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
				child.checked = !!state[child.name];
				if (CzfConst.autoFilter[child.name])
					child.disabled = !!state.autofilter;
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
				this.updateControls(state);
		}
		
		CzfMain.setState(state);
		CzfMap.moved();
	}
}
