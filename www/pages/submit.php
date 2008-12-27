<?php

if (!isset($_POST['id']))
	throw new Exception("Missing node ID!");

$id = intval($_POST['id']);
$_POST['id'] = $id;

if (User::getRights() < User::RIGHTS_MAPPER)
	throw new Exception("Permission denied.");

Query::beginTransaction();

if ($id == 0)
	$id = Nodes::insert($_POST);
else
{
	if ($_POST['deleteNode'])
	{
		Nodes::delete($_POST);
		$id = 0;
	}
	else
		Nodes::update($_POST, isset($_POST['moved']));
}

if ($id != 0 && is_array($_POST['links']))
	foreach ($_POST['links'] as $link)
	{
		if (!is_array($link))
			continue;
		
		if(isset($link['changed']))
			Links::update($link, $_POST);
		
		if(isset($link['added']))
			Links::insert($link, $id, $link['peerid']);
		
		if(isset($link['deleted']))
			Links::delete($link, $_POST);
	}

Query::commit();
echo "{ id: $id }";
