<?php
header('Content-Type: text/plain');

try {
	$dbh = new PDO('pgsql:dbname=map;user=www');
	
	$nodes_sql = "SELECT name,lat,lng,type,status FROM nodes ".
	              "WHERE lat < ? AND lng < ? AND lat > ? AND lng > ?";
	
	$links_sql = "SELECT n1.lat,n1.lng,n2.lat,n2.lng,media,active,backbone FROM links ".
	             "JOIN nodes AS n1 ON node1 = n1.id JOIN nodes AS n2 ON node2 = n2.id ".
	             "WHERE (n1.lat < ? AND n1.lng < ? AND n1.lat > ? AND n1.lng > ?) ".
	                "OR (n2.lat < ? AND n2.lng < ? AND n2.lat > ? AND n2.lng > ?)";
	
	foreach (array('north','east','south','west') as $i => $var)
		$bounds[$i] = floatval(@$_GET[$var]);
	
	$nodes = $dbh->prepare($nodes_sql);
	$nodes->execute($bounds);
	
	$links = $dbh->prepare($links_sql);
	$links->execute(array_merge($bounds, $bounds));
} catch (PDOException $e) {
    print "Database error: " . $e->getMessage();
}

?>
{
	"points":
	[
	<? foreach ($nodes as $row): ?>
	{ label: "<?=addslashes($row['name'])?>", lat: <?=$row['lat']?>, lng: <?=$row['lng']?>, type: <?=$row['type']?>, status: <?=$row['status']?> },
	<? endforeach ?>],
	
	"links":
	[
	<? foreach ($links as $row): ?>
	{ lat1: <?=$row[0]?>, lng1: <?=$row[1]?>, lat2: <?=$row[2]?>, lng2: <?=$row[3]?>, media: <?=$row['media']?>, active: <?=$row['active']?>, backbone: <?=$row['backbone']?> },
	<? endforeach ?>]
}
