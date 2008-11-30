<?php

class User
{
	public static function initialize()
	{
		session_name('CzfMap');
		session_start();
		
		if (!isset($_SESSION['userID']))
		{
			$_SESSION['userID'] = 0;
			$_SESSION['userName'] = '';
			$_SESSION['userRights'] = RIGHTS_NONE;
			
			$row = self::loadUserInfo();
			if ($row && $_COOKIE['bbpassword'] == $row['password'])
			{
				$_SESSION['userID'] = $row['userid'];
				$_SESSION['userName'] = $row['username'];
				$_SESSION['userRights'] = $row['mapperms'];
			}
		}
	}
	
	private static function loadUserInfo()
	{
		if (!isset($_COOKIE['bbuserid']))
			return false;
		
		$db = new PDO(Config::$usersDB['dsn'], Config::$usersDB['user'], Config::$usersDB['pass']);
		$db->query(Config::$usersDB['init']);
		
		$select = $db->prepare('SELECT userid, username, password, mapperms FROM user WHERE userid = ?');
		$select->execute(array($_COOKIE['bbuserid']));
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
}