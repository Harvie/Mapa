var CzfMap = {
	mediaColors: [ "#000", "#0C0", "#A22", "#8DF", "#A2A", "#0FF", "#F00", "#CCC", "#FFF", "#F80" ],
	defaultPos: { lat: 50.006915, lng: 14.422809, zoom: 18 },
	icons: new Object(),
	map: null,
	
	initialize: function()
	{
		if (GBrowserIsCompatible())
			this.showMap();
	},
	
	showMap: function()
	{
		this.map = new GMap2(document.getElementById("map"));
		
		this.map.addControl(new GLargeMapControl());
		this.map.addControl(new GMapTypeControl());
		this.map.addControl(new GOverviewMapControl());
		this.map.addControl(new GScaleControl());
		
		this.map.setMapType(G_SATELLITE_MAP);
		this.map.enableScrollWheelZoom();
		this.map.enableDoubleClickZoom();
		
		this.anchor = new CzfAnchor(this.methodCall(this.setPosition), this.defaultPos);
		this.loadIcons();
		
		this.mapMoved();
		GEvent.addListener(this.map, "moveend", this.methodCall(this.mapMoved));
	},
	
	setPosition: function(state)
	{
		var lat = parseFloat(state.lat);
		var lng = parseFloat(state.lng);
		var zoom = parseInt(state.zoom);
		
		this.map.setCenter(new GLatLng(lat, lng), zoom);
	},
	
	mapMoved: function()
	{
		var state = new Object();
		state.lat = this.map.getCenter().lat();
		state.lng = this.map.getCenter().lng();
		state.zoom = this.map.getZoom();
		this.anchor.update(state);
		
		this.loadData();
	},
	
	loadIcons: function()
	{
		var types = [0,1,9,10,98,99];
		var states = [1,40,79,80,90];
		
		for (i in types)
			for (j in states)
			{
				iconindex = types[i] * 100 + states[j];
				this.icons[iconindex] = new GIcon();
				this.icons[iconindex].image = "/images/node/" + types[i] + "-" + states[j] + ".png";
				this.icons[iconindex].iconSize = new GSize(15,15);
				this.icons[iconindex].iconAnchor = new GPoint(7,7);
			}
	},
	
	loadData: function()
	{
		var bounds = this.map.getBounds();
		var north = bounds.getNorthEast().lat();
		var east = bounds.getNorthEast().lng();
		var south = bounds.getSouthWest().lat();
		var west = bounds.getSouthWest().lng();
		
		var query = "?north=" + north + "&east=" + east + "&south=" + south + "&west=" + west;
		GDownloadUrl("data.php" + query, this.methodCall(this.readData));
	},
	
	readData: function(doc)
	{
		var jsonData = eval('(' + doc + ')');
		this.map.clearOverlays();
		
		for (i in jsonData.points)
		{
			var point = jsonData.points[i];
			var latlng = new GLatLng(point.lat, point.lng); 
			var iconindex = point.type * 100 + point.status;
			var options = { icon: this.icons[iconindex], title: point.label };
			var marker = new CzfMarker(latlng, options);
			this.map.addOverlay(marker);
		}
		
		for (i in jsonData.links)
		{
			var link = jsonData.links[i];
			var latlng1 = new GLatLng(link.lat1, link.lng1);
			var latlng2 = new GLatLng(link.lat2, link.lng2);
			
			var linePoints = [ latlng1, latlng2 ];
			var color = this.mediaColors[link.media];
			var width = link.backbone ? 3 : 1;
			var opacity = link.active ? 1 : 0.4;
			
			this.map.addOverlay(new GPolyline(linePoints, "black", width + 2, opacity));
			this.map.addOverlay(new GPolyline(linePoints, color, width, opacity));
		}
	},
	
	methodCall: function(fn)
	{
		var _this = this;
		return function() { fn.apply(_this, arguments); };
	}
}
