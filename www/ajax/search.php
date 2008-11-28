<?php

header('Content-Type: text/plain');

if (isset($_GET['query']) && strlen($_GET['query']) > 1)
{
	$query = '%' . $_GET['query'] . '%';
	$select = $db->prepare('SELECT id, name, lat, lng FROM nodes WHERE name ILIKE ? ORDER BY name LIMIT 20');
	$select->execute(array($query));
}
else
	$select = array();

?>
[
<? foreach ($select as $row): ?>
	{ id: <?=$row['id']?>, name: "<?=escape($row['name'])?>", lat: <?=$row['lat']?>, lng: <?=$row['lng']?> },
<? endforeach ?>
]
