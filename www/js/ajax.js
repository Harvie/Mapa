var CzfAjax =
{
	get: function(reqName, params, callback)
	{
		var query = this.makeQuery(reqName);
		var fn = this.makeCallback(callback);
		GDownloadUrl(query + this.serialize(params), fn);
	}
	,
	post: function(reqName, data, callback)
	{
		var query = this.makeQuery(reqName);
		var fn = this.makeCallback(callback);
		GDownloadUrl(query, fn, this.serialize(data));
	}
	,
	makeQuery: function(reqName)
	{
		return "index.php?request=" + reqName;
	}
	,
	makeCallback: function(fn)
	{
		return function(doc) { return doc.length ? fn(eval('(' + doc + ')')) : null; };
	}
	,
	// PHP deserializes this as nested associative arrays
	serialize: function(data, prefix)
	{
		var query = "";
		
		for (i in data)
		{
			var key;
			
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
