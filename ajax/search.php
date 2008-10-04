<?php

header('Content-Type: text/plain');
require_once('db.inc.php');

$query = '%' . @$_GET['query'] . '%';
$select = $db->prepare('SELECT id, name, lat, lng FROM nodes WHERE name ILIKE ? LIMIT 20');
$select->execute(array($query));

?>
[
<? foreach ($select as $row): ?>
	{ id: <?=$row['id']?>, name: "<?=addslashes($row['name'])?>", lat: <?=$row['lat']?>, lng: <?=$row['lng']?> },
<? endforeach ?>
]
