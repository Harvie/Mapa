<?php

/**
 * \mainpage CZFree Node Monitor API
 * The API allows automatic editing of the nodes and links in the map.
 * You can either start by reading the reference of class CzfMapRemote
 * or look at the following example:
 * \include example.php
*/

/**
 * \short Main class of the API.
 *
 * It encapsulates communication with the map and implements node search,
 * retrieval of node information and also the creation of new nodes.
 */
class CzfMapRemote
{
	/**
	 * \short Constructor, initializes the API.
	 * \param $url Base URL of the map web (the same as in web browser)
	 * \param $userID ID of CZFree forum user for authentication
	 * \param $passMD5 MD5 hash of that user's CZFree forum password
	 * \warning It does not check whether the credentials are correct.
	 *          If not, following calls will fail with CzfMapRemoteException.
	 */
	public function __construct($url, $userID, $passMD5)
	{
		$this->url = $url;
		$this->userID = $userID;
		$this->passMD5 = $passMD5;
	}
	
	/**
	 * \short Retrieves information about a node or creates a new one.
	 * \param $nodeID ID of the node. Optional parameter,
	 *                if empty, a new node is created.
	 * \return Instance of CzfMapNode class
	 */
	public function getNode($nodeID = 0)
	{
		if ($nodeID != 0)
			$info = $this->remoteRequest('nodeinfo', array('id' => $nodeID), false);
		
		return new CzfMapNode($this, $this->userID, @$info);
	}
	
	/**
	 * \short Returns nodes whose name at least partially matches a search query.
	 * \param $query Search query
	 * \return Array of results, each result is an associative array
	 *         with keys 'id' and 'name' (and possibly more).
	 */
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

/**
 * \short Generic object with properties.
 */
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

/**
 * \short Represents a node in the map.
 *
 * Instances of this class are created by CzfMapRemote::getNode() method.
 *
 * Object properties are:
 * \li \b id – node ID (read-only), 0 for new node
 * \li \b lat – node latitude (floating-point number), REQUIRED
 * \li \b lng – node longitude (floating-point number), REQUIRED
 * \li \b name – name of the node (string), REQUIRED
 * \li \b address – street address (string), REQUIRED
 * \li \b type – one of Node type constants
 * \li \b status – one of Node status constants
 * \li \b owner_id – ID of node owner
 * \li \b network – ID of network (cloud)
 * \li \b node_secrecy – node secrecy level, one of Node secrecy constants
 * \li \b visibility – visibility description (string)
 * \li \b url_photos – URL of photos from the node
 * \li \b url_homepage – URL of node homepage
 * \li \b url_thread – URL of a discussion thread
 * \li \b people_count – number of people at the node
 * \li \b people_hide – 1 if the number of people is hidden, 0 otherwise
 * \li \b machine_count – number of machines at the node
 * \li \b machine_hide – 1 if the number of machines is hidden, 0 otherwise
 * \li \b links – read-only array of links from the node (keys are endpoint IDs,
 *                values are instances of class CzfMapLink)
 */

class CzfMapNode extends CzfMapObject
{
	/// \name Node type constants
	//@{
	const TYPE_UNKNOWN = 0; ///< Unknown
	const TYPE_CLIENT = 1; ///< Client
	const TYPE_AP = 9; ///< Full AP
	const TYPE_OPENAP = 10; ///< Street access AP
	const TYPE_ROUTER = 11; ///< Router
	const TYPE_HIDDEN = 97; ///< Hidden
	const TYPE_INFOPOINT = 98; ///< InfoPoint
	const TYPE_NONCZF = 99; ///< Non-CZF
	//@}
	
	/// \name Node status constants
	//@{
	const STATUS_ACTIVE = 1; ///< Active
	const STATUS_DOWN = 10; ///< Down
	const STATUS_TESTING = 40; ///< In testing
	const STATUS_CONSTRUCTION = 79; ///< Under construction
	const STATUS_PLANNING = 80; ///< In planning
	const STATUS_OBSOLETE = 90; ///< Obsolete
	//@}
	
	/// \name Node secrecy constants
	//@{
	const SECRECY_NONE = -100; ///< Visible by everyone
	const SECRECY_REGISTERED = 0; ///< Visible by registered users
	const SECRECY_MAPPER = 100; ///< Visible by mappers
	//@}
	
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
	
	/**
	 * \short Saves changes of node properties, or creates the node.
	 * \warning Check that all required properties are set before saving!
	 * \note It the node was newly created, its ID property is set to the assigned ID.
	 */
	public function save()
	{
		foreach (self::$required as $req)
			if (!isset($this->prop[$req]))
				throw new CzfMapRemoteException("Required property '$req' is not set!");
		
		$this->prop['id'] = $this->remote->submit($this->prop);
	}
	
	/**
	 * \short Removes the node from the map.
	 * \warning The node is deleted immediately, don't call save() afterwards!
	 */
	public function delete()
	{
		if ($this->id == 0)
			return;
		
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
		'visibility' => null, 'address' => null,
		'people_count' => null, 'people_hide' => 0,
		'machine_count' => null, 'machine_hide' => 0,
		'lat' => null, 'lng' => null, 'links' => array(),
	);
	
	private static $required = array('name', 'address', 'lat', 'lng');
	
	private $remote;
	private $linkobjs;
}

/**
 * \short Represents a link to some other node.
 *
 * Object properties are:
 * \li \b id – node ID of link endpoint (read-only)
 * \li \b media – link type, one of Link media constants
 * \li \b active – 0 for planned link, 1 for active link
 * \li \b backbone – 1 for backbone link, 0 otherwise
 * \li \b secrecy – link secrecy level, one of Link secrecy constants
 * \li \b nominal_speed – nominal link speed in Mbit
 * \li \b real_speed – real link speed in Mbit
 * \li \b czf_speed – speed for CZFree traffic in Mbit
 */
class CzfMapLink extends CzfMapObject
{
	/// \name Link media constants
	//@{
	const MEDIA_UNKNOWN = 0; ///< Unknown type of link
	const MEDIA_2GHZ = 1; ///< Wireless link in 2.4GHz band (802.11b/g)
	const MEDIA_FSO = 2; ///< Free Space Optical link (Ronja, Crusader)
	const MEDIA_UTP = 3; ///< Ethernet over metallic cable
	const MEDIA_FIBER = 4; ///< Ethernet over optical fiber
	const MEDIA_VPN = 5; ///< VPN over Internet
	const MEDIA_FSOWIFI = 6; ///< Free Space Optical link backed by Wi-Fi
	const MEDIA_5GHZ = 7; ///< Wireless link in 5.4 - 5.8 GHz band (802.11a)
	const MEDIA_10GHZ = 8; ///< Wireless link in 10 GHz band
	const MEDIA_LICENSED = 9; ///< Wireless link in licensed band
	const MEDIA_60GHZ = 10; ///< Wireless link in 60 GHz or higher band
	const MEDIA_LEASED = 11; ///< Leased optical line
	const MEDIA_OTHER = 99; ///< Other type of link
	//@}
	
	/// \name Link secrecy constants
	//@{
	const SECRECY_NONE = -100; ///< Visible by everyone
	const SECRECY_REGISTERED = 0; ///< Visible by registered users
	const SECRECY_MAPPER = 100; ///< Visible by mappers
	//@}
	
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

/**
 * \short Exception thrown when some error happens.
 */
class CzfMapRemoteException extends Exception {}
