<?php

class Nodes
{
	private static $columns = array('name', 'type', 'status', 'address', 'lat', 'lng',
	                                'url_photos', 'url_homepage', 'url_thread', 'visibility',
	                                'people_count', 'people_hide', 'machine_count', 'machine_hide');
	private static $cols_basic = array('id', 'name', 'type', 'status', 'lat', 'lng');
	private static $filters = array('type', 'status');
	
	private static $types = array(1, 9, 10, 11, 98, 99, 0);
	private static $types_user = array(1, 9, 10);
	
	private static $states = array(80, 79, 40, 1, 90);
 	private static $states_user = array(80, 79);
	
	public function insert($data)
	{
		self::checkRights($data);
		
		$columns = array_merge(self::$columns, array('owner_id'));
		$data['owner_id'] = User::getID();
		
		History::insert('nodes', $data, $columns);
		return Query::lastInsertId();
	}
	
	public static function update($data, $allowMove)
	{
		self::checkRights($data);
		$columns = self::$columns;
		
		if (!$allowMove)
		{
			unset($columns['lat']);
			unset($columns['lng']);
		}
		
		History::update('nodes', $data, $columns);
		
		if ($allowMove)
			Links::fixLinkEndpoints($data['id']);
	}
	
	public static function delete($data)
	{
		self::checkRights($data);
		History::delete('nodes', $data);
	}
	
	public static function fetchInfo($id)
	{
		$info = self::fetchByID($id, null);
		
		if ($info['people_hide'] && !User::canEdit($info['owner_id']))
			$info['people_count'] = null;
		
		if ($info['machine_hide'] && !User::canEdit($info['owner_id']))
			$info['machine_count'] = null;
		
		return $info;
	}
	
	public static function fetchPos($id)
	{
		return self::fetchByID($id, array('lat', 'lng'));
	}
	
	private static function fetchByID($id, $columns)
	{
		$query = Query::select('nodes', $columns);
		$query->execute(array('id' => $id));
		$row = $query->fetch(PDO::FETCH_ASSOC);
		
		if ($row == false)
			throw new Exception("Invalid node ID!");
		
		return $row;
	}
	
	public static function findByName($name)
	{
		//'%' means any string, '_' means any character in SQL pattern matching
		$name = str_replace(array('%','_'), array('\%','\_'), $name);
		
		$select = Query::prepare('SELECT id, name, lat, lng FROM nodes WHERE name ILIKE ? ORDER BY name LIMIT 20');
		$select->execute(array("%$name%"));
		$select->setFetchMode(PDO::FETCH_ASSOC);
		return $select;
	}
	
	public static function selectInArea($bounds, $filters)
	{
		$sql = "SELECT id,name,lat,lng,type,status FROM nodes ".
		       "WHERE lat < ? AND lng < ? AND lat > ? AND lng > ?";
		
		$sql .= self::makeFilterSQL('nodes', $filters);
		$select = Query::prepare($sql);
		$select->execute($bounds);
		$select->setFetchMode(PDO::FETCH_ASSOC);
		return $select;
	}
	
	//Used also by class Links (only links to displayed nodes are shown)
	public static function makeFilterSQL($tableAlias, $filters)
	{
		$sql = "";
		foreach (self::$filters as $column)
			$sql .= Query::filtersToSQL($tableAlias, $column, $filters);
		return $sql;
	}
	
	public static function getBasicColumns()
	{
		return self::$cols_basic;
	}
	
	public static function getRights($node = null)
	{
		$rights = array(
			'edit' => $node ? User::canEdit($node['owner_id']) : User::isLogged(),
			'types' => User::isMapper() ? self::$types : self::$types_user,
			'states' => User::isMapper() ? self::$states : self::$states_user,
		);
		
		if ($node && !User::isMapper())
		{
			if (!in_array($node['type'], $rights['types']))
				array_push($rights['types'], $node['type']);
		
			if (!in_array($node['status'], $rights['states']))
				array_push($rights['states'], $node['status']);
		}
		
		return $rights;
	}
	
	private static function checkRights($node)
	{
		$cols = array('owner_id', 'status', 'type');
		$orig = $node['id'] ? self::fetchByID($node['id'], $cols) : null;
		$rights = self::getRights($orig);
		
		if (!$rights['edit'])
			throw new Exception('Permission to edit the node denied.');
		
		if (!in_array($node['status'], $rights['states']))
			throw new Exception('Permission to set node status denied.');
		
		if (!in_array($node['type'], $rights['types']))
			throw new Exception('Permission to set node type denied.');
	}
}
