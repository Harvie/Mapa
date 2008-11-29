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
		html += 'Node ID: ' + info.id + '\n';
		html += 'Name: ' + info.name + '\n';
		html += 'Type: ' + CzfConst.nodeTypes[info.type] + '\n';
		html += 'Status: ' + CzfConst.nodeStates[info.status] + '\n';
		html += '</p>';
		
		html += '<p>';
		if (info.url_thread)
			html += '<a href="' + info.url_thread + '">Thread</a> ';
		if (info.url_photos)
			html += '<a href="' + info.url_photos + '">Photos</a> ';
		if (info.url_homepage)
			html += '<a href="' + info.url_homepage + '">Homepage</a> ';
		html += '</p>';
		
		html += '<p>Coordinates: <div>' + this.roundAngle(info.lat) + '&nbsp;&nbsp;'
		                                + this.roundAngle(info.lng) + '</div></p>';
		
		if (info.address)
			html += '<p>Address: <div>' + info.address + '</div></p>';
		if (info.visibility)
			html += '<p>Visibility description: <div>' + info.visibility + '</div></p>';
		
		if (info.links.length > 0)
			html += this.createLinkInfo(info);
		
		return html.replace(/\n/g, "<br/>");
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
			html += '<img src="' + 'images/node/' + l.type + '-' + l.status + '.png" />';
			html += '<span onclick="return CzfNodeInfo.showPeer(' + i + ')">' + l.peername + '</span>';
			html += '</div>';
			
			html += '<div class="linkinfo">';
			html += '<span title="' + CzfConst.linkMedia[l.media][1] + '">'
			html += CzfConst.linkMedia[l.media][0] + '</span>' + ' - ' + this.formatDist(l.dist);
			html += '</div>';
			html += '<div class="clear"></div>';
		}
		
		html += '<div class="clear">&nbsp;</div>';
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
