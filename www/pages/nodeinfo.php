<?php

$id = intval(@$_GET['id']);
$info = Nodes::fetchInfo($id);
if (!$info) return;

$info['owner'] = array(
	'name' => User::getNameByID($info['owner_id']),
	'profile' => Config::$profilePrefix . $info['owner_id'],
);

History::convertChangeInfo($info);

$info['links'] = Links::selectFromNode($id);
foreach ($info['links'] as $i => $link)
	History::convertChangeInfo($info['links'][$i]);

self::writeJSON($info);
