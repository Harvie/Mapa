var CzfPanel =
{
	state: new Object(),
	anchor: null,
	filters: null,
	info: null,
	geocoder: null,
	addressField: null,
	nameField: null,
	results: null,
	nameSelect: null,
	
	initialize: function(filtersID, infoID)
	{
		this.filters = document.getElementById(filtersID);
		this.info = document.getElementById(infoID);
		this.geocoder = new GClientGeocoder();
		this.anchor = new CzfAnchor(this.methodCall(this.anchorChanged));
		
		this.toggle("search");
		this.toggle("nodeinfo");
	},
	
	getState: function()
	{
		return this.state;
	},
	
	anchorChanged: function(newState)
	{
		this.state = newState;
		
		if (this.state.node)
			this.setNode(this.state.node);
		
		this.updateFilters();
		CzfMap.setPosition(this.state);
	},
	
	updateState: function(newState)
	{
		this.state = newState;
		
		if (this.anchor)
			this.anchor.update(this.state);
		
		this.updateFilters();
	},
	
	updateFilters: function()
	{
		for (i in this.filters.childNodes)
		{
			child = this.filters.childNodes[i];
			if (child.nodeName == "INPUT")
				child.checked = !!this.state[child.name];
		}
	},
	
	changed: function(box)
	{
		if (box.checked)
			this.state[box.name] = 1;
		else
			delete this.state[box.name];
		
		this.anchor.update(this.state);
		CzfMap.moved();
	},
	
	toggle: function(id)
	{
		node = document.getElementById(id + ".block");
		img = document.getElementById(id + ".img");
		
		if(node.style.display != "block")
		{
			node.style.display = "block";
			img.src = "images/minus.png";
		}
		else
		{  
			node.style.display = "none";
			img.src = "images/plus.png";
		}
	},
	
	addressSearch: function(id)
	{
		this.addressField = document.getElementById(id);
		this.addressField.disabled = true;
		
		var address = this.addressField.value;
		this.geocoder.getLatLng(address, this.methodCall(this.addressDone));
		return false;
	},
	
	addressDone: function(latlng)
	{
		this.addressField.disabled = false;
		this.addressField.className = latlng ? "normal" : "error";
		
		if (latlng != null)
		{
			this.state.lat = latlng.lat();
			this.state.lng = latlng.lng();
			this.state.zoom = 17;
			CzfMap.setPosition(this.state);
		}
	},
	
	nodeSearch: function(id)
	{
		this.nameField = document.getElementById(id);
		this.nameField.disabled = true;
		
		var query = this.nameField.value;
		GDownloadUrl("ajax/search.php?query=" + query, this.methodCall(this.nodeDone));
		return false;
	},
	
	nodeDone: function(doc)
	{
		this.results = eval('(' + doc + ')');
		
		if (this.results.length == 0)
		{
			this.nameField.className = "error";
			return;
		}
		
		this.nameField.className = "normal";
		
		select = document.createElement("SELECT");
		select.onchange = this.methodCall(this.nodeChange);
		select.options.add(new Option("(new search)", -2))
		
		if (this.results.length > 1)
			select.options.add(new Option("(choose result)", -1))
		
		for (i in this.results)
			select.options.add(new Option(this.results[i].name, i));
		
		select.options[1].selected = true;
		
		this.nameSelect = select;
		this.nameField.parentNode.replaceChild(this.nameSelect, this.nameField);
		
		if (this.results.length == 1)
			this.nodeChange();
	},
	
	nodeChange: function()
	{
		var i = this.nameSelect.value;
		
		if (i == -2)
		{
			this.nameSelect.parentNode.replaceChild(this.nameField,this.nameSelect);
			this.nameField.disabled = false;
			return;
		}
		
		if (i < 0)
			return;
		
		var node = this.results[i];
		
		this.state.lat = node.lat
		this.state.lng = node.lng;
		this.state.zoom = 17;
		CzfMap.setPosition(this.state);
	},
	
	setNode: function(nodeid)
	{
		this.state.node = nodeid;
		
		if (this.anchor)
			this.anchor.update(this.state);
		
		GDownloadUrl("ajax/nodeinfo.php?id=" + nodeid, this.methodCall(this.infoDone));
	},
	
	infoDone: function(doc)
	{
		if (doc.length == 0)
			return;
		
		info = eval('(' + doc + ')');
		
		html = "<p>";
		html += "Node ID: " + info.id + "\n";
		html += "Name: " + info.name + "\n";
		html += "Type: " + CzfMap.nodeTypes[info.type] + "\n";
		html += "Status: " + CzfMap.nodeStates[info.status] + "\n";
		html += "</p>";
		
		html += "<p>";
		if (info.url_thread)
			html += "<a href=\"" + info.url_thread + "\">Thread</a> ";
		if (info.url_photos)
			html += "<a href=\"" + info.url_photos + "\">Photos</a> ";
		if (info.url_homepage)
			html += "<a href=\"" + info.url_homepage + "\">Homepage</a> ";
		html += "</p>";
		
		html += "<p>Coordinates: <div>" + info.lat + " " + info.lng + "</div></p>";
		if (info.address)
			html += "<p>Address: <div>" + info.address + "</div></p>";
		if (info.visibility)
			html += "<p>Visibility description: <div>" + info.visibility + "</div></p>";
		
		this.info.innerHTML = html.replace(/\n/g, "<br/>");
	},
	
	methodCall: function(fn)
	{
		var _this = this;
		return function() { fn.apply(_this, arguments); };
	}
}
