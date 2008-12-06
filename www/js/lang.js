var CzfLang =
{
	curLang: null, //Selected language
	
	translations: {
		cs_CZ: {
			"(choose result)" : "(vyberte výsledek)",
			"(new search)" : "(nové hledání)",
			"Address" : "Adresa",
			"Automatic filter" : "Automatický filtr",
			"Cancel" : "Zrušit",
			"Coordinates" : "Souřadnice",
			"Edit node" : "Editace bodu",
			"Filters" : "Filtry",
			"Hide everything" : "Skrýt vše",
			"Hide labels" : "Skrýt popisky",
			"Hide lines" : "Skrýt spoje",
			"Homepage" : "Stránky",
			"Link filter" : "Filtr spojů",
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
			"Save" : "Uložit",
			"Search address" : "Hledání adresy",
			"Search node name" : "Hledání jména bodu",
			"Search" : "Vyhledávání",
			"Show VPN links" : "Zobrazit VPN",
			"Show non-czfree" : "Zobrazit ne-czfree",
			"Show obsolete" : "Zobrazit zastaralé",
			"Status" : "Stav",
			"Thread" : "Diskuse",
			"Type" : "Typ",
			"Visibility description" : "Viditelnost z bodu"
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
