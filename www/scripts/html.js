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
		return '<a href="' + target + '" target="_blank">' + title + '</a>';
	}
	,
	click: function(title, action)
	{
		return '<span onclick="' + action + '">' + title + '</span>';
	}
	,
	span: function(contents, classList)
	{
		var classes = classList.join(" ");
		return '<span class="' + classes + '">' + contents + '</span>';
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
		html += 'value="' + this.nullFix(value) + '" size="18" maxlength="50" /><br/>';
		return html;
	}
	,
	longEdit: function(id, label, value)
	{
		var html = '<label for="' + id + '">' + label + ':</label><br />';
		html += '<textarea name="' + id + '" id="' + id + '" rows="4" cols="17">';
		html += this.nullFix(value) + '</textarea><br/>';
		return html;
	}
	,
	nullFix: function(text)
	{
		return (text !== null) ? text : "";
	}
	,
	select: function(id, label, value, options, nowrap)
	{
		var html = '<label for="' + id + '">' + label + ':</label>';
		html += nowrap ? ' ' : '<br/>';
		
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
	checkbox: function(id, label, onchange, checked)
	{
		var html = '<input type="checkbox" ' + (checked ? ' checked="checked"' : '');
		html += 'name="' + id + '" id="' + id + '" onchange="' + onchange + '"/>';
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
	panelPart: function(contents, id, label)
	{
		var html = '<div onclick="CzfHtml.togglePanel(\'' + id + '\')">';
		html += '<img src="images/plus.png" alt="expand" id="' + id + '.img" />';
		html += '<b>' + label + '</b></div>';
		html += '<div class="panelpart" id="' + id + '">';
		html += contents + '</div>';
		return html;
	}
	,
	togglePanel: function(id)
	{
		var node = document.getElementById(id);
		var img = document.getElementById(id + ".img");
		
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
	,
	hiddenBlock: function(contents, id, label)
	{
		var html = '';
		html += '<div onclick="CzfHtml.showBlock(\'' + id + '\')" ';
		html += 'class="click" id="' + id + '.label">' + label + '</div>';
		html += '<div class="hidden" id="' + id + '">' + contents + '</div>';
		return html;
	}
	,
	showBlock: function(id)
	{
		var block = document.getElementById(id);
		var label = document.getElementById(id + ".label");
		
		block.style.display = "block";
		label.style.display = "none";
	}
}
