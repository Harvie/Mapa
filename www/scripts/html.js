var BR = "<br/>";
var NBSP = "&nbsp;";

var CzfHtml =
{
	elem: function(name, attributes, contents)
	{
		var html = "<" + name;
		
		for (attrName in attributes)
			html += " " + attrName + '="' + attributes[attrName] + '"';
		
		if (contents === undefined)
			html += " />";
		else
			html += ">" + contents + "</" + name +">";
		
		return html;
	}
	,
	info: function(title, text)
	{
		return title + ': ' + text + BR;
	}
	,
	longInfo: function(title, text)
	{
		var info = this.elem("div", { "class": "text" }, text.replace(/\n/g, BR));
		return this.elem("p", {}, title + ": " + info);
	}
	,
	link: function(title, target)
	{
		return this.elem("a", { href: target, target: "_blank" }, title);
	}
	,
	click: function(title, action)
	{
		return this.elem("span", { "class": "click", onclick: action }, title);
	}
	,
	p: function(contents, _class)
	{
		return this.elem("p", _class ? { "class": _class } : {}, contents);
	}
	,
	div: function(contents, _class)
	{
		return this.elem("div", { "class": _class }, contents);
	}
	,
	span: function(contents, classList)
	{
		var classes = classList.join(" ");
		return this.elem("span", { "class": classList.join(" ") }, contents);
	}
	,
	img: function(title, src)
	{
		return this.elem("img", { src: src, alt: title, title: title });
	}
	,
	expl: function(title, text, _class)
	{
		return this.elem("span", { title: title, "class": (_class ? _class : "expl") }, text);
	}
	,
	clear: function(spacer)
	{
		return this.elem("div", { "class": "clear" }, (spacer ? NBSP : ""));
	}
	,
	table: function(rows)
	{
		var html = "";
		
		for (i in rows)
		{
			var row = "";
			for (j in rows[i])
				row += CzfHtml.elem("td", {}, rows[i][j]);
			html += CzfHtml.elem("tr", {}, row);
		}
		
		return this.elem("table", {}, html);
	}
	,
	button: function(id, label, action)
	{
		return this.elem("button", { name: id, onclick: action, type: "button" }, label);
	}
	,
	label: function(id, label, params)
	{
		var html = this.elem("label", { "for": id }, label + ":");
		return html + (params && params.nowrap ? " " : BR);
	}
	,
	edit: function(id, label, value, params)
	{
		var title = label ? this.label(id, label, params) : "";
		var attr = { type: "text", name: id, id: id, value: this.nullFix(value) };
		attr.size = (params && params.size) ? params.size : 18;
		attr.maxlength = (params && params.max) ? params.max : 50;
		if (params && params.onchange) attr.onchange = params.onchange;
		return title + this.elem("input", attr) + (attr.size > 3 ? BR : " ");
	}
	,
	longEdit: function(id, label, value, params)
	{
		var title = label ? this.label(id, label, params) : "";
		var attr = { name: id, id: id, rows: params.rows, cols: 17 };
		return title + this.elem("textarea", attr, this.nullFix(value)) + BR;
	}
	,
	nullFix: function(text)
	{
		return (text !== null && text !== undefined) ? text : "";
	}
	,
	select: function(id, label, value, options, params)
	{
		var title = label ? this.label(id, label, params) : "";
		var optHtml = "";
		
		for (i in options)
		{
			var attr = { value: i, id: id + "_" + i };
			if (i == value) attr.selected = "selected";
			optHtml += this.elem("option", attr, options[i]);
		}
		
		var attr = { name: id };
		if (params && params.onchange) attr.onchange = params.onchange;
		return title + this.elem("select", attr, optHtml) + BR;
	}
	,
	checkbox: function(id, label, value, params)
	{
		var label = this.elem("label", { "for" : id }, label);
		var attr = { type: "checkbox", name: id, id: id };
		if (value) attr.checked = "checked";
		if (params && params.disabled) attr.disabled = "disabled";
		if (params && params.onchange) attr.onchange = params.onchange;
		return this.elem("input", attr) + label + BR;
	}
	,
	form: function(contents, id, onsubmit)
	{
		var attr = { action: "#", method: "get", name: id, onsubmit: onsubmit };
		return this.elem("form", attr, this.elem("div", {}, contents));
	}
	,
	panelPart: function(contents, id, label)
	{
		var img = this.elem("img", { src: "images/plus.png", id: id + ".img" });
		var title = img + this.elem("b", {}, label);
		var header = this.elem("div", { onclick: "CzfHtml.togglePanel('" + id + "')" }, title);
		var body = this.elem("div", { "class": "panelpart", id: id }, contents);
		return header + body;
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
		var attr = { onclick: "CzfHtml.showBlock('" + id + "')",
		             "class": "click expand", id: id + ".label" };
		var header = this.elem("div", attr, label);
		var hidden = this.elem("div", { "class": "hidden", id: id }, contents);
		return header + hidden;
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
