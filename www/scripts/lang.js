var CzfLang =
{
	curLang: null, //Selected language
	
	translations: {
		en: {
			nodeTypes:   { 0: "Unknown", 1: "Client", 9: "Full AP", 10: "Street access AP", 11: "Router", 98: "InfoPoint", 99: "Non-CZF" },
			nodeStates:  { 1: "Active", 10: "Down", 40: "In testing", 79: "Under construction", 80: "In planning", 90: "Obsolete" },
			linkMedia:   { 0: "Unknown", 1: "2.4G", 2: "FSO", 3: "UTP", 4: "Fiber", 5: "VPN", 6: "FSO + WiFi", 7: "5G", 8: "10G", 9: "Licensed", 99: "Other" },
			
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
				99: "Other type of link"
			}
		}
		,
		cs: {
			"Edit" : "Upravit",
			"Cancel" : "Zrušit",
			"Save" : "Uložit",
			"Close" : "Zavřít",
			"Delete" : "Smazat",
			"(choose result)" : "(vyberte výsledek)",
			"(new search)" : "(nové hledání)",
			"Address" : "Adresa",
			"Automatic filter" : "Automatický filtr",
			"Coordinates" : "Souřadnice",
			"Filters" : "Filtry",
			"Hide everything" : "Skrýt vše",
			"Hide labels" : "Skrýt popisky",
			"Hide lines" : "Skrýt spoje",
			"Homepage" : "Stránky",
			"Link filter" : "Filtr spojů",
			"Info" : "Údaje",
			"Links" : "Spoje",
			"Links to other nodes" : "Spojení s ostatními body",
			"Name" : "Jméno",
			"New node": "Nový bod",
			"Node filter" : "Filtr bodů",
			"Node info" : "Informace o bodu",
			"Only AP" : "Jenom AP",
			"Only active" : "Jenom aktivní",
			"Only backbone" : "Jenom páteřní",
			"Photos" : "Fotky",
			"Search address" : "Hledání adresy",
			"Search node name" : "Hledání jména bodu",
			"Search" : "Vyhledávání",
			"Show VPN links" : "Zobrazit VPN",
			"Show non-czfree" : "Zobrazit ne-czfree",
			"Show obsolete" : "Zobrazit zastaralé",
			"Status" : "Stav",
			"Thread" : "Diskuse",
			"Type" : "Typ",
			"Owner" : "Majitel",
			"Visibility description" : "Viditelnost z bodu",
			"Node ID" : "Číslo bodu",
			"Created" : "Vytvořeno",
			"Changed on" : "Změněno",
			"Changed by" : "Změnil",
			"More info..." : "Další údaje...",
			"You can add a new link by right clicking on target node on the map." : "Nový spoj přidáte kliknutím pravým tlačítkem na cílový bod na mapě.",
			"If it doesn't work, try shift + left click." : "Nefunguje-li to, zkuste shift a levé tlačítko.",
			"Node cannot be connected to itself." : "Bod nemůže být spojen sám se sebou.",
			"Link to node '%s' already exists." : "Spoj do bodu '%s' už existuje.",
			"Do you really want to delete node '%s'? This action cannot be undone." : "Opravdu chcete smazat bod '%s'? Tuto akci nebude možné vrátit zpět.",
			"CZFree Node Monitor" : "Mapa sítě CZFree",
			"User" : "Uživatel",
			"not logged in": "nepřihlášen",
			
			nodeTypes:   { 0: "Neznámý", 1: "Klient", 9: "Přístupový bod", 10: "Otevřený př. bod", 11: "Router", 98: "InfoPoint", 99: "Non-CZF" },
			nodeStates:  { 1: "Aktivní", 10: "Nefunkční", 40: "Zkušební", 79: "Ve stavbě", 80: "Plánovaný", 90: "Zastaralý" },
			linkMedia:   { 0: "Neznámý", 1: "2.4G", 2: "FSO", 3: "UTP", 4: "Vlákno", 5: "VPN", 6: "FSO + WiFi", 7: "5G", 8: "10G", 9: "Licencovaný", 99: "Jiný" },
			
			mediaInfo: {
				0: "Neznámý typ spoje",
				1: "Bezdrátový spoj v pásmu 2.4GHz (802.11b/g)",
				2: "Bezdrátový optický spoj (Ronja, Crusader)",
				3: "Ethernet po kovovém vedení",
				4: "Ethernet po optickém vlákně",
				5: "VPN přes Internet",
				6: "Bezdrátový optický spoj zálohovaný Wi-Fi",
				7: "Bezdrátový spoj v pásmu 5.4 - 5.8 GHz (802.11a)",
				8: "Bezdrátový spoj v pásmu 10 GHz",
				9: "Bezdrátový spoj v licenčním pásmu",
				99: "Jiný typ spoje"
			}
		}
	}
	,
	initialize: function()
	{
		langs = CzfConfig.languages;
		
		for (i in langs)
			if (this.translations[langs[i]])
			{
				this.curLang = this.translations[langs[i]];
				return;
			}
		
		this.curLang = this.translations["en"];
	}
	,
	translate: function(string)
	{
		if (this.curLang && this.curLang[string] !== undefined)
			return this.curLang[string];
		else
			return string;
	}
	,
	format: function(msg, arg)
	{
		return this.translate(msg).replace(/%s/, arg);
	}
}

//Shortcut, it's used in many places
function tr(string)
{
	return CzfLang.translate(string);
}
