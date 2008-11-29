var CzfHtml =
{
	info: function(title, text)
	{
		return title + ': ' + text + '<br/>';
	}
	,
	longInfo: function(title, text)
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
	button: function(title, action)
	{
		return '<button onclick="' + action + '" type="button">' + title + '</button>';
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
	,
	edit: function(id, label, value)
	{
		var html = '<label for="' + id + '">' + label + ':</label><br />';
		html += '<input type="text" name="' + id + '" id="' + id + '" ';
		html += 'value="' + value + '" size="18" maxlength="50" /><br/>';
		return html;
	}
	,
	longEdit: function(id, label, value)
	{
		var html = '<label for="' + id + '">' + label + ':</label><br />';
		html += '<textarea name="' + id + '" id="' + id + '" rows="4" cols="17">';
		html += value + '</textarea><br/>';
		return html;
	}
	,
	select: function(id, label, value, options)
	{
		var html = '<label for="' + id + '">' + label + ':</label><br />';
		
		html += '<select name="' + id + '">';
		for (i in options)
		{
			selected = (i == value) ? ' selected="selected"' : '';
			html += '<option value="' + i + '"' + selected + '>';
			html += options[i] + '</option>';
		}
		html += '</select><br/>';
		
		return html;
	}
}
