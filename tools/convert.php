#!/usr/bin/php
<?php

error_reporting(E_ALL);
ini_set('memory_limit', 32*1024*1024);

$mysql = new PDO('mysql:dbname=czfreemapa', 'mapa', 'XXXXXXXX');
$mysql->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
$mysql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$mysql->query('SET NAMES latin1');

$pgsql = new PDO('pgsql:dbname=map');
$pgsql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pgsql->beginTransaction();


// Import nodes (including deleted)

$pgsql->query('DELETE FROM nodes');
$pgsql->query('DELETE FROM nodes_history');

foreach (array(array('node', 'nodes'), array('node_deleted', 'nodes_history')) as $tables)
{
	$select = $mysql->query('SELECT id,name,lat-0.00005,lon,type,status,address,'.
	                               'visibilitydesc,urlphotos,urlhomepage,urlthread,'.
	                               'peoplecount,IF(peoplehide = 1, 1, 0),'.
	                               'machinecount,IF(machinehide = 1, 1, 0),'.
	                               "ownerid,changed_on,changed_by FROM $tables[0]");
	
	$insert = $pgsql->prepare("INSERT INTO $tables[1] (id,name,lat,lng,type,status,".
	                            'address,visibility,url_photos,url_homepage,url_thread,'.
	                            'people_count,people_hide,machine_count,machine_hide,'.
	                            'owner_id,changed_on,changed_by) '.
	                          'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
	
	$select->setFetchMode(PDO::FETCH_NUM);
	foreach ($select as $row)
	{
		foreach ($row as $i => $value)
		{
			if ($row[$i] === '' && $i != 6)
				$row[$i] = null;
			
			if ($row[$i] !== null)
				$row[$i] = str_replace("\r", '', iconv('WINDOWS-1250', 'UTF-8', $row[$i]));
		}
		
		$insert->execute($row);
	}
}


// Reconstruct history of changes

$select = $mysql->query('SELECT id,type,status,ownerid FROM node UNION ALL '.
                        'SELECT id,type,status,ownerid FROM node_deleted');
$select->setFetchMode(PDO::FETCH_ASSOC);
foreach ($select as $row)
	$nodes[$row['id']] = $row;

$select = $mysql->query(
	'SELECT DISTINCT h.changed_on, h.changed_by, h.nodeid, s.ownerid_before AS status,'.
	       'IF(t.ownerid_before IS NULL, NULL, -1) AS type, o.ownerid_before AS owner_id '.
	'FROM node_history AS h '.
	'LEFT JOIN (SELECT * FROM node_history WHERE value = \'S\') AS s '.
	'ON s.changed_by = h.changed_by AND s.changed_on = h.changed_on AND s.nodeid = h.nodeid '.
	'LEFT JOIN (SELECT * FROM node_history WHERE value = \'T\') AS t '.
	'ON t.changed_by = h.changed_by AND t.changed_on = h.changed_on AND t.nodeid = h.nodeid '.
	'LEFT JOIN (SELECT * FROM node_history WHERE value = \'O\') AS o '.
	'ON o.changed_by = h.changed_by AND o.changed_on = h.changed_on AND o.nodeid = h.nodeid '.
	'ORDER BY changed_on DESC');

$insert = $pgsql->prepare('INSERT INTO nodes_history (changed_on,changed_by,id,status,type,owner_id) '.
                          'VALUES(?,?,?,?,?,?)');

$select->setFetchMode(PDO::FETCH_NUM);
foreach ($select as $row)
{
	if (!isset($nodes[$row[2]]))
		continue;
	
	if ($row[0] < '2006-06-28' && $row[3] !== null)
		if ($row[3] < 40)
		{
			$row[4] = $row[3];
			$row[3] = 1;
		}
		else
			$row[4] = 1;
	
	foreach (array(3 => 'status', 4 => 'type', 5 => 'ownerid') as $i => $col)
		if ($row[$i] === null)
			$row[$i] = $nodes[$row[2]][$col];
		else
			$nodes[$row[2]][$col] = $row[$i];
	
	$insert->execute($row);
}


// Import links

$pgsql->query('DELETE FROM links');
$pgsql->query('DELETE FROM links_history');

$select = $mysql->query("SELECT IF(n1.lat < n2.lat, id1, id2), IF(n1.lat < n2.lat, id2, id1), ".
                        "line.type+0, IF(backbone='1',1,0), 1-IF(inplanning='1',1,0), ".
                        "IF(n1.lat < n2.lat, n1.lat, n2.lat)-0.00005, IF(n1.lat < n2.lat, n1.lon, n2.lon), ".
                        "IF(n1.lat < n2.lat, n2.lat, n1.lat)-0.00005, IF(n1.lat < n2.lat, n2.lon, n1.lon), ".
                        "CASE IF(perm1 < perm2, perm1, perm2) WHEN 40 THEN -100 WHEN 10 THEN 100 ELSE 0 END, ".
                        "line.changed_on, line.changed_by ".
                        "FROM line JOIN node AS n1 ON id1 = n1.id JOIN node AS n2 ON id2 = n2.id ".
                        "WHERE (perm1 > 0 AND perm2 > 0) AND id1 != id2 GROUP BY id1,id2");
$insert = $pgsql->prepare('INSERT INTO links (node1,node2,media,backbone,active,lat1,lng1,lat2,lng2,'.
                          'secrecy,changed_on,changed_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)');

$select->setFetchMode(PDO::FETCH_NUM);
foreach ($select as $row)
	$insert->execute($row);

$pgsql->query("UPDATE nodes SET type = 11 FROM links WHERE node1 = nodes.id AND backbone = 1 AND active = 1 AND nodes.type = 1");
$pgsql->query("UPDATE nodes SET type = 11 FROM links WHERE node2 = nodes.id AND backbone = 1 AND active = 1 AND nodes.type = 1");
$pgsql->query("SELECT setval('nodes_id_seq', (SELECT MAX(id) FROM nodes))");
$pgsql->commit();
