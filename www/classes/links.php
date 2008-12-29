<?php

class Links
{
	private static $keys = array('node1', 'node2');
	private static $cols_edit = array('media', 'active', 'backbone');
	private static $cols_log = array('links.changed_on', 'links.changed_by', 'links.created_on', 'links.created_by');
	private static $filters = array('media', 'active', 'backbone');
	
	public static function selectFromNode($id)
	{
		$columns = array_merge(Nodes::getBasicColumns(), self::$cols_edit, self::$cols_log);
		$collist = implode(',', $columns);
		
		$query = Query::prepare(
			"SELECT $collist FROM links JOIN nodes ON node2 = nodes.id WHERE node1 = ?".
			' UNION ALL '.
			"SELECT $collist FROM links JOIN nodes ON node1 = nodes.id WHERE node2 = ?"
		);
		
		$query->execute(array($id, $id));
		return $query->fetchAll(PDO::FETCH_ASSOC);
	}
	
	public static function insert($data, $node1, $node2)
	{
		$columns = array_merge(self::$cols_edit, array('lat1', 'lng1', 'lat2', 'lng2'));
		
		$pos1 = Nodes::fetchPos(intval($node1));
		$pos2 = Nodes::fetchPos(intval($node2));
		
		if (!$pos1 || !$pos2)
			return false;
		
		$end1 = array($node1, $pos1['lat'], $pos1['lng']);
		$end2 = array($node2, $pos2['lat'], $pos2['lng']);
		
		if (floatval($pos1['lat']) > floatval($pos2['lat']))
			list($end1, $end2) = array($end2, $end1); //swap
		
		list($data['node1'], $data['lat1'], $data['lng1']) = $end1;
		list($data['node2'], $data['lat2'], $data['lng2']) = $end2;
		
		$insert = Query::insert('links', array_merge($columns, self::$keys));
		$insert->execute($data);
	}
	
	public static function update($link, $node)
	{
		self::setEndpoints($link, $node);
		$update = Query::update('links', self::$cols_edit, self::$keys);
		$update->execute($link);
	}
		
	public static function delete($link, $node)
	{
		self::setEndpoints($link, $node);
		$delete = Query::delete('links', self::$keys);
		$delete->execute($link);
	}
	
	private static function setEndpoints(&$link, $node)
	{
		if (floatval($node['lat']) < floatval($link['lat']))
		{
			$link['node1'] = intval($node['id']);
			$link['node2'] = intval($link['peerid']);
		}
		else
		{
			$link['node1'] = intval($link['peerid']);
			$link['node2'] = intval($node['id']);
		}
	}
	
	// Coordinates of link endpoints are duplicated in table links so they
	// can be indexed for fast retrieval of links that cross viewport. Also
	// links are always stored that lat1 <= lat2. So if the node was moved,
	// the coordinates must be updated and also sometimes the line endpoints
	// have to be swapped.
	public static function fixLinkEndpoints($id, $lat, $lng)
	{
		$select = Query::prepare('SELECT * FROM links WHERE node1 = ? OR node2 = ? FOR UPDATE');
		$select->execute(array($id, $id));
		$links = $select->fetchAll(PDO::FETCH_ASSOC);
		
		if (count($links) == 0)
			return;
		
		$delete = Query::prepare('DELETE FROM links WHERE node1 = ? OR node2 = ?');
		$delete->execute(array($id, $id));
		
		$insert = Query::insert('links', array_keys($links[0]));
		foreach ($links as $row)
		{
			if ($row['node1'] == $id)
			{
				$row['lat1'] = $lat;
				$row['lng1'] = $lng;
			}
			else
			{
				$row['lat2'] = $lat;
				$row['lng2'] = $lng;
			}
			
			if (floatval($row['lat1']) > floatval($row['lat2']))
			{
				list(   $row['node1'], $row['lat1'], $row['lng1'], $row['node2'], $row['lat2'], $row['lng2'])
				= array($row['node2'], $row['lat2'], $row['lng2'], $row['node1'], $row['lat1'], $row['lng1']);
			}
			
			$insert->execute($row);
		}
	}
	
	public static function selectInArea($bounds, $nodefilters, $linkfilters)
	{
		$sql = "SELECT lat1,lng1,lat2,lng2,media,active,backbone FROM links ".
		       "JOIN nodes AS n1 ON node1 = n1.id JOIN nodes AS n2 ON node2 = n2.id ".
		       "WHERE ((lat1 < ? AND lng1 < ? AND lat2 > ? AND lng2 > ?) ".
		           "OR (lat1 < ? AND lng2 < ? AND lat2 > ? AND lng1 > ?))";
		
		$sql .= Nodes::makeFilterSQL('n1', $nodefilters);
		$sql .= Nodes::makeFilterSQL('n2', $nodefilters);
		
		foreach (self::$filters as $column)
			$sql .= Query::filtersToSQL('links', $column, $linkfilters);

		$select = Query::prepare($sql);
		$select->execute(array_merge($bounds, $bounds));
		$select->setFetchMode(PDO::FETCH_ASSOC);
		return $select;
	}
}
