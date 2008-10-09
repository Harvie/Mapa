<?php

header('Content-Type: text/plain');
require_once('db.inc.php');

$nodes_sql = "SELECT id,name,lat,lng,type,status FROM nodes ".
				"WHERE lat < ? AND lng < ? AND lat > ? AND lng > ?";

$links_sql = "SELECT n1.lat,n1.lng,n2.lat,n2.lng,media,active,backbone ".
				"FROM nodes AS n1 JOIN links ON (n1.id = node1 OR n1.id = node2) ".
				"JOIN nodes AS n2 ON ((n2.id = node1 OR n2.id = node2) AND n1.id != n2.id) ".
				"WHERE (n1.lat < ? AND n1.lng < ? AND n1.lat > ? AND n1.lng > ?) ".
				"AND (n1.id > n2.id OR NOT (n2.lat < ? AND n2.lng < ? AND n2.lat > ? AND n2.lng > ?))";

if (isset($_GET['aponly']))
{
	$nodes_sql .= "AND type IN(9,10)";
	$links_sql .= "AND n1.type IN(9,10) AND n2.type IN(9,10)";
}

if (isset($_GET['actnode']))
{
	$nodes_sql .= "AND status = 1";
	$links_sql .= "AND n1.status = 1 AND n2.status = 1";
}

if (!isset($_GET['obsolete']))
{
	$nodes_sql .= "AND status != 90 AND type != 0";
	$links_sql .= "AND n1.status != 90 AND n2.status != 90";
}

if (!isset($_GET['alien']))
{
	$nodes_sql .= "AND type != 99";
	$links_sql .= "AND n1.type != 99 AND n2.type != 99";
}

if (isset($_GET['bbonly']))
	$links_sql .= "AND backbone = 1";

if (isset($_GET['actlink']))
	$links_sql .= "AND active = 1";


foreach (array('north','east','south','west') as $i => $var)
	$bounds[$i] = floatval(@$_GET[$var]);

$nodes = $db->prepare($nodes_sql);
$nodes->execute($bounds);

$links = $db->prepare($links_sql);
$links->execute(array_merge($bounds, $bounds));

?>
{
	"points":
	[
	<? foreach ($nodes as $row): ?>
	{ id: <?=$row['id']?>, label: "<?=escape($row['name'])?>", lat: <?=$row['lat']?>, lng: <?=$row['lng']?>, type: <?=$row['type']?>, status: <?=$row['status']?> },
	<? endforeach ?>],
	
	"links":
	[
	<? foreach ($links as $row): ?>
	{ lat1: <?=$row[0]?>, lng1: <?=$row[1]?>, lat2: <?=$row[2]?>, lng2: <?=$row[3]?>, media: <?=$row['media']?>, active: <?=$row['active']?>, backbone: <?=$row['backbone']?> },
	<? endforeach ?>]
}
