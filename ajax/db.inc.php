<?php

function escape($string)
{
	$string = htmlspecialchars($string);
	return str_replace(array("\\", "\"", "\n", "\r"), array("\\\\", "\\\"", "\\n", ""), $string);
}

try {
	$db = new PDO('pgsql:dbname=map;user=www');
} catch (PDOException $e) {
	die("Database error: " . $e->getMessage());
}
