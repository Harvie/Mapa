var CzfAjax =
{
	get: function(reqName, params, callback)
	{
		var query = "ajax.php?request=" + reqName;
		GDownloadUrl(query + this.serialize(params), callback);
	}
	,
	post: function(reqName, data, callback)
	{
		var query = "ajax.php?request=" + reqName;
		GDownloadUrl(query, callback, this.serialize(data));
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
