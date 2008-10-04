var CzfPanel =
{
	state: new Object(),
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
		
		this.toggle("search");
		this.toggle("nodeinfo");
	},
	
	getState: function()
	{
		return this.state;
	},
	
	setState: function(newState)
	{
		this.state = newState;
		
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
	
	showInfo: function(nodeid)
	{
		this.info.innerHTML = nodeid;
	},
	
	methodCall: function(fn)
	{
		var _this = this;
		return function() { fn.apply(_this, arguments); };
	}
}
