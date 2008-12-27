#!/usr/bin/php
<?php

error_reporting(E_ALL);

$mysql = new PDO('mysql:dbname=czfreemapa', 'mapa', 'n0d3m0n1t0r');
$mysql->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
$mysql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$mysql->query('SET NAMES latin1');

$pgsql = new PDO('pgsql:dbname=map');
$pgsql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pgsql->beginTransaction();

$pgsql->query('DELETE FROM links');
$pgsql->query('DELETE FROM nodes');

$select = $mysql->query('SELECT id,name,lat-0.00005,lon,type,status,address,'.
                               'visibilitydesc,urlphotos,urlhomepage,urlthread,'.
			       'ownerid,changed_on,changed_by FROM node');
$insert = $pgsql->prepare('INSERT INTO nodes (id,name,lat,lng,type,status,address,visibility,'.
                          'url_photos,url_homepage,url_thread,owner,changed_on,changed_by) '.
			  'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

$select->setFetchMode(PDO::FETCH_NUM);
foreach ($select as $row)
{
	foreach ($row as $i => $value)
		if ($row[$i] !== null)
			$row[$i] = iconv('WINDOWS-1250', 'UTF-8', $row[$i]);

	$insert->execute($row);
}

$select = $mysql->query("SELECT IF(n1.lat < n2.lat, id1, id2), IF(n1.lat < n2.lat, id2, id1), ".
			"line.type+0, IF(backbone='1',1,0), 1-IF(inplanning='1',1,0), ".
			"IF(n1.lat < n2.lat, n1.lat, n2.lat)-0.00005, IF(n1.lat < n2.lat, n1.lon, n2.lon), ".
			"IF(n1.lat < n2.lat, n2.lat, n1.lat)-0.00005, IF(n1.lat < n2.lat, n2.lon, n1.lon), ".
			"line.changed_on, line.changed_by ".
                        "FROM line JOIN node AS n1 ON id1 = n1.id JOIN node AS n2 ON id2 = n2.id ".
                        "WHERE (perm1 >= 30 OR perm2 >= 30) AND id1 != id2 GROUP BY id1,id2");
$insert = $pgsql->prepare('INSERT INTO links (node1,node2,media,backbone,active,lat1,lng1,lat2,lng2,'.
                          'changed_on,changed_by) VALUES(?,?,?,?,?,?,?,?,?,?,?)');

$select->setFetchMode(PDO::FETCH_NUM);
foreach ($select as $row)
	$insert->execute($row);

$pgsql->query("UPDATE nodes SET type = 11 FROM links WHERE node1 = nodes.id AND backbone = 1 AND active = 1 AND nodes.type = 1");
$pgsql->query("UPDATE nodes SET type = 11 FROM links WHERE node2 = nodes.id AND backbone = 1 AND active = 1 AND nodes.type = 1");
$pgsql->query("SELECT setval('nodes_id_seq', (SELECT MAX(id) FROM nodes))");
$pgsql->commit();
