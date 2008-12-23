var CzfLang =
{
	curLang: null, //Selected language
	
	translations: {
		cs_CZ: {
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
			"Node ID" : "Číslo bodu",
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
			"Visibility description" : "Viditelnost z bodu",
			"You can add a new link by right clicking on target node on the map." : "Nový spoj přidáte kliknutím pravým tlačítkem na cílový bod na mapě.",
			"If it doesn't work, try shift + left click." : "Nefunguje-li to, zkuste shift a levé tlačítko.",
			"Node cannot be connected to itself." : "Bod nemůže být spojen sám se sebou.",
			"Link to node '%s' already exists." : "Spoj do bodu '%s' už existuje.",
			"Do you really want to delete node '%s'? This action cannot be undone." : "Opravdu chcete smazat bod '%s'? Tuto akci nebude možné vrátit zpět.",
			"CZFree Node Monitor" : "Mapa sítě CZFree" //There is no comma!
		}
	},
	
	setLang: function(lang)
	{
		if (this.translations[lang])
			this.curLang = this.translations[lang];
	}
	,
	translate: function(string)
	{
		if (this.curLang && this.curLang[string] !== undefined)
			return this.curLang[string];
		else
			return string;
	}
}

//Shortcut, it's used in many places
function tr(string)
{
	return CzfLang.translate(string);
}
