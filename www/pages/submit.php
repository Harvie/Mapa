<?php

$node = $_POST;

if (!isset($node['id']))
	throw new Exception("Missing node ID!");

$node['id'] = intval($node['id']);

Query::beginTransaction();

try {
	if ($node['id'] == 0)
		$node['id'] = Nodes::insert($node);
	else
	{
		if ($node['deleteNode'])
		{
			Nodes::delete($node);
			$node['id'] = 0;
		}
		else
			Nodes::update($node, isset($node['moved']));
	}
}
catch (PDOException $e)
{
	//UNIQUE violation - name already exists
	if ($e->errorInfo[0] == 23505)
		self::fail("DUPLICATE_NAME");
	else
		throw $e;
	return;
}
	
if ($node['id'] != 0 && is_array($node['links']))
	foreach ($node['links'] as $link)
	{
		if (!is_array($link))
			continue;
		
		if(isset($link['update']))
			Links::update($link, $node);
		
		if(isset($link['insert']))
			Links::insert($link, $node);
		
		if(isset($link['remove']))
			Links::delete($link, $node);
	}

Query::commit();
self::writeJSON(array("id" => $node['id']));
