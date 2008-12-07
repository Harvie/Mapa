var CzfLinkInfo =
{
	info: null,
	
	createInfo: function(info)
	{
		this.info = info;
		
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
			html += this.createLinkInfo(info.links[i]);
		
		html += CzfHtml.clear(true);
		return html;
	}
	,
	createLinkInfo: function(l)
	{
		var classes = "" + (l.backbone ? " backbone" : "") + (l.active ? "" : " planned");
		var html = "";
		
		html += '<div class="peerinfo">';
		html += this.createPeerInfo(l, "return CzfLinkInfo.showPeer(" + i + ")");
		html += '</div>';
		
		html += '<div class="linkinfo">';
		html += CzfHtml.expl(CzfConst.linkMedia[l.media][1], CzfConst.linkMedia[l.media][0]);
		html += ' - ' + this.formatDist(l.dist);
		html += '</div>';
		html += CzfHtml.clear();
		
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
	methodCall: function(fn)
	{
		var _this = this;
		return function() { fn.apply(_this, arguments); };
	}
}
