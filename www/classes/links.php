<?php

class Links
{
	public static function selectFromNode($id)
	{
		$query = Query::select(
			'SELECT * FROM links JOIN nodes ON node2 = nodes.id WHERE node1 = ?'.
			' UNION ALL '.
			'SELECT * FROM links JOIN nodes ON node1 = nodes.id WHERE node2 = ?'
		);
		
		$query->execute(array($id, $id));
		return $query;
	}

	// Coordinates of link endpoints are duplicated in table links so they
	// can be indexed for fast retrieval of links that cross viewport. Also
	// links are always stored that lat1 <= lat2. So if the node was moved,
	// the coordinates must be updated and also sometimes the line endpoints
	// have to be swapped.
	static function fixLinkEndpoints($id, $lat, $lng)
	{
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
				$row['lat1'] = $lat;
				$row['lng1'] = $lng;
			}
			else
			{
				$row['lat2'] = $lat;
				$row['lng2'] = $lng;
			}
			
			if (floatval($row['lat1']) > floatval($row['lat2']))
			{
				list(   $row['node1'], $row['lat1'], $row['lng1'], $row['node2'], $row['lat2'], $row['lng2'])
				= array($row['node2'], $row['lat2'], $row['lng2'], $row['node1'], $row['lat1'], $row['lng1']);
			}
			
			$insert->execute($row);
		}
	}
}