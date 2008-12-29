<?php

$id = intval(@$_GET['id']);
$info = Nodes::fetchInfo($id);
if (!$info) return;

$info['owner'] = array(
	'id' => $info['owner'],
	'name' => User::getNameByID($info['owner']),
	'profile' => Config::$profilePrefix . $info['owner'],
);

self::convertChangeInfo($info);

$info['links'] = Links::selectFromNode($id);
foreach ($info['links'] as $i => $link)
	self::convertChangeInfo($info['links'][$i]);

self::writeJSON($info);
