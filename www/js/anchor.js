function CzfAnchor(callback, defaults)
{
	this.callback = callback;
	this.defaults = defaults;
	this.lastHash = null;
	
	this.update = function(state)
	{
		var hash = "";
		for (param in state)
			hash += param + "=" + state[param] + "&";
		
		document.location.hash = hash;
		this.lastHash = "#" + hash;
	}
	
	this.check = function()
	{
		if (this.lastHash != document.location.hash)
		{
			this.lastHash = document.location.hash;
			this.decode(this.lastHash);
		}
	}
	
	this.decode = function(hash)
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
	
	this.methodCall = function(fn)
	{
		var _this = this;
		return function() { fn.apply(_this, arguments); };
	}
	
	this.check();
	window.setInterval(this.methodCall(this.check), 500);
}