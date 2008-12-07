var CzfLinkInfo =
{
	info: null,
	element: null,
	opened: -1,
	
	initialize: function(element)
	{
		this.element = element;
	}
	,
	setInfo: function(info)
	{
		this.info = info;
		this.updateInfo();
	}
	,
	updateInfo: function()
	{
		if (this.info && this.info.links)
			this.element.innerHTML = this.createInfo(this.info);
		else
			this.element.innerHTML = "";
	}
	,
	createInfo: function(info)
	{
		var html = "<p>" + tr("Links to other nodes") + ":</p>";
		
		for (i in info.links)
		{
			l = info.links[i];
			var latlng1 = new GLatLng(info.lat, info.lng);
			var latlng2 = new GLatLng(l.lat, l.lng);
			l.dist = latlng1.distanceFrom(latlng2);
		}
		
		info.links.sort(function(a,b) { return a.dist - b.dist; });
		
		for (i in info.links)
		{
			var action = info.editing ? "return CzfLinkInfo.editToggle(" + i + ")"
			                          : "return CzfLinkInfo.showPeer(" + i + ")";
			if (i == this.opened)
				html += this.createLinkEdit(info.links[i], action);
			else
				html += this.createLinkInfo(info.links[i], action);
		}
		
		html += CzfHtml.clear(true);
		return html;
	}
	,
	createLinkInfo: function(l, action)
	{
		var html = "";
		
		html += '<div class="peerinfo">';
		html += this.createPeerInfo(l, action);
		html += '</div>';
		
		html += '<div class="linkinfo">';
		html += CzfHtml.expl(CzfConst.mediaInfo[l.media], CzfConst.linkMedia[l.media]);
		html += ' - ' + this.formatDist(l.dist);
		html += '</div>';
		html += CzfHtml.clear();
		
		return html;
	}
	,
	createLinkEdit: function(l, action)
	{
		var html = "";
		
		html += this.createPeerInfo(l, action) + "<br/>";
		
		html += '<div class="linkedit">';
		html += CzfHtml.select("media", tr("Type"), l.media, CzfConst.linkMedia, true);
		html += CzfHtml.checkbox("backbone", tr("Backbone link"), "", l.backbone);
		html += CzfHtml.checkbox("planned", tr("Planned link"), "", l.planned);
		html += '</div>';
		
		return html;
	}
	,
	createPeerInfo: function(l, action)
	{
		var imgTitle = CzfConst.nodeStates[l.status] + " " + CzfConst.nodeTypes[l.type];
		var imgSrc = "images/node/" + l.type + "-" + l.status + ".png";
		var imgHtml = CzfHtml.img(imgTitle, imgSrc);
		
		var classes = "peername" + (l.backbone ? " backbone" : "") + (l.active ? "" : " planned");
		var peerName = CzfHtml.span(l.peername, classes);
		return CzfHtml.click(imgHtml + peerName, action);
	}
	,
	formatDist: function(meters)
	{
		str = Math.round(meters).toString();
		digits = str.length;
		
		if (digits > 3)
		{
			km = str.substr(0, digits - 3);
			
			if (digits < 6)
				km += "." + str.substr(digits - 2, 6 - digits);
			
			str = km + "k";
		}
		
		return str + "m";
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
	editToggle: function(linknum)
	{
		if (this.opened == linknum)
			this.opened = -1;
		else
			this.opened = linknum;
		
		this.updateInfo();
	}
	,
	methodCall: function(fn)
	{
		var _this = this;
		return function() { fn.apply(_this, arguments); };
	}
}
