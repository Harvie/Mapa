<?php

header('Content-Type: text/plain');

foreach (array('north','east','south','west') as $i => $var)
	$bounds[$i] = floatval(@$_GET[$var]);

$data = array(
	'nodes' => Nodes::selectInArea($bounds, @$_GET['nodes']),
	'links' => Links::selectInArea($bounds, @$_GET['nodes'], @$_GET['links']),
);

self::writeJSON($data);
