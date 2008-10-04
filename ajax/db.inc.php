<?php

try {
	$db = new PDO('pgsql:dbname=map;user=www');
} catch (PDOException $e) {
	die("Database error: " . $e->getMessage());
}
