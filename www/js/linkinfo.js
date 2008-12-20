var CzfLinkInfo =
{
	info: null,
	elementID: null,
	opened: null,
	
	initialize: function(elementID)
	{
		this.elementID = elementID;
	}
	,
	setInfo: function(info)
	{
		this.copyFormData();
		this.info = info;
		this.opened = null;
		this.updateInfo();
	}
	,
	updateInfo: function()
	{
		var element = document.getElementById(this.elementID);
		
		if (this.info && this.info.links)
			element.innerHTML = this.createInfo(this.info);
		else
			element.innerHTML = "";
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
			if (info.links[i] == this.opened)
				html += this.createLinkEdit(info.links[i], action);
			else
				html += this.createLinkInfo(info.links[i], action);
		}
		
		if (info.editing)
		{
			html += '<p class="help">';
			html += tr("You can add a new link by right clicking on target node on the map.");
			html += '</p>';
		}
		else
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
		
		var controls = "";
		controls += CzfHtml.select("media", tr("Type"), l.media, CzfConst.linkMedia, true);
		controls += CzfHtml.checkbox("backbone", tr("Backbone link"), "", l.backbone);
		controls += CzfHtml.checkbox("planned", tr("Planned link"), "", !l.active);
		
		html += '<div class="linkedit">';
		html += CzfHtml.form(controls, "linkform", "return false;");
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
		this.copyFormData();
		
		var link = this.info.links[linknum];
		link.changed = true;
		
		if (this.opened == link)
			this.opened = null;
		else
			this.opened = link;
		
		this.updateInfo();
	}
	,
	copyFormData: function()
	{
		if (!this.info || !document.linkform || !this.opened)
			return;
		
		var l = this.opened;
		l.media = document.linkform.media.value;
		l.backbone = document.linkform.backbone.checked ? 1 : 0;
		l.active = document.linkform.planned.checked ? 0 : 1;
	}
	,
	addLink: function(node)
	{
		if (!this.checkLinkEnd(node))
			return;
		
		var l = this.createLink(node);
		this.copyFormData();
		this.info.links.push(l);
		this.opened = l;
		this.updateInfo();
	}
	,
	checkLinkEnd: function(node)
	{
		if (node.id == this.info.id)
		{
			alert(tr("Node cannot be connected to itself."));
			return false;
		}
		
		var links = this.info.links;
		for (i in links)
			if (links[i].peerid == node.id)
			{
				alert(tr("Link to node '%s' already exists.").replace(/%s/, node.name));
				return false;
			}
		
		return true;
	}
	,
	createLink: function(node)
	{
		var l = CzfConst.clone("newLink");
		l.added = 1;
		
		l.peerid = node.id;
		l.peername = node.name;
		l.status = node.status;
		l.type = node.type;
		l.lat = node.lat;
		l.lng = node.lng;
		
		return l;
	}
}
