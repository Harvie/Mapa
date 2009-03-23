<?php

header('Content-Type: text/plain');

$columns = array('id','lat','lng','status','owner_id','name');
$select = Query::selectAll('nodes', $columns, 'id');

foreach ($select->execute() as $node)
{
	$node['id'] = '[' . $node['id'] . ']';
	$node['owner_id'] = User::getNameByID($node['owner_id']);
	echo implode("\t", $node) . "\n";
}
