<?php

header('Content-Type: text/plain');
require_once('db.inc.php');

$select = $db->prepare('SELECT * FROM nodes WHERE id = ?');
$select->execute(array($_GET['id']));

$row = $select->fetch();
if (!$row) return;

?>
{
	id: <?=$row['id']?>,
	name: "<?=escape($row['name'])?>",
	lat: <?=$row['lat']?>,
	lng: <?=$row['lng']?>,
	type: <?=$row['type']?>,
	status: <?=$row['status']?>,
	address: "<?=escape($row['address'])?>",
	url_photos: "<?=escape($row['url_photos'])?>",
	url_homepage: "<?=escape($row['url_homepage'])?>",
	url_thread: "<?=escape($row['url_thread'])?>",
	visibility: "<?=escape($row['visibility'])?>",
}
