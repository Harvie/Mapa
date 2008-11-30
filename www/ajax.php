<?php

require_once('classes/config.php');
require_once('classes/user.php');
require_once('classes/controller.php');

try {
	User::initialize();
	Controller::initialize();
	Controller::run();
} catch (PDOException $e) {
	die("Error: " . $e->getMessage());
}
