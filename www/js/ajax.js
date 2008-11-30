var CzfAjax =
{
	get: function(reqName, params, callback)
	{
		var query = "ajax.php?request=" + reqName;
		
		for (i in params)
			query += "&" + i + "=" + encodeURIComponent(params[i]);
		
		GDownloadUrl(query, callback);
	}
}
