<?php

require_once('classes/config.php');
require_once('classes/user.php');

function escape($string)
{
	$string = htmlspecialchars($string);
	return str_replace(array("\\", "\"", "\n", "\r"), array("\\\\", "\\\"", "\\n", ""), $string);
}

try {
	$db = new PDO('pgsql:dbname=map');
} catch (PDOException $e) {
	die("Database error: " . $e->getMessage());
}

User::initialize();

if (isset($_GET['request']))
{
	$req = $_GET['request'];
	$file = "ajax/$req.php";
	
	if (ctype_lower($req) && is_file($file))
		include($file);
}
