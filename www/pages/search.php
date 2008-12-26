<?php

header('Content-Type: text/plain');

if (isset($_GET['query']) && strlen($_GET['query']) > 1)
	$select = Nodes::findByName($_GET['query']);
else
	$select = array();

?>
[
<? foreach ($select as $row): ?>
	{ id: <?=$row['id']?>, name: "<?=self::escape($row['name'])?>", lat: <?=$row['lat']?>, lng: <?=$row['lng']?> },
<? endforeach ?>
]
