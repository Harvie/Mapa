<?php

Query::beginTransaction();

if ($_POST['moved'])
{
	//TODO
}
else
{
	$columns = array('name', 'type', 'status', 'address', 'visibility', 'url_photos', 'url_homepage', 'url_thread');
	$stmt = Query::update('nodes', $columns);
	$stmt->execute($_POST);
}

Query::commit();

echo "OK";
