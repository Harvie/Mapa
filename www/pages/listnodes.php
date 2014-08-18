<?php

header('Content-Type: text/plain');

$sql = "SELECT id,lat,lng,status,owner_id,name FROM nodes ".
       "WHERE true " . User::makeSecrecyFilter('nodes') .
       "ORDER BY id";

$select = Query::prepare($sql);
$select->execute();

foreach ($select as $node)
{
	$node['id'] = '[' . $node['id'] . ']';
	$node['owner_id'] = User::getNameByID($node['owner_id']);
	echo implode("\t", $node) . "\n";
}
