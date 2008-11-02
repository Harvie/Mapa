CzfMarker.prototype = new GMarker(new GLatLng(0, 0));

function CzfMarker(latlng, options)
{
	GMarker.apply(this, arguments);
}

CzfMarker.prototype.initialize = function(map) {
	GMarker.prototype.initialize.apply(this, arguments);
	
	var div = document.createElement("div");
	div.className = "label";
	div.innerHTML = this.getTitle();
	div.style.position = "absolute";
	map.getPane(G_MAP_MARKER_PANE).appendChild(div);

	this.map = map;
	this.div = div;
}

CzfMarker.prototype.redraw = function(force) {
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

CzfMarker.prototype.remove = function()
{
	this.div.parentNode.removeChild(this.div);
	this.div = null;
	GMarker.prototype.remove.apply(this, arguments);
}
