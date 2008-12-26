var CzfAnchor =
{
	callback: null,
	defaults: null,
	lastHash: null,
	
	initialize: function(callback, defaults)
	{
		this.callback = callback;
		this.defaults = defaults;
		
		this.check();
		window.setInterval(GEvent.callback(this, this.check), 500);
	}
	,
	update: function(state)
	{
		var hash = "";
		for (param in state)
			hash += param + "=" + state[param] + "&";
		
		document.location.hash = hash;
		this.lastHash = "#" + hash;
	}
	,
	check: function()
	{
		if (this.lastHash != document.location.hash)
		{
			this.lastHash = document.location.hash;
			this.decode(this.lastHash);
		}
	}
	,
	decode: function(hash)
	{
		var paramList = hash.substring(1).split("&");
		var paramObj = new Object();
		
		if (paramList.length > 1)
		{
			for (i in paramList)
			{
				varval = paramList[i].split("=");
				if (varval.length == 2)
					paramObj[varval[0]] = varval[1];
			}
		}
		else
			paramObj = this.defaults;
		
		this.callback(paramObj);
	}
	
}
