<?php

class CzfMapRemote
{
	public function __construct($url, $userID, $passMD5)
	{
		$this->url = $url;
		$this->userID = $userID;
		$this->passMD5 = $passMD5;
	}
	
	public function getNode($nodeID = 0)
	{
		if ($nodeID != 0)
			$info = $this->remoteRequest('nodeinfo', array('id' => $nodeID), false);
		
		return new CzfMapNode($this, $this->userID, @$info);
	}
	
	public function submit($node)
	{
		$result = $this->remoteRequest('submit', $node, true);
		return $result['id'];
	}
	
	private function remoteRequest($request, $data, $post)
	{
		$url = $this->url . "?request=" . $request;
		$result = $this->curlRequest($url, self::serialize($data), $post);
		
		$json = json_decode($result, true);
		if (isset($json['error']))
			throw new CzfMapRemoteException($json['error']);
		
		return $json;
	}
	
	private function curlRequest($url, $query, $post)
	{
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_HEADER, false);
		curl_setopt($curl, CURLOPT_FAILONERROR, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		
		$cookies = "bbuserid={$this->userID}; bbpassword={$this->passMD5}";
		curl_setopt($curl, CURLOPT_COOKIE, $cookies);
		
		if ($post)
			curl_setopt($curl, CURLOPT_POSTFIELDS, $query);
		else
			$url .= $query;
		
		curl_setopt($curl, CURLOPT_URL, $url);
		$result = curl_exec($curl);
		
		if (curl_errno($curl) != 0) {
			$error = curl_error($curl);
			curl_close($curl);
			throw new CzfMapRemoteException($error);
		}
		
		curl_close($curl);
		return $result;
		
	}
	
	private static function serialize($data, $prefix = null)
	{
		$query = '';
		
		foreach ($data as $name => $value)
		{
			if ($value === null)
				continue;
			
			$key = ($prefix !== null) ? "{$prefix}[$name]" : $name;
			
			if (is_array($value))
				$query .= self::serialize($value, $key);
			else
				$query .= '&' . urlencode($key) . '='. urlencode($value);
		}
		
		return $query;
	}
	
	private $url;
	private $userID;
	private $passMD5;
}

class CzfMapObject
{
	public function __construct($defaults, $prop = null)
	{
		$this->prop = is_array($prop) ? $prop : $defaults;
	}
	
	public function __get($var)
	{
		if (!array_key_exists($var, $this->prop))
			throw new CzfMapRemoteException("Access to invalid property '$var'");
		
		return $this->prop[$var];
	}
	
	public function __set($var, $value)
	{
		if (!array_key_exists($var, $this->prop))
			throw new CzfMapRemoteException("Access to invalid property '$var'");
		
		if ($var == 'id')
			throw new CzfMapRemoteException("Property 'id' is read-only!");
		
		$this->prop[$var] = $value;
	}
	
	public function __isset($var)
	{
		return isset($this->prop[$var]);
	}
	
	protected $prop;
}

class CzfMapNode extends CzfMapObject
{
	public function __construct($remote, $owner_id, $prop = null)
	{
		parent::__construct(self::$defaults, $prop);
		
		if (!isset($this->owner_id))
			$this->owner_id = $owner_id;
		
		$this->remote = $remote;
	}
	
	public function __set($var, $value)
	{
		if ($var == 'lat' || $var == 'lng')
			$this->prop['moved'] = true;
		
		parent::__set($var, $value);
	}
	
	public function save()
	{
		foreach (self::$required as $req)
			if (!isset($this->prop[$req]))
				throw new CzfMapRemoteException("Required property '$req' is not set!");
		
		$this->prop['id'] = $this->remote->submit($this->prop);
	}
	
	public function delete()
	{
		$this->prop['deleteNode'] = true;
		$this->save();
		
		$this->prop['id'] = 0;
		unset($this->prop['deleteNode']);
	}
	
	private static $defaults = array (
		'id' => 0, 'name' => null, 'network' => null, 'type' => 1,
		'status' => 80, 'owner_id' => null, 'node_secrecy' => -100,
		'url_photos' => null, 'url_homepage' => null, 'url_thread' => null,
		'visibility' => null, 'address' => null, 'node_secrecy' => -100,
		'people_count' => null, 'people_hide' => 0,
		'machine_count' => null, 'machine_hide' => 0,
		'lat' => null, 'lng' => null,
	);
	
	private static $required = array('name', 'address', 'lat', 'lng');
	
	private $remote;
}

class CzfMapRemoteException extends Exception {}


try {
	$remote = new CzfMapRemote("http://mapa.czfree.net/devel/", 0, '');
	
	$node = $remote->getNode();
	$node->name = 'API test';
	$node->address = 'test';
	$node->lat = 50.00576;
	$node->lng = 14.40937;
	$node->save();
	
	$node = $remote->getNode($node->id);
	$node->name = 'API test rename';
	$node->lng = 14.40953;
	$node->save();
	
	$node->delete();
}
catch (CzfMapRemoteException $e) {
	echo "ERROR: " . $e->getMessage() . "\n";
}
