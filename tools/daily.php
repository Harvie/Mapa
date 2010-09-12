#!/usr/bin/php
<?php

require_once('classes/config.php');
require_once('classes/user.php');
require_once('classes/query.php');
require_once('classes/history.php');
require_once('classes/nodes.php');
require_once('classes/links.php');

try {
	try {
		Query::initialize();
		User::initialize();
		
		Query::beginTransaction();
		Nodes::statusDecay();
		Query::commit();
	} catch (PDOException $e) {
		echo 'ERROR:' . $e->errorInfo[2] . "\n";
	}
} catch (Exception $e) {
	echo 'ERROR:' . $e->getMessage() . "\n";
}
