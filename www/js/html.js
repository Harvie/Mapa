var CzfHtml =
{
	info: function(title, text)
	{
		return title + ': ' + text + '<br/>';
	}
	,
	longInfo: function(title, text)
	{
		var html = '<p>' + title + ': <div class="text">' + text + '</div></p>';
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
	span: function(title, class)
	{
		return '<span class="' + class + '">' + title + '</span>';
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
	button: function(id, label, action)
	{
		var html = '<button name="' + id + '" onclick="' + action + '" type="button">';
		html += label + '</button>';
		return html;
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
	,
	checkbox: function(id, label, onchange)
	{
		var html = '<input type="checkbox" name="' + id + '" id="' + id + '" onchange="' + onchange + '"/>';
		html += '<label for="' + id + '">' + label + '</label><br />';
		return html;
	}
	,
	form: function(contents, id, onsubmit)
	{
		var html = '<form action="#" method="get" name="' + id + '" onsubmit="' + onsubmit + '">';
        html += '<div>' + contents + '</div></form>';
        return html;
	}
	,
	expandableBlock: function(contents, id, label)
	{
		var html = '<div onclick="CzfHtml.toggle(\'' + id + '\')">';
		html += '<img src="images/plus.png" alt="expand" id="' + id + '.img" />';
		html += '<b>' + label + '</b></div>';
		html += '<div class="panelpart" id="' + id + '">';
		html += contents + '</div>';
		return html;
	}
	,
	toggle: function(id)
	{
		node = document.getElementById(id);
		img = document.getElementById(id + ".img");
		
		if(node.style.display != "block")
		{
			node.style.display = "block";
			img.src = "images/minus.png";
		}
		else
		{
			node.style.display = "none";
			img.src = "images/plus.png";
		}
	}
}
