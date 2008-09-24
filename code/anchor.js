function CzfAnchor(callback, defaults)
{
	this.lastHash = null;
	this.callback = callback;
	this.defaults = defaults;
	
	this.update = function(s)
	{
		var hash = "#zoom=" + s.zoom + "&lat=" + s.lat + "&lng=" + s.lng;
		document.location.hash = hash;
		this.lastHash = hash;
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
		var paramObj = this.defaults;
		
		for (i in paramList)
		{
			varval = paramList[i].split("=");
			paramObj[varval[0]] = varval[1];
		}
		
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
