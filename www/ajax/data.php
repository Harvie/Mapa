<?php

header('Content-Type: text/plain');

foreach (array('north','east','south','west') as $i => $var)
	$bounds[$i] = floatval(@$_GET[$var]);

$nodes = Nodes::selectInArea($bounds, @$_GET['nodes']);
$links = Links::selectInArea($bounds, @$_GET['nodes'], @$_GET['links']);

?>
{
	"nodes":
	[
	<? foreach ($nodes as $row): ?>
	{ id: <?=$row['id']?>, label: "<?=self::escape($row['name'])?>", lat: <?=$row['lat']?>, lng: <?=$row['lng']?>, type: <?=$row['type']?>, status: <?=$row['status']?> },
	<? endforeach ?>],
	
	"links":
	[
	<? foreach ($links as $row): ?>
	{ lat1: <?=$row[0]?>, lng1: <?=$row[1]?>, lat2: <?=$row[2]?>, lng2: <?=$row[3]?>, media: <?=$row['media']?>, active: <?=$row['active']?>, backbone: <?=$row['backbone']?> },
	<? endforeach ?>]
}
