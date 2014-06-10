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
		Query::initialize();
		User::initialize();
		Controller::run();
	} catch (PDOException $e) {
		print_r($e);
		Controller::fail($e->errorInfo[2].'prvni');
	}
} catch (Exception $e) {
	print_r($e);
	Controller::fail($e->getMessage().'druhy');
}
