var CzfAjax =
{
	get: function(reqName, params, callback)
	{
		var query = this.makeQuery(reqName);
		this.request("GET", query + this.serialize(params), null, callback);
	}
	,
	post: function(reqName, data, callback)
	{
		var query = this.makeQuery(reqName);
		this.request("POST", query, this.serialize(data), callback);
	}
	,
	request: function(method, url, data, callback)
	{
		var req = new XMLHttpRequest();
		req.open(method, url, true);
		req.onload = function (e) {
			if (req.readyState == 4 && req.status == 200 && req.responseText.length > 0)
				callback(eval('(' + req.responseText + ')'));
		}
		req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		req.send(data);
	}
	,
	makeQuery: function(reqName)
	{
		return "index.php?request=" + reqName;
	}
	,
	// PHP deserializes this as nested associative arrays
	serialize: function(data, prefix)
	{
		var query = "";
		
		for (i in data)
		{
			var key;
			
			if (data[i] === null)
				continue;
			
			if (prefix != null)
				key = prefix + "[" + i + "]";
			else
				key = i;
			
			if (data[i] instanceof Object)
				query += this.serialize(data[i], key);
			else
				query += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(data[i]);
		}
		
		return query;
	}
}
