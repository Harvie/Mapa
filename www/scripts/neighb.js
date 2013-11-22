var CzfNeighb =
{
	nodes: null,
	
	showNode: function(nodenum)
	{
		node = this.nodes[nodenum];
		CzfMain.setNode(node.id);
		CzfMain.setPos(node.lat, node.lng);
		return false;
	}
	,
	createHTML: function(node)
	{
		var nodes = CzfMap.getNodes();
		this.nodes = nodes;
		
		if (nodes === null)
			return "";
		
		this.calcDistances(nodes, node);
		nodes.sort(function(n1,n2) { return n1.dist - n2.dist; });
		
		var back = CzfHtml.click(tr("Back"), "CzfInfo.updateInfo()");
		var title = CzfLang.format(tr("Neighborhood of node %s:"), node.name);
		var html = CzfHtml.p(back) + CzfHtml.p(title);
		
		for (i in nodes)
			if (i > 0)
				html += this.createNeighbInfo(nodes[i]);
		
		return html;
	}
	,
	createNeighbInfo: function(node)
	{
		var html = "";
		
		var action = "CzfNeighb.showNode(" + i + ")";
		var nodeLink = this.createNodeLink(node, [], action);
		html += CzfHtml.div(nodeLink, "peerinfo");
		
		var nodeDist = this.formatDist(node.dist);
		html += CzfHtml.div(nodeDist, "linkinfo");
		html += CzfHtml.clear();
		
		return html;
	}
	,
	createNodeLink: function(n, classes, action)
	{
		var imgTitle = tr("nodeTypes")[n.type] + ", " + tr("nodeStates")[n.status];
		var imgSrc = "images/node/" + n.type + "-" + n.status + ".png";
		var imgHtml = CzfHtml.img(imgTitle, imgSrc);
		var nodeName = CzfHtml.span(n.name, classes);
		return imgHtml + CzfHtml.click(nodeName, action);
	}
	,
	distance: function(node1, node2)
	{
		var latlng1 = new google.maps.LatLng(node1.lat, node1.lng);
		var latlng2 = new google.maps.LatLng(node2.lat, node2.lng);
		return google.maps.geometry.spherical.computeDistanceBetween(latlng1, latlng2);
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
				km += "." + str.substr(digits - 3, 6 - digits);
			
			str = km + "k";
		}
		
		return str + "m";
	}
	,
	calcDistances: function(nodes, fromNode)
	{
		for (i in nodes)
			nodes[i].dist = this.distance(nodes[i], fromNode);
	}
}
