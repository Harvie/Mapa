<?php

$id = intval(@$_GET['id']);
$info = Nodes::fetchInfo($id);
if (!$info) return;

$info['owner'] = array(
	'id' => $info['owner'],
	'name' => User::getNameByID($info['owner']),
	'profile' => Config::$profilePrefix . $info['owner'],
);

if ($info['created_by'] !== null)
{
	$info['created'] = array(
		'date' => self::formatDate($info['created_on']),
		'user' => User::getNameByID($info['created_by']),
		'profile' => Config::$profilePrefix . $info['created_by'],
	);
	
	unset($info['created_on']);
	unset($info['created_by']);
}

if ($info['changed_by'] !== null)
{
	$info['changed'] = array(
		'date' => self::formatDate($info['changed_on']),
		'user' => User::getNameByID($info['changed_by']),
		'profile' => Config::$profilePrefix . $info['changed_by'],
	);
	
	unset($info['changed_on']);
	unset($info['changed_by']);
}

$info['links'] = Links::selectFromNode($id);

self::writeJSON($info);
