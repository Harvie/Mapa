<?php

class User
{
	const RIGHTS_NONE = -100;
	const RIGHTS_USER = 0;
	const RIGHTS_MAPPER = 100;
	
	private static $db = null;
	
	public static function initialize()
	{
		session_name('CzfMap');
		session_start();
		
		//The user logged in or out of forum after session was started
		if (($_SESSION['userID'] > 0) != isset($_COOKIE['bbpassword']))
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
				$_SESSION['userRights'] = $row['mapperms'];
			}
		}
	}
	
	private static function query($sql)
	{
		if (!$db)
		{
			self::$db = new PDO(Config::$usersDB['dsn'], Config::$usersDB['user'], Config::$usersDB['pass']);
			self::$db->query(Config::$usersDB['init']);
		}
		
		return self::$db->prepare($sql);
	}
	
	private static function loadUserInfo($id)
	{
		$select = self::query('SELECT userid, username, password, mapperms FROM user WHERE userid = ?');
		$select->execute(array($id));
		return $select->fetch();
	}
	
	public static function getID()
	{
		return $_SESSION['userID'];
	}

	public static function getName()
	{
		return $_SESSION['userName'];
	}

	public static function getRights()
	{
		return $_SESSION['userRights'];
	}
	
	public static function isMapper()
	{
		return $_SESSION['userRights'] >= self::RIGHTS_MAPPER;
	}
	
	public static function isLogged()
	{
		return $_SESSION['userRights'] >= self::RIGHTS_USER;
	}
	
	public static function canEdit($owner)
	{
		return self::isMapper() || (self::isLogged() && $owner == $_SESSION['userID']);
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
		$name = self::getSingleVal('SELECT username FROM user WHERE userid = ?', array($id));
		return ($name !== false) ? self::convertName($name) : false;
	}
	
	public static function getIDByName($name)
	{
		$name = self::convertName($name, true);
		return self::getSingleVal('SELECT userid FROM user WHERE username = ?', array($name));
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
