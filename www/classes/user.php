<?php

class User
{
	const RIGHTS_NONE = -100;
	const RIGHTS_USER = 0;
	const RIGHTS_MAPPER = 100; //Everyone is mapper now
	
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
				$_SESSION['userName'] = $row['username'];
				$_SESSION['userRights'] = $row['mapperms'];
			}
		}
	}
	
	private static function loadUserInfo($id)
	{
		$db = new PDO(Config::$usersDB['dsn'], Config::$usersDB['user'], Config::$usersDB['pass']);
		$db->query(Config::$usersDB['init']);
		
		$select = $db->prepare('SELECT userid, username, password, mapperms FROM user WHERE userid = ?');
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
		return $_SESSION['userRights'] == self::RIGHTS_MAPPER;
	}
	
	public static function isLogged()
	{
		return $_SESSION['userRights'] == self::RIGHTS_USER;
	}
	
	public static function canEdit($owner)
	{
		return self::isMapper() || (self::isLogged() && $owner == $_SESSION['userID']);
	}
	
	public static function getNameByID($id)
	{
		$row = self::loadUserInfo($id);
		return $row ? $row['username'] : false;
	}
}
