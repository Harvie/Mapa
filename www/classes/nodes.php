<?php

class Nodes
{
	private static $columns = array('name', 'type', 'status', 'address', 'lat', 'lng',
	                                'url_photos', 'url_homepage', 'url_thread');
	private static $filters = array('type', 'status');
	
	public function insert($data)
	{
		$insert = Query::insert('nodes', self::$columns);
		$insert->execute($data);
		return Query::lastInsertId();
	}
	
	public static function update($data, $allowMove)
	{
		$columns = self::$columns;
		
		if ($allowMove)
			Links::fixLinkEndpoints($data['id'], $data['lat'], $data['lng']);
		else
		{
			unset($columns['lat']);
			unset($columns['lng']);
		}
		
		$update = Query::update('nodes', $columns);
		$update->execute($data);
	}
	
	public static function fetchInfo($id)
	{
		$query = Query::select('SELECT * FROM nodes WHERE id = ?');
		$query->execute(array($id));
		return $query->fetch();
	}
	
	public static function fetchPos($id)
	{
		$query = Query::select('SELECT lat,lng FROM nodes WHERE id = ?');
		$query->execute(array($id));
		return $query->fetch();
	}
	
	public static function findByName($name)
	{
		//'%' means any string, '_' means any character in SQL pattern matching
		$name = str_replace(array('%','_'), array('\%','\_'), $name);
		
		$select = Query::select('SELECT id, name, lat, lng FROM nodes WHERE name ILIKE ? ORDER BY name LIMIT 20');
		$select->execute(array("%$name%"));
		return $select;
	}
	
	public static function selectInArea($bounds, $filters)
	{
		$sql = "SELECT id,name,lat,lng,type,status FROM nodes ".
		       "WHERE lat < ? AND lng < ? AND lat > ? AND lng > ?";
		
		$sql .= self::makeFilterSQL('nodes', $filters);
		$select = Query::select($sql);
		$select->execute($bounds);
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
}
