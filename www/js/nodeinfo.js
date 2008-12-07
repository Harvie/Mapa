var CzfNodeInfo =
{
	info: null,
	element: null,
	editData: new Object(),
	
	initialize: function(element)
	{
		this.element = element;
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
		if (this.info && this.info.editing)
			this.copyFormData();
		
		this.info = newInfo;
		this.updateMarker();
		this.updateInfo();
	}
	,
	updateInfo: function()
	{
		var html;
		
		if (this.info)
			if (this.info.editing)
				html = this.createEdit(this.info);
			else
				html = this.createInfo(this.info);
		else
			html = "";
		
		this.element.innerHTML = html;
	}
	,
	updateMarker: function()
	{
		CzfMap.removeMarker();
		
		if (this.info && this.info.editing)
		{
			var pos = new GLatLng(this.info.lat, this.info.lng);
			var callback = this.methodCall(this.markerMoved);
			CzfMap.addMarker(pos, callback);
		}
	}
	,
	showPeer: function(linknum)
	{
		link = this.info.links[linknum];
		CzfMain.setNode(link.peerid);
		CzfMain.setPos(link.lat, link.lng);
		return false;
	}
	,
	editNode: function()
	{
		this.info.editing = true;
		this.editData[this.info.id] = this.info;
		
		this.updateMarker();
		this.updateInfo();
	}
	,
	addNode: function()
	{
		if (this.editData["new"])
		{
			this.setInfo(this.editData["new"]);
			return false;
		}
		
		info = CzfConst.clone("newInfo");
		info.editing = true;
		
		var latlng = CzfMap.getCenter();
		info.lat = latlng.lat();
		info.lng = latlng.lng();
		
		this.editData["new"] = info;
		this.setInfo(info);
		return false;
	}
	,
	markerMoved: function(pos)
	{
		this.info.lat = pos.lat();
		this.info.lng = pos.lng();
		this.info.moved = true;
		
		this.copyFormData();
		this.updateInfo();
	}
	,
	copyFormData: function()
	{
		if (!document.nodeform)
			return;
		
		var fields = [ "name", "type", "status", "url_thread", "url_photos",
		               "url_homepage", "address", "visibility" ];
		
		for (i in fields)
			this.info[fields[i]] = document.nodeform[fields[i]].value;
	}
	,
	save: function()
	{
		document.nodeform.save.disabled = true;
		document.nodeform.cancel.disabled = true;
		
		this.copyFormData();
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
			document.nodeform.save.disabled = false;
			document.nodeform.cancel.disabled = false;
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
	createInfo: function(info)
	{
		var html = CzfHtml.button("edit", tr("Edit node"), "CzfNodeInfo.editNode()");
		
		html += '<p>';
		html += CzfHtml.info(tr("Node ID"), info.id);
		html += CzfHtml.info(tr("Name"), info.name);
		html += CzfHtml.info(tr("Type"), CzfConst.nodeTypes[info.type]);
		html += CzfHtml.info(tr("Status"), CzfConst.nodeStates[info.status]);
		html += '</p>';
		
		html += '<p>';
		if (info.url_thread)
			html += CzfHtml.link(tr("Thread"), info.url_thread) + " ";
		if (info.url_photos)
			html += CzfHtml.link(tr("Photos"), info.url_photos) + " ";
		if (info.url_homepage)
			html += CzfHtml.link(tr("Homepage"), info.url_homepage) + " ";
		html += '</p>';
		
		html += CzfHtml.longInfo(tr("Coordinates"),
				this.roundAngle(info.lat) + "&nbsp;&nbsp;" + this.roundAngle(info.lng));
		
		if (info.address)
			html += CzfHtml.longInfo(tr("Address"), info.address);
		if (info.visibility)
			html += CzfHtml.longInfo(tr("Visibility description"), info.visibility);
		
		if (info.links && info.links.length > 0)
			html += CzfLinkInfo.createInfo(info);
		
		return html;
	}
	,
	createEdit: function(info)
	{
		var html = '';
		
		html += '<p>';
		html += CzfHtml.edit("name", tr("Name"), info.name);
		html += CzfHtml.select("type", tr("Type"), info.type, CzfConst.nodeTypes);
		html += CzfHtml.select("status", tr("Status"), info.status, CzfConst.nodeStates);
		html += '</p>';
		
		html += '<p>';
		html += CzfHtml.edit("url_thread", tr("Thread"), info.url_thread);
		html += CzfHtml.edit("url_photos", tr("Photos"), info.url_photos);
		html += CzfHtml.edit("url_homepage", tr("Homepage"), info.url_homepage);
		html += '</p>';
		
		html += CzfHtml.longEdit("address", tr("Address"), info.address);
		html += CzfHtml.longEdit("visibility", tr("Visibility description"), info.visibility);
		
		html += CzfHtml.longInfo(tr("Coordinates"),
				this.roundAngle(info.lat) + "&nbsp;&nbsp;" + this.roundAngle(info.lng));
		
		html += '<p>';
		html += CzfHtml.button("save", tr("Save"), "CzfNodeInfo.save()");
		html += "&nbsp;&nbsp;";
		html += CzfHtml.button("cancel", tr("Cancel"), "CzfNodeInfo.cancelEdit()");
		html += '</p>';
		
		if (info.links && info.links.length > 0)
			html += CzfLinkInfo.createInfo(info);
		
		return CzfHtml.form(html, "nodeform", "return CzfNodeInfo.save();");
	}
	,
	roundAngle: function(angle)
	{
		return Math.round(angle * 100000) / 100000;
	}
	,
	methodCall: function(fn)
	{
		var _this = this;
		return function() { fn.apply(_this, arguments); };
	}
}
