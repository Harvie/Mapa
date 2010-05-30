var CzfSearch =
{
	state: new Object(),
	geocoder: null,
	marker: null,
	addressField: null,
	nameField: null,
	results: null,
	nameSelect: null,
	currentAddress: null,
	gotoResult: true,
	
	initialize: function(element)
	{
		this.geocoder = new GClientGeocoder();
		
		var icon = new GIcon(G_DEFAULT_ICON);
		icon.image = "images/marker-cyan.png";
		this.marker = CzfMap.createMarker({icon: icon});
		
		if (!element) return;
		
		var params = { onchange: "return CzfSearch.addressChanged()" };
		var addressInput = CzfHtml.edit("address", tr("Search address"), "", params);
		var addressForm = CzfHtml.form(addressInput, "addrform", "return CzfSearch.addressSearch()");
		
		var nameInput = CzfHtml.edit("nodename", tr("Search node name"), "");
		var nameForm = CzfHtml.form(nameInput, "nameform", "return CzfSearch.nodeSearch()");
		
		element.innerHTML = addressForm + nameForm;
		this.addressField = document.getElementById("address");
		this.nameField = document.getElementById("nodename");
	}
	,
	addressChanged: function()
	{
		this.marker.hide();
	}
	,
	addressSearch: function()
	{
		this.addressField.disabled = true;
		
		var address = this.addressField.value;
		this.currentAddress = address;
		this.gotoResult = true;
		
		this.runAddressSearch(address);
		return false;
	}
	,
	remoteAddressSearch: function(encoded, goto)
	{
		var address = this.decodeAddress(encoded);
		this.currentAddress = address;
		this.gotoResult = goto;
		
		if (this.addressField)
			this.addressField.value = address;
		
		this.runAddressSearch(address);
	}
	,
	runAddressSearch: function(address)
	{
		this.geocoder.getLatLng(address, GEvent.callback(this, this.addressDone));
	}
	,
	addressDone: function(latlng)
	{
		if (this.addressField)
		{
			this.addressField.disabled = false;
			this.addressField.className = latlng ? "normal" : "error";
		}
		
		if (latlng == null)
			return;
		
		CzfMain.setGeolocate(this.encodeAddress(this.currentAddress));
		
		if (this.gotoResult)
			CzfMain.setPos(latlng.lat(), latlng.lng());
		
		this.marker.setLatLng(latlng);
		this.marker.show();
	}
	,
	nodeSearch: function()
	{
		this.nameField.disabled = true;
		
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
			this.nameField.select();
			return;
		}
		
		if (i < 0)
			return;
		
		var node = this.results[i];
		CzfMain.setPos(node.lat, node.lng);
		CzfMain.setNode(node.id);
	}
	,
	encodeAddress: function(address)
	{
		var charCodes = [];
		
		for (var i = 0; i < address.length; i++)
			charCodes.push(address.charCodeAt(i));
		
		return charCodes.join("|");
	}
	,
	decodeAddress: function(encoded)
	{
		return String.fromCharCode.apply(null, encoded.split("|"));
	}
}
