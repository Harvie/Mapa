function CzfLabel(marker)
{
	this.setValues({map: marker.getMap()});
	
	this.czfDiv = document.createElement("div");
	this.czfDiv.className = "label";
	this.czfDiv.innerHTML = marker.getTitle();
	
	this.bindTo("position", marker);
	this.bindTo("zIndex", marker);
};
CzfLabel.prototype = new google.maps.OverlayView;

CzfLabel.prototype.onAdd = function() {
	var pane = this.getPanes().overlayImage;
	pane.appendChild(this.czfDiv);
};

CzfLabel.prototype.onRemove = function() {
	this.czfDiv.parentNode.removeChild(this.czfDiv);
};

CzfLabel.prototype.draw = function() {
	var projection = this.getProjection();
	var position = projection.fromLatLngToDivPixel(this.get("position"));
	
	this.czfDiv.style.left = (position.x + 7) + "px";
	this.czfDiv.style.top = (position.y - 7) + "px";
	
	var zIndex = this.get("zIndex");
	this.czfDiv.style.zIndex = zIndex - 10;
};
