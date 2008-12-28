var CzfSearch =
{
	state: new Object(),
	geocoder: null,
	addressField: null,
	nameField: null,
	results: null,
	nameSelect: null,
	
	initialize: function(element)
	{
		this.geocoder = new GClientGeocoder();
		
		var addressInput = CzfHtml.edit("address", tr("Search address"), "");
		var addressForm = CzfHtml.form(addressInput, "addrform", "return CzfSearch.addressSearch('address')");
		
		var nameInput = CzfHtml.edit("nodename", tr("Search node name"), "");
		var nameForm = CzfHtml.form(nameInput, "nodeform", "return CzfSearch.nodeSearch('nodename')");
		
		element.innerHTML = addressForm + nameForm;
	}
	,
	addressSearch: function(id)
	{
		this.addressField = document.getElementById(id);
		this.addressField.disabled = true;
		
		var address = this.addressField.value;
		this.geocoder.getLatLng(address, GEvent.callback(this, this.addressDone));
		return false;
	}
	,
	addressDone: function(latlng)
	{
		this.addressField.disabled = false;
		this.addressField.className = latlng ? "normal" : "error";
		
		if (latlng != null)
			CzfMain.setPos(latlng.lat(), latlng.lng());
	}
	,
	nodeSearch: function(id)
	{
		this.nameField = document.getElementById(id);
		this.nameField.disabled = true;
		
		alert(this.nameField.nodeName);
		var params = { query: this.nameField.value };
		CzfAjax.get("search", params, GEvent.callback(this, this.nodeDone));
		return false;
	}
	,
	nodeDone: function(results)
	{
		this.results = results;
		
		if (this.results.length == 0)
		{
			this.nameField.className = "error";
			this.nameField.disabled = false;
			return;
		}
		
		this.nameField.className = "normal";
		
		select = document.createElement("SELECT");
		select.onchange = GEvent.callback(this, this.nodeChange);
		select.options.add(new Option(tr("(new search)"), -2))
		
		if (this.results.length > 1)
			select.options.add(new Option(tr("(choose result)"), -1))
		
		for (i in this.results)
			select.options.add(new Option(this.results[i].name, i));
		
		select.options[1].selected = true;
		
		this.nameSelect = select;
		this.nameField.parentNode.replaceChild(this.nameSelect, this.nameField);
		
		if (this.results.length == 1)
			this.nodeChange();
	}
	,
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
		CzfMain.setPos(node.lat, node.lng);
		CzfMain.setNode(node.id);
	}
}
