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
		
		if (!User::canEdit($node))
		{
			$filter = " AND secrecy <= ?";
			array_push($values, User::getRights());
		}
		
		$columns = array_merge(Nodes::getBasicColumns(), self::$cols_edit, self::$cols_log);
		$query = self::selectFromNodeGeneric($columns, $filter, $values);
		return $query->fetchAll();
	}
	
	public static function deleteFromNode($node)
	{
		$values = array($node['id']);
		$query = self::selectFromNodeGeneric(self::$keys, "", $values);
		
		foreach ($query as $link)
			History::delete('links', $link, self::$keys);
	}
	
	private static function selectFromNodeGeneric($columns, $filter, $values)
	{
		$collist = implode(',', $columns);
		
		$query = Query::prepare(
			"SELECT $collist FROM links JOIN nodes ON node2 = nodes.id WHERE node1 = ?$filter".
			' UNION ALL '.
			"SELECT $collist FROM links JOIN nodes ON node1 = nodes.id WHERE node2 = ?$filter"
		);
		
		$query->execute(array_merge($values, $values));
		return $query;
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
		return $select;
	}
	
	public static function insert($link, $node)
	{
		self::fillNodes($link, $node);
		self::checkRights($link, $node);
		History::insert('links', $link, array_merge(self::$cols_edit, self::$keys));
		self::updatePos($link);
	}
	
	public static function update($link, $node)
	{
		self::fillNodes($link, $node);
		self::checkRights($link, $node);
		History::update('links', $link, self::$cols_edit, self::$keys);
		self::updatePos($link);
	}
		
	public static function delete($link, $node)
	{
		self::fillNodes($link, $node);
		History::delete('links', $link, self::$keys);
	}
	
	private static function fillNodes(&$link, $node)
	{
		$node1 = intval($node['id']);
		$node2 = intval($link['id']);
		
		if ($node1 < $node2)
			list($link['node1'], $link['node2']) = array($node1, $node2);
		else
			list($link['node1'], $link['node2']) = array($node2, $node1);
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
	
	private static function updatePos($link)
	{
		self::updatePosGeneric("node1 = ? AND node2 = ?", array($link['node1'], $link['node2']));
	}
	
	public static function fixLinkEndpoints($id)
	{
		self::updatePosGeneric("node1 = ? OR node2 = ?", array($id, $id));
	}
	
	// Coordinates of link endpoints are duplicated in table links so that 
	// they can be indexed for fast retrieval of links that cross viewport.
	// Also the endpoints are ordered so that lat1 <= lat2. If the node was
	// moved, the coordinates have to be updated.
	private static function updatePosGeneric($where, $values)
	{
		$sql = 'UPDATE links SET lat1 = IF(n1.lat < n2.lat, n1.lat, n2.lat), '.
		                        'lng1 = IF(n1.lat < n2.lat, n1.lng, n2.lng), '.
		                        'lat2 = IF(n1.lat < n2.lat, n2.lat, n1.lat), '.
		                        'lng2 = IF(n1.lat < n2.lat, n2.lng, n1.lng) '.
		       'FROM nodes AS n1, nodes AS n2 WHERE node1 = n1.id AND node2 = n2.id';
		
		$update = Query::prepare("$sql AND ($where)");
		$update->execute($values);
	}
	
	public static function getRights($link = null, $node = null)
	{
		return array(
			'active' => (User::isMapper() || ($link && $link['active'])
			             || ($node && $node['status'] == 1)),
			'backbone' => (User::isMapper() || ($link && $link['backbone'])),
		);
	}
	
	private static function fetchByKey($keyVal, $columns)
	{
		$query = Query::select('links', $columns, self::$keys);
		return $query->execute($keyVal)->fetch();
	}
	
	private static function checkRights($link, $node)
	{
		$orig = self::fetchByKey($link, array('active'));
		$rights = self::getRights($orig, $node);
		
		if ($link['active'] && !$rights['active'])
			throw new Exception('Permission to make link '.$link['id'].' active denied.');
		
		if ($link['backbone'] && !$rights['backbone'])
			throw new Exception('Permission to mark link '.$link['id'].' as backbone denied.');
	}
}
