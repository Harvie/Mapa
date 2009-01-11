<?php

class Links
{
	private static $keys = array('node1', 'node2');
	private static $cols_edit = array('media', 'active', 'backbone', 'secrecy', 'nominal_speed', 'real_speed', 'czf_speed');
	private static $cols_log = array('links.changed_on', 'links.changed_by', 'links.created_on', 'links.created_by');
	private static $filters = array('media', 'active', 'backbone');
	
	public static function selectFromNode($node)
	{
		$filter = "";
		$values = array($node['id']);
		
		if (!User::canEdit($node['owner_id']))
		{
			$filter = " AND secrecy <= ?";
			array_push($values, User::getRights());
		}
		
		$columns = array_merge(Nodes::getBasicColumns(), self::$cols_edit, self::$cols_log);
		$collist = implode(',', $columns);
		
		$query = Query::prepare(
			"SELECT $collist FROM links JOIN nodes ON node2 = nodes.id WHERE node1 = ?$filter".
			' UNION ALL '.
			"SELECT $collist FROM links JOIN nodes ON node1 = nodes.id WHERE node2 = ?$filter"
		);
		
		$query->execute(array_merge($values, $values));
		return $query->fetchAll(PDO::FETCH_ASSOC);
	}
	
	public static function selectInArea($bounds, $nodefilters, $linkfilters)
	{
		$sql = "SELECT lat1,lng1,lat2,lng2,media,active,backbone FROM links ".
		       "JOIN nodes AS n1 ON node1 = n1.id JOIN nodes AS n2 ON node2 = n2.id ".
		       "WHERE ((lat1 < ? AND lng1 < ? AND lat2 > ? AND lng2 > ?) ".
		           "OR (lat1 < ? AND lng2 < ? AND lat2 > ? AND lng1 > ?)) ".
		          "AND secrecy <= ?";
		
		$sql .= Nodes::makeFilterSQL('n1', $nodefilters);
		$sql .= Nodes::makeFilterSQL('n2', $nodefilters);
		
		foreach (self::$filters as $column)
			$sql .= Query::filtersToSQL('links', $column, $linkfilters);

		$select = Query::prepare($sql);
		$select->execute(array_merge($bounds, $bounds, array(User::getRights())));
		$select->setFetchMode(PDO::FETCH_ASSOC);
		return $select;
	}
	
	public static function insert($link, $node)
	{
		$nodes = array(intval($node['id']), intval($link['id']));
		$pos = array(Nodes::fetchPos($nodes[0]), Nodes::fetchPos($nodes[1]));
		
		foreach (array(1,2) as $i => $n)
		{
			if (!$pos[$i])
				return false;
			
			$link["node$n"] = $nodes[$i];
			$link["lat$n"] = $pos[$i]['lat'];
			$link["lng$n"] = $pos[$i]['lng'];
		}
		
		self::reorderEndpoints($link);
		self::checkRights($link, $node);
		
		$columns = array_merge(self::$cols_edit, array('lat1', 'lng1', 'lat2', 'lng2'));
		History::insert('links', $link, array_merge($columns, self::$keys));
	}
	
	public static function update($link, $node)
	{
		self::setEndpoints($link, $node);
		self::checkRights($link, $node);
		History::update('links', $link, self::$cols_edit, self::$keys);
	}
		
	public static function delete($link, $node)
	{
		self::setEndpoints($link, $node);
		$delete = History::delete('links', $link, self::$keys);
	}
	
	private static function setEndpoints(&$link, $node)
	{
		if (floatval($node['lat']) < floatval($link['lat']))
		{
			$link['node1'] = intval($node['id']);
			$link['node2'] = intval($link['id']);
		}
		else
		{
			$link['node1'] = intval($link['id']);
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
			
			self::reorderEndpoints($row);
			$insert->execute($row);
		}
	}
	
	private static function reorderEndpoints(&$l)
	{
		if (floatval($l['lat1']) > floatval($l['lat2']))
		{
			list(   $l['node1'], $l['lat1'], $l['lng1'], $l['node2'], $l['lat2'], $l['lng2'])
			= array($l['node2'], $l['lat2'], $l['lng2'], $l['node1'], $l['lat1'], $l['lng1']);
		}
	}
	
	public static function getRights($link = null, $node = null)
	{
		return array(
			'active' => (User::isMapper() || ($link && $link['active'])
			             || ($node && $node['status'] == 1)),
		);
	}
	
	private static function fetchByKey($keyVal, $columns)
	{
		$query = Query::select('links', $columns, self::$keys);
		$query->execute($keyVal);
		return $query->fetch(PDO::FETCH_ASSOC);
	}
	
	private static function checkRights($link, $node)
	{
		$orig = self::fetchByKey($link, array('active'));
		$rights = self::getRights($orig, $node);
		
		if ($link['active'] && !$rights['active'])
			throw new Exception('Permission to make link '.$link['id'].' active denied.');
	}
}
