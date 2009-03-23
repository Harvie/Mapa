<?php

header('Content-Type: text/plain');

$sql = "SELECT node1,node2,media,backbone,active FROM links ".
       "WHERE secrecy <= ? ORDER BY node1, node2";
$select = Query::prepare($sql);
$select->execute(array(User::getRights()));

foreach ($select as $link)
{
	$link['node1'] = '[' . $link['node1'] . ']';
	$link['node2'] = '[' . $link['node2'] . ']';
	echo implode("\t", $link) . "\n";
}
