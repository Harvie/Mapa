<?php
header('Content-Type: text/plain');

try {
	$query = '%' . @$_GET['query'] . '%';
	
	$dbh = new PDO('pgsql:dbname=map;user=www');
	$stmt = $dbh->prepare('SELECT id, name, lat, lng FROM nodes WHERE name ILIKE ? LIMIT 20');
	$stmt->execute(array($query));
} catch (PDOException $e) {
    print "Database error: " . $e->getMessage();
}

?>
[
<? foreach ($stmt as $row): ?>
	{ id: <?=$row['id']?>, name: "<?=addslashes($row['name'])?>", lat: <?=$row['lat']?>, lng: <?=$row['lng']?> },
<? endforeach ?>
]
