var CzfNodeInfo =
{
	info: null,
	marker: null,
	elementID: null,
	newInfo: { id: 0, type: 1, status: 80 },
	fields: [ "name", "network", "type", "status", "address",
	          "visibility", "url_thread", "url_photos", "url_homepage",
	          "people_count", "people_hide", "machine_count", "machine_hide" ],
	
	initialize: function(elementID)
	{
		this.elementID = elementID;
		
		var callback = GEvent.callback(this, this.markerMoved);
		this.marker = CzfMap.createMarker({draggable: true});
		GEvent.addListener(this.marker, "dragend", callback);
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
		this.marker.hide();
		
		if (this.info && this.info.editing)
		{
			var pos = new GLatLng(this.info.lat, this.info.lng);
			this.marker.setLatLng(pos);
			this.marker.show();
		}
	}
	,
	markerMoved: function(pos)
	{
		this.info.lat = pos.lat();
		this.info.lng = pos.lng();
		this.info.moved = true;
		
		this.copyFormData();
		CzfInfo.updateInfo();
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
			html += CzfHtml.link(tr("Thread"), info.url_thread) + " ";
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
			
		if (info.rights.network)
			html += CzfHtml.select("network", tr("Network"), info.network, this.getNetworks(tr("(none)")));
		if (info.rights.owner)
			html += CzfHtml.edit("owner", tr("Owner"), info.owner.name);
		html += '</p>';
		
		html += CzfHtml.longEdit("address", tr("Address"), info.address, {rows:2});
		html += CzfHtml.longEdit("visibility", tr("Visibility description"), info.visibility, {rows:4});
		
		html += '<p>';
		html += CzfHtml.edit("url_thread", tr("Thread"), info.url_thread);
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
	getTypes: function()
	{
		var allowedTypes = new Object();
		var allTypes = tr("nodeTypes");
		var typeList = this.info.rights.types;
		
		for (i in typeList)
			allowedTypes[typeList[i]] = allTypes[typeList[i]];
		
		return allowedTypes;
	}
	,
	getStates: function()
	{
		var allowedStates = new Object();
		var allStates = tr("nodeStates");
		var statusList = this.info.rights.states;
		
		for (i in statusList)
			allowedStates[statusList[i]] = allStates[statusList[i]];
		
		return allowedStates;
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
