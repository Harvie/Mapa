<?php

class Nodes
{
	private static $columns = array('name', 'type', 'status', 'address', 'lat', 'lng',
	                                'url_photos', 'url_homepage', 'url_thread');
	
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
	
	public static function findByName($name)
	{	
		//'%' means any string, '_' means any character in SQL pattern matching
		$name = str_replace(array('%','_'), array('\%','\_'), $name);
		
		$select = Query::select('SELECT id, name, lat, lng FROM nodes WHERE name ILIKE ? ORDER BY name LIMIT 20');
		$select->execute(array("%$name%"));
		return $select;
	}
}
