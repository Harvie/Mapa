var CzfMain =
{
	start: function(mapID, panelID)
	{
		if (GBrowserIsCompatible())
		{
			CzfLang.setLang("cs_CZ");
			CzfMap.initialize(document.getElementById(mapID));
			CzfPanel.initialize(document.getElementById(panelID));
		}
	}
	,
	stop: function()
	{
		GUnload();
	}
}
