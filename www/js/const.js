var CzfConst =
{
	nodeTypes:   { 0: "Unknown", 1: "Client", 9: "Full AP", 10: "Steet access AP", 11: "Router", 98: "InfoPoint", 99: "Non-CZF" },
	nodeStates:  { 1: "Active", 10: "Down", 40: "In testing", 79: "Under construction", 80: "In planning", 90: "Obsolete" },
	linkMedia:   { 0: "N/A", 1: "2.4G", 2: "FSO", 3: "UTP", 4: "Fiber", 5: "VPN", 6: "FSO + WiFi", 7: "5G", 8: "10G", 9: "Licensed", 99: "Other" },
	
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
}
