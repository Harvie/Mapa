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
	
	public function search($query)
	{
		return $this->remoteRequest('search', array('query' => $query), false);
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
	public function __construct($defaults, &$prop)
	{
		if (!is_array($prop))
			$prop = $defaults; //No ref!
		
		$this->prop =& $prop;
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
	const TYPE_UNKNOWN = 0;
	const TYPE_CLIENT = 1;
	const TYPE_AP = 9;
	const TYPE_OPENAP = 10;
	const TYPE_ROUTER = 11;
	const TYPE_HIDDEN = 97;
	const TYPE_INFOPOINT = 98;
	const TYPE_NONCZF = 99;
	
	const STATUS_ACTIVE = 1;
	const STATUS_DOWN = 10;
	const STATUS_TESTING = 40;
	const STATUS_CONSTRUCTION = 79;
	const STATUS_PLANNING = 80;
	const STATUS_OBSOLETE = 90;
	
	public function __construct($remote, $owner_id, $prop = null)
	{
		parent::__construct(self::$defaults, $prop);
		
		if (!isset($this->owner_id))
			$this->owner_id = $owner_id;
		
		$this->remote = $remote;
		$this->makeLinks();
	}
	
	public function __get($var)
	{
		if ($var == 'links')
			return $this->linkobjs;
		
		return parent::__get($var);
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
	
	public function addLink($nodeID)
	{
		$nodeID = intval($nodeID);
		
		if ($nodeID <= 0)
			throw new CzfMapRemoteException("Invalid link endpoint ID!");
		
		if (isset($this->linkobjs[$nodeID]))
			throw new CzfMapRemoteException("Link to node $nodeID already exists!");
		
		if ($nodeID == $this->id)
			throw new CzfMapRemoteException("Node can't link to itself!");
		
		$link =& $this->prop['links'][$nodeID];
		$linkobj = new CzfMapLink($nodeID, $link);
		$this->linkobjs[$nodeID] = $linkobj;
		
		if (isset($link['remove']))
			unset($link['remove']);
		else
			$link['insert'] = true;
		
		return $linkobj;
	}
	
	public function removeLink($nodeID)
	{
		if (!isset($this->links[$nodeID]))
			throw new CzfMapRemoteException("Link to node $nodeID does not exist!");
		
		$link =& $this->prop['links'][$nodeID];
		
		if (isset($link['insert']))
			unset($this->prop['links'][$nodeID]);
		else
		{
			$link['remove'] = true;
			unset($link['update']);
		}
		
		unset($this->linkobjs[$nodeID]);
	}
	
	
	private function makeLinks()
	{
		$links = array();
		$this->linkobjs = array();
		
		foreach ($this->prop['links'] as &$link)
		{
			$links[$link['id']] =& $link;
			$this->linkobjs[$link['id']] = new CzfMapLink($this->id, $link);
		}
		
		$this->prop['links'] = $links;
	}
	
	private static $defaults = array (
		'id' => 0, 'name' => null, 'network' => null, 'type' => 1,
		'status' => 80, 'owner_id' => null, 'node_secrecy' => -100,
		'url_photos' => null, 'url_homepage' => null, 'url_thread' => null,
		'visibility' => null, 'address' => null, 'node_secrecy' => -100,
		'people_count' => null, 'people_hide' => 0,
		'machine_count' => null, 'machine_hide' => 0,
		'lat' => null, 'lng' => null, 'links' => array(),
	);
	
	private static $required = array('name', 'address', 'lat', 'lng');
	
	private $remote;
	private $linkobjs;
}

class CzfMapLink extends CzfMapObject
{
	const MEDIA_UNKNOWN = 0;
	const MEDIA_2GHZ = 1;
	const MEDIA_FSO = 2;
	const MEDIA_UTP = 3;
	const MEDIA_FIBER = 4;
	const MEDIA_VPN = 5;
	const MEDIA_FSOWIFI = 6;
	const MEDIA_5GHZ = 7;
	const MEDIA_10GHZ = 8;
	const MEDIA_LICENSED = 9;
	const MEDIA_60GHZ = 10;
	const MEDIA_LEASED = 11;
	const MEDIA_OTHER = 99;
	
	public function __construct($nodeID, &$prop)
	{
		parent::__construct(self::$defaults, $prop);
		if (!isset($this->prop['id']))
			$this->prop['id'] = $nodeID;
	}
	
	public function __set($var, $value)
	{
		parent::__set($var, $value);
		
		if (!isset($this->prop['insert']))
			$this->prop['update'] = true;
	}
	
	private static $defaults = array (
		'media' => 0, 'active' => 1, 'backbone' => 0, 'secrecy' => -100,
		'nominal_speed' => null, 'real_speed' => null, 'czf_speed' => null
	);
}

class CzfMapRemoteException extends Exception {}


try {
	$remote = new CzfMapRemote("http://mapa.czfree.net/devel/", 0, '');
	
	$node = $remote->getNode();
	$node->type = CzfMapNode::TYPE_AP;
	$node->name = 'API test';
	$node->address = 'test';
	$node->lat = 50.00576;
	$node->lng = 14.40937;
	
	$search1 = $remote->search('p12.Javor');
	$javorID = $search1[0]['id'];
	$link1 = $node->addLink($javorID);
	$link1->media = CzfMapLink::MEDIA_2GHZ;
	$link1->active = 0;
	
	$search2 = $remote->search('NFX');
	$nfxID = $search2[0]['id'];
	$link2 = $node->addLink($nfxID);
	$link2->media = CzfMapLink::MEDIA_FIBER;
	$link2->active = 0;
	
	$node->save();
	
	$node = $remote->getNode($node->id);
	$node->name = 'API test renamed';
	$node->status = CzfMapNode::STATUS_CONSTRUCTION;
	$link = $node->links[$javorID];
	$link->media = CzfMapLink::MEDIA_5GHZ;
	$node->removeLink($nfxID);
	$node->save();
	
	$node->delete();
}
catch (CzfMapRemoteException $e) {
	echo "ERROR: " . $e->getMessage() . "\n";
}
