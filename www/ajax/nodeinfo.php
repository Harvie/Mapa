<?php

header('Content-Type: text/plain');

$id = intval(@$_GET['id']);

$info_query = self::$db->prepare('SELECT * FROM nodes WHERE id = ?');
$info_query->execute(array($id));

$info = $info_query->fetch();
if (!$info) return;

$links_query = self::$db->prepare(
	'SELECT * FROM links JOIN nodes ON node2 = nodes.id WHERE node1 = ?'.
	' UNION ALL '.
	'SELECT * FROM links JOIN nodes ON node1 = nodes.id WHERE node2 = ?'
);

$links_query->execute(array($id, $id));

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
	links:
	[<? foreach ($links_query as $row): ?>	
		{
			peerid: <?=$row['id']?>,
			peername: "<?=self::escape($row['name'])?>",
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
