#!/usr/bin/php
<?php

error_reporting(E_ALL);

$mysql = new PDO('mysql:dbname=czfreemapa', 'mapa', 'XXXXXXXX');
$mysql->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
$mysql->query('SET NAMES latin1');

$pgsql = new PDO('pgsql:dbname=map');
$pgsql->beginTransaction();

$pgsql->query('DELETE FROM links');
$pgsql->query('DELETE FROM nodes');

$select = $mysql->query('SELECT id,name,lat,lon,type,status,address,visibilitydesc,'.
                               'urlphotos,urlhomepage,urlthread FROM node');
$insert = $pgsql->prepare('INSERT INTO nodes (id,name,lat,lng,type,status,address,visibility,'.
                          'url_photos,url_homepage,url_thread) VALUES(?,?,?,?,?,?,?,?,?,?,?)');

$select->setFetchMode(PDO::FETCH_NUM);
foreach ($select as $row)
{
	foreach ($row as $i => $value)
		$row[$i] = iconv('WINDOWS-1250', 'UTF-8', $row[$i]);

	if (!$insert->execute($row))
	{
		$error = $insert->errorInfo();
		print_r($row);
		die($error[2]."\n");
	}
}

$select = $mysql->query("SELECT id1, id2, line.type+0, IF(backbone='1',1,0), 1-IF(inplanning='1',1,0), ".
			"IF(n1.lat < n2.lat, n1.lat, n2.lat), IF(n1.lat < n2.lat, n1.lon, n2.lon), ".
			"IF(n1.lat < n2.lat, n2.lat, n1.lat), IF(n1.lat < n2.lat, n2.lon, n1.lon) ".
                        "FROM line JOIN node AS n1 ON id1 = n1.id JOIN node AS n2 ON id2 = n2.id ".
                        "WHERE (perm1 >= 30 OR perm2 >= 30) AND id1 != id2 GROUP BY id1,id2");
$insert = $pgsql->prepare('INSERT INTO links (node1,node2,media,backbone,active,lat1,lng1,lat2,lng2)'.
                          ' VALUES(?,?,?,?,?,?,?,?,?)');

$select->setFetchMode(PDO::FETCH_NUM);
foreach ($select as $row)
	if (!$insert->execute($row))
	{
		$error = $insert->errorInfo();
		die($error[2]."\n");
	}

$pgsql->query("UPDATE nodes SET type = 11 FROM links WHERE node1 = nodes.id AND backbone = 1 AND active = 1 AND nodes.type = 1");
$pgsql->query("UPDATE nodes SET type = 11 FROM links WHERE node2 = nodes.id AND backbone = 1 AND active = 1 AND nodes.type = 1");
$pgsql->commit();
