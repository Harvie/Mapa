var CzfNodeInfo =
{
	element: null,
	info: null,
	
	initialize: function(infoID)
	{
		this.element = document.getElementById(infoID);
	},
	
	setNode: function(nodeid)
	{
		CzfMap.ajax("nodeinfo", "id=" + nodeid, this.methodCall(this.infoDone));
	},
	
	infoDone: function(doc)
	{
		if (doc.length == 0)
			return;
		
		this.info = eval('(' + doc + ')');
		this.element.innerHTML = this.createInfo(this.info);
	},
	
	showPeer: function(linknum)
	{
		link = this.info.links[linknum];
		CzfPanel.setNode(link.peerid);
		CzfPanel.setPos(link.lat, link.lng);
		return false;
	},
	
	createInfo: function(info)
	{
		var html = '<p>';
		html += 'Node ID: ' + info.id + '<br/>';
		html += 'Name: ' + info.name + '<br/>';
		html += 'Type: ' + CzfConst.nodeTypes[info.type] + '<br/>';
		html += 'Status: ' + CzfConst.nodeStates[info.status] + '<br/>';
		html += '</p>';
		
		html += '<p>';
		if (info.url_thread)
			html += CzfHtml.link("Thread", info.url_thread) + " ";
		if (info.url_photos)
			html += CzfHtml.link("Photos", info.url_photos) + " ";
		if (info.url_homepage)
			html += CzfHtml.link("Homepage", info.url_homepage) + " ";
		html += '</p>';
		
		html += CzfHtml.longText("Coordinates",
				this.roundAngle(info.lat) + "&nbsp;&nbsp;" + this.roundAngle(info.lng));
		
		if (info.address)
			html += CzfHtml.longText("Address", info.address);
		if (info.visibility)
			html += CzfHtml.longText("Visibility description", info.visibility);
		
		if (info.links.length > 0)
			html += this.createLinkInfo(info);
		
		return html;
	},
	
	createLinkInfo: function(info)
	{
		var html = '<p>Links to other nodes:</p>';
		
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
			l = info.links[i];
			
			var classes = "" + (l.backbone ? " backbone" : "") + (l.active ? "" : " planned");
			
			html += '<div class="peerinfo' + classes + '">';
			html += CzfHtml.img(CzfConst.nodeStates[l.status] + " " + CzfConst.nodeTypes[l.type],
					"images/node/" + l.type + "-" + l.status + ".png");
			html += CzfHtml.click(l.peername, "return CzfNodeInfo.showPeer(" + i + ")");
			html += '</div>';
			
			html += '<div class="linkinfo">';
			html += CzfHtml.expl(CzfConst.linkMedia[l.media][1], CzfConst.linkMedia[l.media][0]);
			html += ' - ' + this.formatDist(l.dist);
			html += '</div>';
			html += CzfHtml.clear();
		}
		
		html += CzfHtml.clear(true);
		return html;
	},
	
	roundAngle: function(angle)
	{
		return Math.round(angle * 100000) / 100000;
	},
	
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
	},
	
	methodCall: function(fn)
	{
		var _this = this;
		return function() { fn.apply(_this, arguments); };
	}
}
