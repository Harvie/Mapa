var CzfNodeInfo =
{
	info: null,
	marker: null,
	elementID: null,
	newInfo: { id: 0, type: 1, status: 80, node_secrecy: -100 },
	fields: [ "name", "network", "type", "status", "node_secrecy", "address",
	          "visibility", "url_thread", "url_photos", "url_homepage",
	          "people_count", "people_hide", "machine_count", "machine_hide" ],
	
	initialize: function(elementID)
	{
		this.elementID = elementID;
		
		this.marker = CzfMap.createMarker();
		this.marker.setDraggable(true);
		
		var callback = CzfMain.callback(this, this.markerMoved);
		google.maps.event.addListener(this.marker, "dragend", callback);
	}
	,
	setInfo: function(newInfo)
	{
		if (this.info && this.info.editing)
			this.copyFormData();
		
		this.info = newInfo;
		this.updateMarker();
		this.updateInfo();
	}
	,
	updateInfo: function()
	{
		var element = document.getElementById(this.elementID);
		if (!element) return;
		
		// The form stays in DOM even after it's replaced
		if (document.nodeform)
			delete document.nodeform;
		
		if (this.info)
			if (this.info.editing)
				element.innerHTML = this.createEdit();
			else
				element.innerHTML= this.createInfo();
		else
			element.innerHTML = "";
	}
	,
	updateMarker: function()
	{
		this.marker.setVisible(false);
		
		if (this.info && this.info.editing)
		{
			var pos = new google.maps.LatLng(this.info.lat, this.info.lng);
			this.marker.setPosition(pos);
			this.marker.setVisible(true);
		}
	}
	,
	markerMoved: function()
	{
		var pos = this.marker.getPosition();
		this.info.lat = pos.lat();
		this.info.lng = pos.lng();
		this.info.moved = true;
		
		this.copyFormData();
		CzfInfo.updateInfo();
		CzfMain.postMessage("markerMoved", [ this.info.lat, this.info.lng ]);
	}
	,
	copyFormData: function()
	{
		if (!document.nodeform)
			return;
		
		var ownerField = document.nodeform.owner;
		if (ownerField && ownerField.value != this.info.owner.name)
		{
			this.info.owner.name = ownerField.value;
			this.info.owner.changed = true;
		}
		
		CzfInfo.copyFormData(this.fields, document.nodeform, this.info);
	}
	,
	checkForm: function()
	{
		var errors = "";
		var form = document.nodeform;
		
		if (form.name.value === "")
			errors += "\n" + tr("Node name must be filled in.");
		
		if (form.address.value === "")
			errors += "\n" + tr("Node address must be filled in.");
		
		if (!form.people_count.value.match(/^[0-9]*$/))
			errors += "\n" + tr("People count must be a number.");
		
		if (!form.machine_count.value.match(/^[0-9]*$/))
			errors += "\n" + tr("Machine count must be a number.");
		
		if (errors !== "")
			alert(tr("Changes cannot be saved:") + errors);
		
		return (errors === "");
	}
	,
	createNode: function()
	{
 		var info = CzfMain.clone(this.newInfo);
		info.links = new Array();
		info.editing = true;
		info.rights = CzfConfig.nodeRights;
		info.linkRights = CzfConfig.linkRights;
		info.owner = { name: CzfConfig.user.name, changed: true };
		
		var latlng = CzfMap.getCenter();
		info.lat = latlng.lat();
		info.lng = latlng.lng();
		
		return info;
	}
	,
	createInfo: function()
	{
		var info = this.info;
		var html = '';
		
		html += '<p>';
		html += CzfHtml.info(tr("Name"), CzfHtml.click(info.name, "CzfInfo.center()"));
		
		if (info.network)
		{
			var network = CzfConfig.networks[info.network];
			html += CzfHtml.info(tr("Network"), CzfHtml.link(network.name, network.homepage));
		}
		
		html += CzfHtml.info(tr("Type"), tr("nodeTypes")[info.type]);


		function decodeHtml(html) {
		    var txt = document.createElement("textarea");
		    txt.innerHTML = html;
		    return txt.value;
		}

		html += CzfHtml.info(tr("Photos"), CzfHtml.link(info.name, info.galleryurl));
		html += CzfHtml.info(tr("Wiki"), CzfHtml.link(info.name, info.wikiurl));
		if (info.wikitable)
			html += decodeHtml(info.wikitable);
		
		html += CzfHtml.info(tr("Status"), tr("nodeStates")[info.status]);
		html += CzfHtml.info(tr("Owner"), CzfInfo.userLink(info.owner));

		var more = CzfHtml.info(tr("Node ID"), info.id);
		
		if (info.people_count !== null)
			more += CzfHtml.info(tr("People count"), info.people_count);
		
		if (info.machine_count !== null)
			more += CzfHtml.info(tr("Machine count"), info.machine_count);
		
		if (info.created)
		{
			more += CzfHtml.info(tr("Created on"), tr("dateFormat")(info.created.date));
			more += CzfHtml.info(tr("Created by"), CzfInfo.userLink(info.created));
		}
		
		if (info.changed)
		{
			more += CzfHtml.info(tr("Changed on"), tr("dateFormat")(info.changed.date));
			more += CzfHtml.info(tr("Changed by"), CzfInfo.userLink(info.changed));
		}
		
		html += CzfHtml.hiddenBlock(more, "moreinfo", tr("More info..."));
		html += '</p>';
		
		html += '<p>';
		if (info.url_thread)
			html += CzfHtml.link(tr("LMS"), "https://hermes.spoje.net/?m=customerinfo&id=" + info.url_thread) + " ";
		if (info.url_photos)
			html += CzfHtml.link(tr("Photos"), info.url_photos) + " ";
		if (info.url_homepage)
			html += CzfHtml.link(tr("Homepage"), info.url_homepage) + " ";
		html += '</p>';
		
		if (info.address)
			html += CzfHtml.longInfo(tr("Address"), info.address);
		if (info.visibility)
			html += CzfHtml.longInfo(tr("Visibility description"), info.visibility);
		
		html += CzfHtml.longInfo(tr("Coordinates"), this.coord(this.info));
		return html;
	}
	,
	createEdit: function()
	{
		var info = this.info;
		var html = '';
		
		html += '<p>';
		html += CzfHtml.edit("name", tr("Name"), info.name);
		html += CzfHtml.select("type", tr("Type"), info.type, this.getTypes());
		
		var states = this.getStates();
		html += CzfHtml.select("status", tr("Status"), info.status, states);
		if (states[1] === undefined)
			html += CzfHtml.div(CzfHtml.link(tr("How can I make the node active?"),
			        "http://www.czfree.net/forum/misc.php?action=faq&faqgroupid=19#29"), "small");
			
		html += CzfHtml.select("node_secrecy", tr("Secrecy"), info.node_secrecy, this.getSecrecyLevels());
		
		if (info.rights.network)
		{
			var network = info.network ? info.network : "";
			html += CzfHtml.select("network", tr("Network"), network, this.getNetworks(tr("(none)")));
		}
		
		if (info.rights.owner)
			html += CzfHtml.edit("owner", tr("Owner"), info.owner.name);
		
		html += '</p>';
		
		html += CzfHtml.longEdit("address", tr("Address"), info.address, {rows:2});
		html += CzfHtml.longEdit("visibility", tr("Visibility description"), info.visibility, {rows:4});
		
		html += '<p>';
		html += CzfHtml.edit("url_thread", tr("LMS"), info.url_thread);
		html += CzfHtml.edit("url_photos", tr("Photos"), info.url_photos);
		html += CzfHtml.edit("url_homepage", tr("Homepage"), info.url_homepage);
		html += CzfHtml.edit("people_count", tr("People count"), info.people_count, {size:3, max:4});
		html += CzfHtml.checkbox("people_hide", tr("Secret"), info.people_hide);
		html += CzfHtml.edit("machine_count", tr("Machine count"), info.machine_count, {size:3, max:4});
		html += CzfHtml.checkbox("machine_hide", tr("Secret"), info.people_hide);
		html += '</p>';
		
		html += CzfHtml.longInfo(tr("Coordinates"), this.coord(this.info));
		return CzfHtml.form(html, "nodeform", "return false;");
	}
	,
	coord: function(node)
	{
		return this.roundAngle(node.lat) + NBSP + NBSP + this.roundAngle(node.lng);
	}
	,
	roundAngle: function(angle)
	{
		return Math.round(angle * 100000) / 100000;
	}
	,
	getAllowedOptions: function(allOptions, allowedList)
	{
		var allowedOptions = new Object();
		
		for (i in allowedList)
			allowedOptions[allowedList[i]] = allOptions[allowedList[i]];
		
		return allowedOptions;
	}
	,
	getTypes: function()
	{
		return this.getAllowedOptions(tr("nodeTypes"), this.info.rights.types);
	}
	,
	getStates: function()
	{
		return this.getAllowedOptions(tr("nodeStates"), this.info.rights.states);
	}
	,
	getSecrecyLevels: function()
	{
		return this.getAllowedOptions(tr("secrecy"), this.info.rights.secrecy_levels);
	}
	,
	getNetworks: function(defaultText)
	{
		var networks = { "": defaultText };
		
		for (i in CzfConfig.networks)
			networks[i] = CzfConfig.networks[i].name;
		
		return networks;
	}
}
