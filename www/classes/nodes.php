<?php

class Nodes
{
	private static $columns = array('name', 'type', 'status', 'address', 'lat', 'lng',
	                                'url_photos', 'url_homepage', 'url_thread');
	private static $cols_basic = array('id', 'name', 'type', 'status', 'lat', 'lng');
	private static $filters = array('type', 'status');
	
	public function insert($data)
	{
		$columns = array_merge(self::$columns, array('owner'));
		$data['owner'] = User::getID();
		
		History::insert('nodes', $data, $columns);
		return Query::lastInsertId();
	}
	
	public static function update($data, $allowMove)
	{
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
}
