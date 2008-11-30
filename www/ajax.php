<?php

require_once('classes/config.php');
require_once('classes/user.php');
require_once('classes/query.php');
require_once('classes/controller.php');

try {
	User::initialize();
	Query::initialize();
	Controller::run();
} catch (PDOException $e) {
	die("Error: " . $e->getMessage());
}
