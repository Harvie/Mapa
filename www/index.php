<?php

require_once('classes/config.php');
require_once('classes/user.php');
require_once('classes/query.php');
require_once('classes/controller.php');
require_once('classes/history.php');
require_once('classes/nodes.php');
require_once('classes/links.php');

try {
	try {
		User::initialize();
		Query::initialize();
		Controller::run();
	} catch (PDOException $e) {
		Controller::fail($e->errorInfo[2]);
	}
} catch (Exception $e) {
	Controller::fail($e->getMessage());
}
