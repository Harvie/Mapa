var CzfLang =
{
	curLang: null, //Selected language
	
	translations: {
		en: {
			nodeTypes:   { 0: "Unknown", 1: "Client", 9: "Switch", 10: "AP",
			               11: "Router", 97: "Hidden", 98: "InfoPoint", 99: "Non-CZF" },
			nodeStates:  { 1: "Active", 40: "Active; without agreement", 10: "Under construction; agreement",
			               79: "Under construction; without agreement", 80: "In planning", 90: "Obsolete" },
			linkMedia:   { 0: "Unknown", 1: "2.4 GHz", 7: "5 GHz", 12: "5 GHz MIMO", 8: "10 GHz", 98: "10 GHz over 100 Mbps", 
				      13: "17 GHz", 14: "24 GHz", 10: "60 GHz+", 2: "FSO", 6: "FSO 1Gbps", 3: "UTP", 4: "Fiber", 97: "HDPE",
			               9: "Licensed", 11: "Leased", 5: "VPN", 9: "Licensed", 99: "Other" },
			secrecy:     { "-100": "None", 0: "Registered", 100: "Mapper" },

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
                                10: "Wireless link in 60 GHz or higher band",
                                11: "Leased optical line",
                                12: "Dual polarization Wireless link in 5 GHz band",
                                99: "Other type of link"
                        },

			
			
			dateFormat: function(date) { return date; }
		}
		,
		cs: {
			"Legend" : "Legenda",
			"Node types" : "Druhy bodů",
			"Node states" : "Stavy bodů",
			"Link types" : "Druhy spojů",
			"Back": "Zpět",
			"Edit" : "Upravit",
			"Cancel" : "Zrušit",
			"Save" : "Uložit",
			"Close" : "Zavřít",
			"Delete" : "Smazat",
			"Restore" : "Obnovit",
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
			"Nodes in neighborhood": "Seznam bodů v okolí",
			"Neighborhood of node %s:": "Okolí bodu %s:",
			"Create new node": "Vytvořit nový bod",
			"Node filter" : "Filtr bodů",
			"Node info" : "Informace o bodu",
			"All networks" : "Všechny sítě",
			"Only AP" : "Jenom AP",
			"Only active" : "Jenom aktivní",
			"Only backbone" : "Jenom páteřní",
			"Only non-active node" : "Jenom neaktivní",
			"Only node without agreement" : "Jenom BEZ smlouvy",
			"Only node in planning" : "Jenom plánované",
			"Only node under construct" : "Jenom body ve stavbě",
			"Photos" : "Fotky",
			"Search address" : "Hledání adresy",
			"Search node name" : "Hledání jména bodu",
			"Search" : "Vyhledávání",
			"Show VPN links" : "Zobrazit VPN",
			"Show non-czfree" : "Zobrazit non-czfree",
			"Show obsolete" : "Zobrazit zastaralé",
			"Name" : "Jméno",
			"Network" : "Síť",
			"(none)" : "(žádná)",
			"Status" : "Stav",
			"LMS" : "LMS",
			"Type" : "Typ",
			"Owner" : "Majitel",
			"(deleted)" : "(smazaný)",
			"Visibility description" : "Viditelnost z bodu",
			"Node ID" : "Číslo bodu",
			"People count" : "Počet lidí",
			"Machine count" : "Počet počítačů",
			"Secret" : "Utajit",
			"Created on" : "Vytvořeno",
			"Created by" : "Vytvořil",
			"Changed on" : "Změněno",
			"Changed by" : "Změnil",
			"More info..." : "Další údaje...",
			"Secrecy" : "Utajení",
			"Backbone link" : "Páteřní spoj",
			"Planned link" : "Plánovaný spoj",
			"Speeds (in Mbit):" : "Rychlosti (Mbit):",
			"Nominal" : "Nominální",
			"Real" : "Skutečná",
			"CZFree" : "CZFree",
			"Changed by %s on %s.": "Změnil %s %s.",
			"Created by %s on %s.": "Přidal %s %s.",
			"You can add a new link by right clicking on target node on the map." : "Nový spoj přidáte kliknutím pravým tlačítkem na cílový bod na mapě.",
			"If it doesn't work, try shift + left click." : "Nefunguje-li to, zkuste shift a levé tlačítko.",
			"Node cannot be connected to itself." : "Bod nemůže být spojen sám se sebou.",
			"Link to node '%s' already exists." : "Spoj do bodu '%s' už existuje.",
			"Do you really want to delete node '%s'? This action cannot be undone." : "Opravdu chcete smazat bod '%s'? Tuto akci nebude možné vrátit zpět.",
			"Node with name '%s' already exists." : "Bod pojmenovaný '%s' už existuje.",
			"Changes cannot be saved:" : "Změny nelze uložit:",
			"Node name must be filled in." : "Jméno bodu musí být vyplněné.",
			"Node address must be filled in." : "Adresa bodu musí být vyplněná.",
			"People count must be a number." : "Počet lidí musí být číslo.",
			"Machine count must be a number." : "Počet počítačů musí být číslo.",
			"How can I make the node active?" : "Jak změním stav na aktivní?",
			"CZFree Node Monitor" : "Mapa sítě CZFree",
			"User" : "Uživatel",
			"not logged in": "nepřihlášen",
			"Distance from node '%s' to node '%s' is %s, azimuth is %s°.": "Vzdálenost bodu '%s' od bodu '%s' je %s s azimutem %s°.",
			"Distance from node '%s' to clicked point is %s, azimuth is %s°." : "Vzdálenost bodu '%s' od místa kliknutí je %s s azimutem %s°.",
			"Left click on a node on the map to display information." : "Klikněte levým tlačítkem na bod na mapě pro zobrazení informací.",
			
			nodeTypes:   { 0: "Neznámý", 1: "Klient", 9: "Switch", 10: "Stožár AP",
			               11: "Router", 97: "Skrytý", 98: "InfoPoint", 99: "Non-CZF" },
			nodeStates:  { 1: "Aktivní", 40: "Aktivní; není smlouva", 10: "Ve stavbě; smlouva",
			               79: "Ve stavbě; není smlouva", 80: "Plánovaný", 90: "Zrušený" },
			linkMedia:   { 0: "Neznámý", 1: "2.4 GHz", 7: "5 GHz", 12: "5 GHz MIMO", 8: "10 GHz", 98: "10 GHz over 100 Mbps",
				      13: "17 GHz", 14: "24 GHz", 10: "60 GHz+", 2: "FSO", 6: "FSO 1Gbps", 3: "UTP", 4: "Optika", 97: "Chránička",
			               9: "Licencovaný", 11: "Pronajatý",  5: "VPN", 99: "Other" },
			secrecy:     { "-100": "Žádné", 0: "Přihlášení", 100: "Mappeři" },
			
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
				10: "Bezdrátový spoj v 60GHz a vyšším pásmu",
				11: "Pronajatý optický spoj",
				12: "Bezdrátový spoj v pásmu 5 GHz na dvou polarizacích",
				99: "Jiný typ spoje"
			},
			
			dateFormat: function(date) { return date.replace(/(\d+)-0*(\d+)-0*(\d+)/, "$3.$2.$1"); }
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
	format: function()
	{
		var msg;
		
		for (var i = 0; i < arguments.length; i++)
			if (i == 0)
				msg = this.translate(arguments[i]);
			else
				msg = msg.replace(/%s/, arguments[i]);
		
		return msg;
	}
}

//Shortcut, it's used in many places
function tr(string)
{
	return CzfLang.translate(string);
}
