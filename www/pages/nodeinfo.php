<?php

header('Content-Type: text/plain');

$id = intval(@$_GET['id']);
$info = Nodes::fetchInfo($id);
if (!$info) return;

$ownerName = User::getNameByID($info['owner']);
$ownerProfile = Config::$profilePrefix . $info['owner'];
$links_query = Links::selectFromNode($id);

if ($info['created_by'] !== null)
	$creationInfo = array(
		'time' => $info['created_on'],
		'user' => User::getNameByID($info['created_by']),
		'profile' => Config::$profilePrefix . $info['created_by'],
	);

if ($info['changed_by'] !== null)
	$changeInfo = array(
		'time' => $info['changed_on'],
		'user' => User::getNameByID($info['changed_by']),
		'profile' => Config::$profilePrefix . $info['changed_by'],
	);

?>
{
	id: <?=$info['id']?>,
	name: "<?=self::escape($info['name'])?>",
	lat: <?=$info['lat']?>,
	lng: <?=$info['lng']?>,
	type: <?=$info['type']?>,
	status: <?=$info['status']?>,
	address: "<?=self::escape($info['address'])?>",
	url_photos: "<?=self::escape($info['url_photos'])?>",
	url_homepage: "<?=self::escape($info['url_homepage'])?>",
	url_thread: "<?=self::escape($info['url_thread'])?>",
	visibility: "<?=self::escape($info['visibility'])?>",
	owner: {
		id: <?=$info['owner']?>,
		name: "<?=self::escape($ownerName)?>",
		profile: "<?=self::escape($ownerProfile)?>" 
	},
<? if ($creationInfo): ?>
	created: {
		date: "<?= self::formatDate($creationInfo['time']) ?>",
		user: "<?= self::escape($creationInfo['user']) ?>",
		profile: "<?= self::escape($creationInfo['profile']) ?>" 
	},
<? endif ?>
<? if ($changeInfo): ?>
	changed: {
		date: "<?= self::formatDate($changeInfo['time']) ?>",
		user: "<?= self::escape($changeInfo['user']) ?>",
		profile: "<?= self::escape($changeInfo['profile']) ?>" 
	},
<? endif ?>
	links:
	[<? foreach ($links_query as $row): ?>	
		{
			id: <?=$row['id']?>,
			name: "<?=self::escape($row['name'])?>",
			lat: <?=$row['lat']?>,
			lng: <?=$row['lng']?>,
			type: <?=$row['type']?>,
			status: <?=$row['status']?>,
			media: <?=$row['media']?>,
			active: <?=$row['active']?>,
			backbone: <?=$row['backbone']?> 
		},
	<? endforeach ?>]
}
