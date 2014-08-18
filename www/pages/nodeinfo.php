<?php

$id = intval(@$_GET['id']);
$info = Nodes::fetchInfo($id);
if (!$info) return;

$info['owner'] = array(
	'name' => User::getNameByID($info['owner_id']),
	'profile' => Config::$profilePrefix . $info['owner_id'],
);

History::convertChangeInfo($info);
$info['rights'] = Nodes::getRights($info);
$info['linkRights'] = Links::getRights(null, $info);

$info['links'] = Links::selectFromNode($info);
foreach ($info['links'] as $i => $link)
{
	History::convertChangeInfo($info['links'][$i]);
	$info['links'][$i]['rights'] = Links::getRights($link, $info);
}

self::writeJSON($info);
