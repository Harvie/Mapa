var CzfLinkInfo =
{
	newLink: { media: 0, active: 1, backbone: 0 },
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
		var html = ""
		
		if (info.links.length > 0)
			html += "<p>" + tr("Links to other nodes") + ":</p>";
		
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
			html += '<p class="note">';
			html += tr("You can add a new link by right clicking on target node on the map.");
			html += " " + tr("If it doesn't work, try shift + left click.");
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
		html += CzfHtml.expl(tr("mediaInfo")[l.media], tr("linkMedia")[l.media]);
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
		controls += CzfHtml.select("media", tr("Type"), l.media, tr("linkMedia"), true);
		controls += CzfHtml.checkbox("backbone", tr("Backbone link"), "", l.backbone);
		controls += CzfHtml.checkbox("planned", tr("Planned link"), "", !l.active);
		controls += CzfHtml.button("close", tr("Close"), "CzfLinkInfo.closeEdit()");
		
		if (l.delete)
			controls += CzfHtml.button("restore", tr("Restore"), "CzfLinkInfo.deleteLink()");
		else
			controls += CzfHtml.button("delete", tr("Delete"), "CzfLinkInfo.deleteLink()");
		
		html += '<div class="linkedit">';
		html += CzfHtml.form(controls, "linkform", "return false;");
		if (l.created)
			html += this.createChangeInfo("Created by %s on %s.", l.created);
		if (l.changed)
			html += this.createChangeInfo("Changed by %s on %s.", l.changed);
		html += '</div>';
		
		return html;
	}
	,
	createPeerInfo: function(l, action)
	{
		var imgTitle = tr("nodeTypes")[l.type] + ", " + tr("nodeStates")[l.status];
		var imgSrc = "images/node/" + l.type + "-" + l.status + ".png";
		var imgHtml = CzfHtml.img(imgTitle, imgSrc);
		
		var classes = [ "peername" ];
		if (l.backbone) classes.push("backbone");
		if (!l.active)  classes.push("planned");
		if (l.insert)    classes.push("added");
		if (l.delete)  classes.push("deleted");
		
		var peerName = CzfHtml.span(l.name, classes);
		return CzfHtml.click(imgHtml + peerName, action);
	}
	,
	createChangeInfo: function(text, info)
	{
		var html = '<div class="note">';
		html += CzfLang.format(text, CzfInfo.userLink(info), tr("dateFormat")(info.date));
		return html + '</div>';
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
		CzfMain.setNode(link.id);
		CzfMain.setPos(link.lat, link.lng);
		return false;
	}
	,
	editToggle: function(linknum)
	{
		this.copyFormData();
		
		var link = this.info.links[linknum];
		link.update = true;
		
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
		if (!this.info.editing)
			return;
		
		if (!this.checkLinkEnd(node))
			return;
		
		var l = this.createLink(node);
		this.info.links.push(l);
		this.copyFormData();
		this.opened = l;
		
		this.updateInfo();
		CzfInfo.openTab(this.elementID);
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
			if (links[i].id == node.id)
			{
				alert(CzfLang.format("Link to node '%s' already exists.", node.name));
				return false;
			}
		
		return true;
	}
	,
	createLink: function(node)
	{
		var l = CzfMain.clone(this.newLink);
		l.insert = 1;
		
		l.id = node.id;
		l.name = node.name;
		l.status = node.status;
		l.type = node.type;
		l.lat = node.lat;
		l.lng = node.lng;
		
		return l;
	}
	,
	deleteLink: function()
	{
		this.opened.delete = !this.opened.delete;
		
		// Unsaved links are deleted immediately
		if (this.opened.insert && this.opened.delete)
			for (i in this.info.links)
			{
				var l = this.info.links[i];
				if (l.insert && l.delete)
					delete this.info.links[i];
			}
		
		this.closeEdit();
	}
	,
	closeEdit: function()
	{
		this.copyFormData();
		this.opened = null;
		this.updateInfo();
	}
}
