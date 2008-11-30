<?php

require_once('classes/config.php');
require_once('classes/user.php');
require_once('classes/query.php');
require_once('classes/controller.php');

try {
	try {
		User::initialize();
		Query::initialize();
		Controller::run();
	} catch (PDOException $e) {
		die($e->errorInfo[2]);
	}
} catch (Exception $e) {
	die($e->getMessage());
}
