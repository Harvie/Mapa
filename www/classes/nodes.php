<?php

class Nodes
{
	private static $columns = array('name', 'network', 'type', 'status', 'lat', 'lng', 'owner_id',
	                                'url_photos', 'url_homepage', 'url_thread', 'visibility', 'address',
	                                'people_count', 'people_hide', 'machine_count', 'machine_hide');
	private static $cols_basic = array('id', 'name', 'type', 'status', 'lat', 'lng');
	private static $filters = array('type', 'status');
	
	private static $types = array(1, 9, 10, 11, 97, 98, 99, 0);
	private static $types_user = array(1, 9, 10);
	
	private static $states = array(80, 79, 40, 1, 90);
 	private static $states_user = array(80, 79);
	
	public function insert($data)
	{
		self::checkRights($data);
		
		History::insert('nodes', $data, self::$columns);
		$data['id'] = Query::lastInsertId();
		
		self::notifyAdd($data);
		return $data['id'];
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
		Links::deleteFromNode($data);
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
		$row = $query->fetch();
		
		if ($row == false)
			throw new Exception("Invalid node ID '$id'!");
		
		return $row;
	}
	
	public static function findByName($name)
	{
		//'%' means any string, '_' means any character in SQL pattern matching
		$name = str_replace(array('%','_'), array('\%','\_'), $name);
		
		$select = Query::prepare('SELECT id, name, lat, lng FROM nodes WHERE name ILIKE ? ORDER BY name LIMIT 20');
		$select->execute(array("%$name%"));
		return $select;
	}
	
	public static function selectInArea($bounds, $filters)
	{
		$sql = "SELECT id,name,lat,lng,type,status FROM nodes ".
		       "WHERE lat < ? AND lng < ? AND lat > ? AND lng > ?";
		$sql .= self::makeFilterSQL('nodes', $filters);
		$sql .= " ORDER BY lng";
		
		$select = Query::prepare($sql);
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
	
	public static function getBasicColumns()
	{
		return self::$cols_basic;
	}
	
	public static function getRights($node = null)
	{
		$mapper = User::isMapper();
		
		$rights = array(
			'edit' => $node ? User::canEdit($node['owner_id']) : User::isLogged(),
			'types' => $mapper ? self::$types : self::$types_user,
			'states' => $mapper ? self::$states : self::$states_user,
			'network' => $mapper,
			'owner' => $mapper,
		);
		
		if ($node && !$mapper)
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
		$cols = array('owner_id', 'network', 'status', 'type');
		$orig = $node['id'] ? self::fetchByID($node['id'], $cols) : null;
		$rights = self::getRights($orig);
		
		if (!$rights['edit'])
			throw new Exception('Permission to edit the node denied.');
		
		if (!in_array($node['status'], $rights['states']))
			throw new Exception('Permission to set node status denied.');
		
		if (!in_array($node['type'], $rights['types']))
			throw new Exception('Permission to set node type denied.');
		
		if ($orig === null)
			$orig = array('network' => null, 'owner_id' => User::getID());
		
		if ($orig['network'] != $node['network'] && !$rights['network'])
			throw new Exception('Permission to change network denied.');
		
		if ($orig['owner_id'] != $node['owner_id'] && !$rights['owner'])
			throw new Exception('Permission to change node owner denied.');
	}
	
	private static function notifyAdd($node)
	{
		if (!Config::$mailFrom)
			return;
		
		$notifications = Query::selectAll('notify', null, 'user_id');
		$notifications->execute();
		
		foreach ($notifications->fetchAll() as $notify)
		{
			$center = self::fetchPos($notify['node_id']);
			$distance = intval(self::distance($node, $center));
			
			if ($distance <= $notify['radius'])
			{
				$text = "New node '{$node['name']}' was added in distance {$distance}m.\n";
				$baseurl = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']);
				$url = $baseurl . "/#node={$node['id']}&goto=1";
				$text .= "Follow this link to see the new node:\n$url\n";
				$header = 'From: "CZFree.Net Node Monitor" <' . Config::$mailFrom . '>';
				mail($notify['email'], 'CZFree map notification', $text, $header);
			}
		}
	}
	
	private static function distance($node1, $node2)
	{
		$r = 6367e3; //Approximate Earth radius in Europe (in meters)
		
		$lat1 = floatval($node1['lat']);
		$lng1 = floatval($node1['lng']);
		$lat2 = floatval($node2['lat']);
		$lng2 = floatval($node2['lng']);
		
		// Haversine formula for great circle distance
		$sin1 = sin(deg2rad($lat1 - $lat2) / 2);
		$sin2 = sin(deg2rad($lng1 - $lng2) / 2);
		return 2 * $r * asin(sqrt($sin1 * $sin1 + cos($lat1) * cos($lat2) * $sin2 * $sin2));
	}
}
