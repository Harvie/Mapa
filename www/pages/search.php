<?php

if (isset($_GET['query']) && strlen($_GET['query']) > 1)
	$select = Nodes::findByName($_GET['query']);
else
	$select = array();

self::writeJSON($select);
