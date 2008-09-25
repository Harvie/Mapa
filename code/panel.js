var CzfPanel =
{
	state: new Object(),
	element: null,
	
	initialize: function(id)
	{
		this.element = document.getElementById(id);
	},
	
	getState: function()
	{
		return this.state;
	},
	
	setState: function(newState)
	{
		this.state = newState;
		
		for (i in this.element.childNodes)
		{
			child = this.element.childNodes[i];
			if (child.nodeName == "INPUT")
				child.checked = !!this.state[child.name];
		}
	},
	
	changed: function(box)
	{
		if (box.checked)
			this.state[box.name] = 1;
		else
			delete this.state[box.name];
		
		CzfMap.moved();
	},
	
	toggle: function(id)
	{
		node = document.getElementById(id + ".block");
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
	},
}
