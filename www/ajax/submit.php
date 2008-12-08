<?php

if (!isset($_POST['id']))
	return;

Query::beginTransaction();

if ($_POST['id'] === "new")
	$id = Nodes::insert($_POST);
else
{
	$id = intval($_POST['id']);
	$_POST['id'] = $id;
	Nodes::update($_POST, isset($_POST['moved']));
}

if (is_array($_POST['links']))
	foreach ($_POST['links'] as $link)
		if (is_array($link) && isset($link['changed']))
			Links::update($link, $_POST);

Query::commit();
echo "{ id: $id }";
