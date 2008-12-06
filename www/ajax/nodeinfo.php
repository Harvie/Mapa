<?php

header('Content-Type: text/plain');

$id = intval(@$_GET['id']);
$info = Nodes::fetchInfo($id);
if (!$info) return;

$links_query = Links::selectFromNode($id);

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
