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
		return title + ': ' + text + '<br/>';
	}
	,
	longInfo: function(title, text)
	{
		var info = this.elem("div", {class:"text"}, text.replace(/\n/g, "<br/>"));
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
		return this.elem("span", { class: "click", onclick: action }, title);
	}
	,
	span: function(contents, classList)
	{
		var classes = classList.join(" ");
		return this.elem("span", { class: classList.join(" ") }, contents);
	}
	,
	img: function(title, src)
	{
		return this.elem("img", { src: src, alt: title, title: title });
	}
	,
	expl: function(title, text)
	{
		return this.elem("span", { title: title }, text);
	}
	,
	clear: function(spacer)
	{
		return this.elem("div", { class: "clear" }, (spacer ? "&nbsp;" : ""));
	}
	,
	button: function(id, label, action)
	{
		return this.elem("button", { name: id, onclick: action, type: "button" }, label);
	}
	,
	label: function(id, label)
	{
		return this.elem("label", { "for": id }, label + ":");
	}
	,
	edit: function(id, label, value, params)
	{
		var title =  this.label(id, label) + "<br/>";
		var attr = { type: "text", name: id, id: id, size: 18, maxlength: 50, value: this.nullFix(value) };
		return title + this.elem("input", attr) + "<br/>";
	}
	,
	longEdit: function(id, label, value)
	{
		var title = this.label(id, label) + "<br/>";
		var attr = { name: id, id: id, rows: 4, cols: 17 };
		return title + this.elem("textarea", attr, this.nullFix(value)) + "<br/>";
	}
	,
	nullFix: function(text)
	{
		return (text !== null) ? text : "";
	}
	,
	select: function(id, label, value, options, params)
	{
		var title = this.label(id, label) + ((params && params.nowrap) ? " " : "<br/>");
		var optHtml = "";
		
		for (i in options)
		{
			var attr = (i == value) ? { value: i, selected: "selected" } : { value: i };
			optHtml += this.elem("option", attr, options[i]);
		}
		
		return title + this.elem("select", { name: id }, optHtml) + "<br/>";
	}
	,
	checkbox: function(id, label, value, params)
	{
		var attr = { type: "checkbox", name: id, id: id };
		if (value) attr.checked = "checked";
		if (params && params.disabled) attr.disabled = "disabled";
		if (params && params.onchange) attr.onchange = params.onchange;
		return this.elem("input", attr) + this.label(id, label) + "<br/>";
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
		var body = this.elem("div", { class: "panelpart", id: id }, contents);
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
		             class: "click expand", id: id + ".label" };
		var header = this.elem("div", attr, label);
		var hidden = this.elem("div", { class: "hidden", id: id }, contents);
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
