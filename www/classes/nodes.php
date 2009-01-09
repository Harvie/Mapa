<?php

class Nodes
{
	private static $columns = array('name', 'type', 'status', 'address', 'lat', 'lng',
	                                'url_photos', 'url_homepage', 'url_thread');
	private static $cols_basic = array('id', 'name', 'type', 'status', 'lat', 'lng');
	private static $filters = array('type', 'status');
	
	private static $node_types = array(1, 9, 10, 11, 98, 99, 0);
	private static $node_types_user = array(1, 9, 10);
	
	private static $node_states = array(80, 79, 40, 1, 90);
 	private static $node_states_user = array(80, 79);
	
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
		
		if ($allowMove)
			Links::fixLinkEndpoints($data['id'], $data['lat'], $data['lng']);
		else
		{
			unset($columns['lat']);
			unset($columns['lng']);
		}
		
		History::update('nodes', $data, self::$columns);
	}
	
	public static function delete($data)
	{
		self::checkRights($data);
		History::delete('nodes', $data);
	}
	
	public static function fetchInfo($id)
	{
		$query = Query::select('nodes');
		$query->execute(array('id' => $id));
		return $query->fetch();
	}
	
	public static function fetchPos($id)
	{
		$query = Query::select('nodes', array('lat', 'lng'));
		$query->execute(array('id' => $id));
		return $query->fetch(PDO::FETCH_ASSOC);
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
			'edit' => ($node === null) ? User::isLogged() : User::canEdit($node['owner_id']),
			'node_types' => User::isMapper() ? self::$node_types : self::$node_types_user,
			'node_states' => User::isMapper() ? self::$node_states : self::$node_states_user,
		);
		
		if ($node && !User::isMapper())
		{
			if (!in_array($node['type'], $rights['node_types']))
				array_push($rights['node_types'], $node['type']);
		
			if (!in_array($node['status'], $rights['node_states']))
				array_push($rights['node_states'], $node['status']);
		}
		
		return $rights;
	}
	
	public static function checkRights($node)
	{
		$orig = ($node['id'] == 0) ? null : self::fetchInfo($node['id']);
		$rights = self::getRights($orig);
		
		if (!$rights['edit'])
			throw new Exception('Permission to edit the node denied.');
		
		if (!in_array($node['status'], $rights['node_states']))
			throw new Exception('Permission to set node status denied.');
		
		if (!in_array($node['type'], $rights['node_types']))
			throw new Exception('Permission to set node type denied.');
	}
}
