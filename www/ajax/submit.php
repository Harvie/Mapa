<?php

$columns = array('name', 'type', 'status', 'address', 'visibility', 'url_photos', 'url_homepage', 'url_thread');

$data = $_POST;
if (!isset($data['id']))
	return;

$id = $data['id'];
if ($id !== "new")
	$id = intval($id);

Query::beginTransaction();

// Coordinates of link endpoints are duplicated in table links so they
// can be indexed for fast retrieval of links that cross viewport. Also
// links are always stored that lat1 <= lat2. So if the node was moved,
// the coordinates must be updated and also sometimes the line endpoints
// have to be swapped.
if ($id !== "new" && $data['moved'])
{
	$columns[] = 'lat';
	$columns[] = 'lng';
	
	$select = Query::select('SELECT * FROM links WHERE node1 = ? OR node2 = ? FOR UPDATE');
	$select->execute(array($id, $id));
	$links = $select->fetchAll(PDO::FETCH_ASSOC);
	
	if (count($links) == 0)
		return;
	
	$delete = Query::delete('DELETE FROM links WHERE node1 = ? OR node2 = ?');
	$delete->execute(array($id, $id));
	
	$insert = Query::insert('links', array_keys($links[0]));
	foreach ($links as $row)
	{
		if ($row['node1'] == $id)
		{
			$row['lat1'] = $data['lat'];
			$row['lng1'] = $data['lng'];
		}
		else
		{
			$row['lat2'] = $data['lat'];
			$row['lng2'] = $data['lng'];
		}
		
		if (floatval($row['lat1']) > floatval($row['lat2']))
		{
			list(   $row['node1'], $row['lat1'], $row['lng1'], $row['node2'], $row['lat2'], $row['lng2'])
			= array($row['node2'], $row['lat2'], $row['lng2'], $row['node1'], $row['lat1'], $row['lng1']);
		}
		
		$insert->execute($row);
	}
}

if ($id === "new")
{
	$columns[] = 'lat';
	$columns[] = 'lng';
	
	$insert = Query::insert('nodes', $columns);
	$id = $insert->execute($data);
}
else
{
	$update = Query::update('nodes', $columns);
	$update->execute($data);
}

Query::commit();
echo "{ id: $id }";
