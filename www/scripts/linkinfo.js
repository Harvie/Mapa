var CzfLinkInfo =
{
	info: null,
	elementID: null,
	opened: null,
	newLink: { media: 0, active: 1, backbone: 0, secrecy: -100 },
	fields: [ "media", "planned", "backbone", "secrecy",
	          "nominal_speed", "real_speed", "czf_speed" ],
	
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
		if (!element) return;
		
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
		
		CzfNeighb.calcDistances(info.links, info);
		info.links.sort(this.linkCompare);
		
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
		var html = CzfHtml.div(this.createPeerInfo(l, action), "peerinfo");
		
		var shortName = tr("linkMedia")[l.media].replace(/ GHz/, "G").replace(/ MIMO/, "M");
		var media = CzfHtml.expl(tr("mediaInfo")[l.media], shortName);
		html += CzfHtml.div(media + ' - ' + CzfHtml.link(CzfNeighb.formatDist(l.dist),l.heightp) + " (" + l.azim + "°)", "linkinfo");
		html += CzfHtml.clear();
		
		html += this.createSpeedInfo(l);
		html += CzfHtml.clear();
		return html;
	}
	,
	createSpeedInfo: function(l)
	{
		var speeds = new Array();
		
		if (l.nominal_speed !== null)
			speeds.push(CzfHtml.expl(tr("Nominal speed"), l.nominal_speed, "nominal"));
		
		if (l.real_speed !== null)
			speeds.push(CzfHtml.expl(tr("Real speed"), l.real_speed, "real"));
		
		if (l.czf_speed !== null)
			speeds.push(CzfHtml.expl(tr("CZFree speed"), l.czf_speed, "czfree"));
		
		if (speeds.length > 0)
			return CzfHtml.div(speeds.join("/") + " Mbit", "linkinfo");
		else
			return "";
	}
	,
	createLinkEdit: function(l, action)
	{
		var html = "";
		
		html += this.createPeerInfo(l, action) + BR;
		
		var controls = "";
		controls += CzfHtml.select("media", tr("Type"), l.media, tr("linkMedia"), { nowrap: true });
		controls += CzfHtml.select("secrecy", tr("Secrecy"), l.secrecy, tr("secrecy"), { nowrap: true });
		controls += CzfHtml.checkbox("backbone", tr("Backbone link"), l.backbone, { disabled: !l.rights.backbone });
		controls += CzfHtml.checkbox("planned", tr("Planned link"), !l.active, { disabled: !l.rights.active });
		
		controls += "<p>" + tr("Speeds (in Mbit):") + "</p>";
		controls += "<table>";
		var speedFields = { nominal_speed: tr("Nominal"), real_speed: tr("Real"), czf_speed: tr("CZFree") };
		for (field in speedFields)
		{
			var edit = CzfHtml.edit(field, null, l[field], { size: 4, max: 5 });
			controls += "<tr><td>" + speedFields[field] + ":</td><td>" + edit + "</td></tr>";
		}
		controls += "</table>"
		
		controls += CzfHtml.button("close", tr("Close"), "CzfLinkInfo.closeEdit()");
		if (l.remove)
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
		var classes = new Array();
		if (l.backbone) classes.push("backbone");
		if (!l.active)  classes.push("planned");
		if (l.insert)   classes.push("added");
		if (l.remove)   classes.push("deleted");
		
		return CzfNeighb.createNodeLink(l, classes, action);
	}
	,
	createChangeInfo: function(text, info)
	{
		var html = '<div class="note">';
		html += CzfLang.format(text, CzfInfo.userLink(info), tr("dateFormat")(info.date));
		return html + '</div>';
	}
	,
	linkCompare: function(l1,l2)
	{
		if (l1.backbone != l2.backbone)
			return l2.backbone - l1.backbone;
		else
			return l1.dist - l2.dist;
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
		
		this.fixFormData();
		CzfInfo.copyFormData(this.fields, document.linkform, this.opened);
		
		//The checkbox has opposite meaning
		this.opened.active = this.opened.planned ? 0 : 1;
		delete this.opened.planned;
	}
	,
	fixFormData: function()
	{
		var form = document.linkform;
		var fields = [ "nominal_speed", "real_speed", "czf_speed" ];
		
		for (i in fields)
			if (!form[fields[i]].value.match(/^[0-9]*(\.[0-9]+)?$/))
				form[fields[i]].value = CzfHtml.nullFix(this.opened[fields[i]]);
	}
	,
	rightClick: function(latlng)
	{
		if (this.info)
			this.showDistance(latlng);
	}
	,
	nodeRightClick: function(node)
	{
		if (!this.info)
			return;
		
		if (this.info.editing)
			this.addLink(node);
		else
			this.showDistance(CzfNeighb.nodeLatLng(node), node.name);
	}
	,
	showDistance: function(latlng2, name)
	{
		var distance = CzfNeighb.formatDist(CzfNeighb.distance(this.info, latlng2));
		var heading = CzfNeighb.heading(this.info, latlng2).toFixed(2);
		
		if (name) {
			if(
				confirm(CzfLang.format("Distance from node '%s' to node '%s' is %s, azimuth is %s°. Do you want to see height profile?",
			                     this.info.name, name, distance, heading))
			) window.open(CzfNeighb.heightProfile(this.info, latlng2), '_blank');
		} else {
			if(
				confirm(CzfLang.format("Distance from node '%s' to clicked point is %s, azimuth is %s°. Do you want to see height profile?",
			                     this.info.name, distance, heading))
			) window.open(CzfNeighb.heightProfile(this.info, latlng2), '_blank');
		}
	}
	,
	addLink: function(node)
	{
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
		
		l.rights = this.info.linkRights;
		l.active = l.rights.active;
		return l;
	}
	,
	deleteLink: function()
	{
		this.opened.remove = !this.opened.remove;
		
		// Unsaved links are deleted immediately
		if (this.opened.insert && this.opened.remove)
			for (i in this.info.links)
			{
				var l = this.info.links[i];
				if (l.insert && l.remove)
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
