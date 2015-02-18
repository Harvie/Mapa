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
	nodeLatLng: function(node)
	{
		return new google.maps.LatLng(node.lat, node.lng);
	}
	,
	distance: function(node, latlng2)
	{
		var latlng1 = this.nodeLatLng(node);
		return google.maps.geometry.spherical.computeDistanceBetween(latlng1, latlng2);
	}
	,
	heading: function(node, latlng2)
	{
		var latlng1 = this.nodeLatLng(node);
		var heading = google.maps.geometry.spherical.computeHeading(latlng1, latlng2);
		if (heading < 0) heading += 360;
		return heading;
	}
	,
/*
	azimuth: function(node1, node2)
	{
		//azimuth != bearing. Bearing is never greater than 90 degrees.
		//THX2: http://stackoverflow.com/questions/3225803/calculate-endpoint-given-distance-bearing-starting-point

		function rad2deg(angle) {	return 180.0 * angle / Math.PI; }
		function deg2rad(angle) {	return Math.PI * angle / 180.0; }

		//Convert input values to radians
		var lat1 = deg2rad(node1.lat);
		var long1 = deg2rad(node1.lng);
		var lat2 = deg2rad(node2.lat);
		var long2 = deg2rad(node2.lng);

		var deltaLong = long2 - long1;

		var y = Math.sin(deltaLong) * Math.cos(lat2);
		var x = Math.cos(lat1) * Math.sin(lat2) -
		Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLong);
		var azimuth = rad2deg(Math.atan2(y, x));
		if(azimuth<0) azimuth+=360;
		azimuth = Math.round(azimuth*100)/100;
		return(azimuth);

	}
	,
*/
	heightProfile: function(node1, latlng2)
	{
		var url="http://www.heywhatsthat.com/bin/profile-0904.cgi?src=profiler-0904&axes=1&los=1&greatcircle=1&metric=1&freq=&refraction=&exaggeration=";
		url+="&pt0="+node1.lat+","+node1.lng+",ff0000";
		url+="&pt1="+latlng2.lat()+","+latlng2.lng();
		return url;
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
		//var latlng2 = this.nodeLatLng(fromNode);
		for (i in nodes) {
			var latlng1 = this.nodeLatLng(nodes[i]);
			nodes[i].dist = this.distance(fromNode, latlng1);
			nodes[i].heightp = this.heightProfile(fromNode, latlng1);
	                nodes[i].azim = CzfNeighb.heading(fromNode, latlng1).toFixed(2);
			//nodes[i].azim = this.azimuth(fromNode, nodes[i]);
		}
	}
}
