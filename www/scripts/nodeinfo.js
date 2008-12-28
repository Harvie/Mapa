var CzfNodeInfo =
{
	newInfo: { id: 0, name: "", type: 1, status: 80, url_thread: "", url_photos: "", url_homepage: "", address: "", visibility: "" },
	info: null,
	elementID: null,
	
	initialize: function(elementID)
	{
		this.elementID = elementID;
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
		var element = document.getElementById(this.elementID);
		
		// The form stays in DOM even after it's replaced
		if (document.nodeform)
			delete document.nodeform;
		
		if (this.info)
			if (this.info.editing)
				element.innerHTML = this.createEdit(this.info);
			else
				element.innerHTML= this.createInfo(this.info);
		else
			element.innerHTML = "";
	}
	,
	updateMarker: function()
	{
		CzfMap.removeMarker();
		
		if (this.info && this.info.editing)
		{
			var pos = new GLatLng(this.info.lat, this.info.lng);
			var callback = GEvent.callback(this, this.markerMoved);
			CzfMap.addMarker(pos, callback);
		}
	}
	,
	markerMoved: function(pos)
	{
		this.info.lat = pos.lat();
		this.info.lng = pos.lng();
		this.info.moved = true;
		
		this.copyFormData();
		CzfInfo.updateInfo();
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
	createNode: function()
	{
 		var info = CzfMain.clone(this.newInfo);
		info.links = new Array();
		info.editing = true;
		
		var latlng = CzfMap.getCenter();
		info.lat = latlng.lat();
		info.lng = latlng.lng();
		
		return info;
	}
	,
	createInfo: function(info)
	{
		var html = '';
		
		html += '<p>';
		html += CzfHtml.info(tr("Name"), info.name);
		html += CzfHtml.info(tr("Type"), tr("nodeTypes")[info.type]);
		html += CzfHtml.info(tr("Status"), tr("nodeStates")[info.status]);
		html += CzfHtml.info(tr("Owner"), CzfHtml.link(info.owner.name, info.owner.profile));
		
		var more = CzfHtml.info(tr("Node ID"), info.id);
		
		if (info.created)
		{
			more += CzfHtml.info(tr("Created on"), info.created.date);
			more += CzfHtml.info(tr("Created by"), CzfHtml.link(info.created.user, info.created.profile));
		}
		
		if (info.changed)
		{
			more += CzfHtml.info(tr("Changed on"), info.changed.date);
			more += CzfHtml.info(tr("Changed by"), CzfHtml.link(info.changed.user, info.changed.profile));
		}
		
		html += CzfHtml.hiddenBlock(more, "moreinfo", tr("More info..."));
		html += '</p>';
		
		html += '<p>';
		if (info.url_thread)
			html += CzfHtml.link(tr("Thread"), info.url_thread) + " ";
		if (info.url_photos)
			html += CzfHtml.link(tr("Photos"), info.url_photos) + " ";
		if (info.url_homepage)
			html += CzfHtml.link(tr("Homepage"), info.url_homepage) + " ";
		html += '</p>';
		
		if (info.address)
			html += CzfHtml.longInfo(tr("Address"), info.address);
		if (info.visibility)
			html += CzfHtml.longInfo(tr("Visibility description"), info.visibility);
		
		html += CzfHtml.longInfo(tr("Coordinates"),
				this.roundAngle(info.lat) + "&nbsp;&nbsp;" + this.roundAngle(info.lng));
		
		return html;
	}
	,
	createEdit: function(info)
	{
		var html = '';
		
		html += '<p>';
		html += CzfHtml.edit("name", tr("Name"), info.name);
		html += CzfHtml.select("type", tr("Type"), info.type, tr("nodeTypes"));
		html += CzfHtml.select("status", tr("Status"), info.status, tr("nodeStates"));
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
		
		return CzfHtml.form(html, "nodeform", "return false;");
	}
	,
	roundAngle: function(angle)
	{
		return Math.round(angle * 100000) / 100000;
	}
}
