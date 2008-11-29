var CzfHtml =
{
	longText: function(title, text)
	{
		var html = '<p>' + title + ': <div>' + text + '</div></p>';
		return html.replace(/\n/g, "<br/>");
	}
	,
	link: function(title, target)
	{
		return '<a href="' + target + '">' + title + '</a>';
	}
	,
	click: function(title, action)
	{
		return '<span onclick="' + action + '">' + title + '</span>';
	}
	,
	img: function(title, src)
	{
		return '<img src="' + src + '" alt="' + title + '" title="' + title + '" />';
	}
	,
	expl: function(title, text)
	{
		return '<span title="' + title + '">' + text + '</span>';
	}
	,
	clear: function(spacer)
	{
		return '<div class="clear">' + (spacer ? '&nbsp;' : '') + '</div>';
	}
}
