var map;
var icons;

LabeledMarker.prototype = new GMarker(new GLatLng(0, 0));

function LabeledMarker(latlng, options)
{
	GMarker.apply(this, arguments);
}

LabeledMarker.prototype.initialize = function(map) {
	GMarker.prototype.initialize.apply(this, arguments);
	
	var div = document.createElement("div");
	div.className = "MarkerLabel";
	div.innerHTML = this.getTitle();
	div.style.position = "absolute";
	map.getPane(G_MAP_MARKER_PANE).appendChild(div);

	this.map = map;
	this.div = div;
}

LabeledMarker.prototype.redraw = function(force) {
	GMarker.prototype.redraw.apply(this, arguments);
	
	// We only need to do anything if the coordinate system has changed
	if (!force) return;
	
	// Calculate the DIV coordinates of two opposite corners of our bounds to
	// get the size and position of our rectangle
	var latlng = this.getLatLng();
	var p = this.map.fromLatLngToDivPixel(latlng);
	var z = GOverlay.getZIndex(latlng.lat());
	
	// Now position our DIV based on the DIV coordinates of our bounds
	this.div.style.left = (p.x + 7) + "px";
	this.div.style.top = (p.y - 7) + "px";
	this.div.style.zIndex = z - 100000; //Put it behind marker
}

LabeledMarker.prototype.remove = function()
{
	this.div.parentNode.removeChild(this.div);
	this.div = null;
	GMarker.prototype.remove.apply(this, arguments);
}

function loadIcons()
{
	var types = [0,1,9,10,98,99];
	var states = [1,40,79,80,90];
	
	icons = new Object();
	for (i in types)
		for (j in states)
		{
			iconindex = types[i] * 100 + states[j];
			icons[iconindex] = new GIcon();
			icons[iconindex].image = "/images/node/" + types[i] + "-" + states[j] + ".png";
			icons[iconindex].iconSize = new GSize(15,15);
			icons[iconindex].iconAnchor = new GPoint(7,7);
		}
}

function readData(doc)
{
	var jsonData = eval('(' + doc + ')');
	map.clearOverlays();
	
	for (i in jsonData.points)
	{
		var point = jsonData.points[i];
 		var latlng = new GLatLng(point.lat, point.lng); 
 		var iconindex = point.type * 100 + point.status;
 		var options = { icon: icons[iconindex], title: point.label };
		var marker = new LabeledMarker(latlng, options);
		map.addOverlay(marker);
	}
	
	for (i in jsonData.links)
	{
		var link = jsonData.links[i];
		var latlng1 = new GLatLng(link.lat1, link.lng1); 
		var latlng2 = new GLatLng(link.lat2, link.lng2); 
		var linePoints = [ latlng1, latlng2 ];
		map.addOverlay(new GPolyline(linePoints, "black", 5, 1));
		map.addOverlay(new GPolyline(linePoints, "#AAAAAA", 3, 1));
	}
}

function loadData()
{
	var bounds = map.getBounds();
	var north = bounds.getNorthEast().lat();
	var east = bounds.getNorthEast().lng();
	var south = bounds.getSouthWest().lat();
	var west = bounds.getSouthWest().lng();
	
	var query = "?north=" + north + "&east=" + east + "&south=" + south + "&west=" + west;
	GDownloadUrl("data.php" + query, readData);
}

function mapMoved()
{
	loadData();
}

function showMap()
{
	map = new GMap2(document.getElementById("map"));
	map.setCenter(new GLatLng(50.006915, 14.422809), 18);
	
	map.addControl(new GLargeMapControl());
	map.addControl(new GMapTypeControl());
	map.addControl(new GOverviewMapControl());
	map.addControl(new GScaleControl());
	
	map.setMapType(G_SATELLITE_MAP);
	map.enableScrollWheelZoom();
	map.enableDoubleClickZoom();
	
	loadIcons();
	mapMoved();
	GEvent.addListener(map, "moveend", mapMoved);
}

function initialize()
{
	if (GBrowserIsCompatible())
		showMap();
}
