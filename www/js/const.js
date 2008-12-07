var CzfConst =
{
	mediaColors: [ "#000000", "#00CC00", "#AA2222", "#88DDFF", "#AA22AA", "#00FFFF", "#FF0000", "#CCCCCC", "#FFFFFF", "#FF8800" ],
	defaults:    { lat: 50.006915, lng: 14.422809, zoom: 15, autofilter: 1, type: "k" },
	autoFilter:  { actnode: 1, aponly: 1, actlink: 1, bbonly: 1 },
	nodeTypes:   { 0: "Unknown", 1: "Client", 9: "Full AP", 10: "Steet access AP", 11: "Router", 98: "InfoPoint", 99: "Non-CZF" },
	nodeStates:  { 1: "Active", 10: "Down", 40: "In testing", 79: "Under (re)construction", 80: "In planning", 90: "Obsolete" },
	linkMedia:   { 0: "N/A", 1: "2.4G", 2: "FSO", 3: "UTP", 4: "Fiber", 5: "VPN", 6: "FSO + WiFi", 7: "5G", 8: "10G", 9: "Licensed", 99: "Other" },
	newInfo:     { id: "new", name: "", type: 1, status: 80, url_thread: "", url_photos: "",
	               url_homepage: "", address: "", visibility: "", links: new Array() },
	
	mediaInfo: {
		 0: "Unknown type of link",
		 1: "Wireless link in 2.4GHz band (802.11b/g)",
		 2: "Free Space Optical link (Ronja, Crusader)",
		 3: "Ethernet over metallic cable",
		 4: "Ethernet over optical fiber",
		 5: "VPN over Internet",
		 6: "Free Space Optical link backed by Wi-Fi",
		 7: "Wireless link in 5.4 - 5.8 GHz band (802.11a)",
		 8: "Wireless link in 10 GHz band",
		 9: "Wireless link in licensed band",
		99: "Other type of link" },
	
	clone: function(varName)
	{
		copy = new Object();
		
		for (i in this[varName])
			copy[i] = this[varName][i]
		
		return copy;
	}
}
