var CzfNodeInfo =
{
	info: null,
	element: null,
	
	initialize: function(element)
	{
		this.element = element;
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
		
		// The form stays in DOM even after it's replaced
		if (document.nodeform)
			delete document.nodeform;
		
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
 		var info = CzfConst.clone("newInfo");
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
		
		return CzfHtml.form(html, "nodeform", "return false;");
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
