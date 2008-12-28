<?php

class Nodes
{
	private static $columns = array('name', 'type', 'status', 'address', 'lat', 'lng',
	                                'url_photos', 'url_homepage', 'url_thread');
	private static $filters = array('type', 'status');
	
	public function insert($data)
	{
		$columns = array_merge(self::$columns, array('owner', 'created_on', 'created_by'));
		$data['owner'] = $data['created_by'] = User::getID();
		$data['created_on'] = 'now';
		
		$insert = Query::insert('nodes', $columns);
		$insert->execute($data);
		return Query::lastInsertId();
	}
	
	public static function update($data, $allowMove)
	{
		$columns = array_merge(self::$columns, array('changed_on', 'changed_by'));
		$data['changed_by'] = User::getID();
		$data['changed_on'] = 'now';
		
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
	
	public static function delete($data)
	{
		$delete = Query::delete('nodes');
		$delete->execute($data);
	}
	
	public static function fetchInfo($id)
	{
		$query = Query::prepare('SELECT * FROM nodes WHERE id = ?');
		$query->execute(array($id));
		return $query->fetch(PDO::FETCH_ASSOC);
	}
	
	public static function fetchPos($id)
	{
		$query = Query::prepare('SELECT lat,lng FROM nodes WHERE id = ?');
		$query->execute(array($id));
		return $query->fetch();
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
}
