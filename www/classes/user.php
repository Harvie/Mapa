<?php

class User
{
	const RIGHTS_NONE = -100;
	const RIGHTS_USER = 0;
	const RIGHTS_MAPPER = 100;

	private static $db = null;
	private static $auth_backend = null;

	public static function initialize()
	{
		require_once('lms.php');
		require_once('HTTP_Auth.class.php');
		self::$auth_backend = new LMS_Auth();
		new HTTP_Auth('mapa', true, array(self::$auth_backend,'check_auth'));

		session_name('CzfMap');
		session_start();

/*
		//The user logged in or out of forum after session was started
		if ( ((@$_SESSION['userID'] > 0) != isset($_COOKIE['bbpassword']))
		  || (@$_COOKIE['bbuserid'] != @$_SESSION['userID']) )
			unset($_SESSION['userID']);

		if (!isset($_SESSION['userID']))
		{
			$_SESSION['userID'] = 0;
			$_SESSION['userName'] = '';
			$_SESSION['userRights'] = self::RIGHTS_NONE;

			if (!isset($_COOKIE['bbuserid']))
				return;

			$row = self::loadUserInfo(intval($_COOKIE['bbuserid']));
			if ($row && $_COOKIE['bbpassword'] == $row['password'])
			{
				$_SESSION['userID'] = $row['userid'];
				$_SESSION['userName'] = self::convertName($row['username']);
				self::loadMapperInfo($row['userid']);
			}
		}
*/
	}

	private static function query($sql)
	{
		if (!self::$db)
		{
			self::$db = new PDO(Config::$usersDB['dsn'], Config::$usersDB['user'], Config::$usersDB['pass']);
			self::$db->query(Config::$usersDB['init']);
		}

		return self::$db->prepare($sql);
	}

	private static function loadUserInfo($id)
	{
		$name=self::$auth_backend->get_username_by_id($id);
		return array($id,$name,'test'.$name.'23'); //TODO!

		$select = self::query('SELECT userid, username, password FROM user WHERE userid = ?');
		$select->execute(array($id));
		return $select->fetch();
	}

	private static function loadMapperInfo($id)
	{
		$columns = array('north','west','east','south','global');
		$select = Query::select('mappers', $columns, array('user_id'));
		$row = $select->execute(array('user_id' => $id))->fetch();
		$row = true;

		if ($row)
		{
			$_SESSION['userRights'] = self::RIGHTS_MAPPER;
			$_SESSION['mapperArea'] = $row;
		}
		else
		{
			$_SESSION['userRights'] = self::RIGHTS_USER;
			$_SESSION['mapperArea'] = null;
		}
	}

	public static function getID()
	{
		return self::$auth_backend->get_id_by_username(self::getName());
		return 23; //TODO!
		return $_SESSION['userID'];
	}

	public static function getName()
	{
		return $_SERVER['PHP_AUTH_USER']; //TODO HACK?
		return 'harvie'; //TODO!
		return $_SESSION['userName'];
	}

	public static function getRights()
	{
		return self::RIGHTS_MAPPER; //TODO
		return $_SESSION['userRights'];
	}

	public static function isMapper()
	{
		return true; //TODO
		return $_SESSION['userRights'] >= self::RIGHTS_MAPPER;
	}

	public static function isLogged()
	{
		return true; //TODO
		return $_SESSION['userRights'] >= self::RIGHTS_USER;
	}

	public static function getMapperArea()
	{
		return array('global' => true); //TODO
		return $_SESSION['mapperArea'];
	}

	public static function canEdit($node)
	{
		return true; //TODO

		if ($node['owner_id'] == $_SESSION['userID'])
			return true;

		if (!self::isMapper())
			return false;

		if ($_SESSION['mapperArea']['global'])
			return true;

		if ($_SESSION['mapperArea']['north'] >= $node['lat'] &&
		    $_SESSION['mapperArea']['west']  <= $node['lng'] &&
		    $_SESSION['mapperArea']['south'] <= $node['lat'] &&
		    $_SESSION['mapperArea']['east']  >= $node['lng'])
			return true;

		return false;
	}

	public static function canSee($node)
	{
		return  true; //TODO

		if ($node['node_secrecy'] >= self::RIGHTS_MAPPER)
			return self::canEdit($node);
		else
			return $node['node_secrecy'] <= self::getRights();
	}

	public static function makeSecrecyFilter($tableAlias)
	{
		return ' AND 1=1 '; //TODO
		$sql = " AND $tableAlias.node_secrecy <= " . intval(self::getRights());

		if (self::isMapper() && !$_SESSION['mapperArea']['global'])
		{
			$north = floatval($_SESSION['mapperArea']['north']);
		    $west = floatval($_SESSION['mapperArea']['west']);
		    $south = floatval($_SESSION['mapperArea']['south']);
		    $east = floatval($_SESSION['mapperArea']['east']);
			$sql .= " AND ($tableAlias.node_secrecy < " . self::RIGHTS_MAPPER;
			$sql .= "  OR ($north >= $tableAlias.lat AND $west <= $tableAlias.lng";
			$sql .= "  AND $south <= $tableAlias.lat AND $east >= $tableAlias.lng))";
		}

		return $sql;
	}

	private static function getSingleVal($sql, $params)
	{
		$select = self::query($sql);
		$select->execute($params);
		$row = $select->fetch(PDO::FETCH_NUM);
		return $row ? $row[0] : false;
	}

	public static function getNameByID($id)
	{
		return self::$auth_backend->get_username_by_id($id);
		return 'harvie'; //TODO!

		$name = self::getSingleVal('SELECT username FROM user WHERE userid = ?', array($id));
		return ($name !== false) ? self::convertName($name) : false;
	}

	public static function getIDByName($name)
	{
		return self::$auth_backend->get_id_by_username($name);
		return 23; //TODO!

		$name = self::convertName($name, true);
		return self::getSingleVal('SELECT userid FROM user WHERE username = ?', array($name));
	}

	public static function getContactInfo($id)
	{
		return array('harvie',23,true,true); //TODO
		$select = self::query('SELECT username,icq,receiveemail,receivepm FROM user WHERE userid = ?');
		$select->execute(array($id));
		return $select->fetch();
	}

	public static function convertName($name, $toDB = false)
	{
		// The user database is still in Windows encoding
		if ($toDB)
			return iconv("UTF-8", "WINDOWS-1250", $name);
		else
			return iconv("WINDOWS-1250", "UTF-8", $name);
	}
}
