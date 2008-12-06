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

Query::commit();
echo "{ id: $id }";
