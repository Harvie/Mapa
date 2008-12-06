var CzfLinkInfo =
{
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
	methodCall: function(fn)
	{
		var _this = this;
		return function() { fn.apply(_this, arguments); };
	}
}
