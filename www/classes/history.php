<?php

class History
{
	public static function insert($table, $data, $columns)
	{
		$columns = array_merge($columns, array('created_on', 'created_by'));
		$data['created_by'] = User::getID();
		$data['created_on'] = 'now';
		
		$insert = Query::insert($table, $columns);
		$insert->execute($data);
	}
	
	public static function update($table, $data, $columns, $keys = array('id'))
	{
		self::makeBackup($table, $data, $keys);
		
		$columns = array_merge($columns, array('changed_on', 'changed_by'));
		$data['changed_by'] = User::getID();
		$data['changed_on'] = 'now';
		
		$update = Query::update($table, $columns, $keys);
		$update->execute($data);
	}
	
	public static function delete($table, $data, $keys = array('id'))
	{
		self::makeBackup($table, $data, $keys);
		
		//The time of deletion is marked by row of nulls
		$emptyData = array('changed_by' => User::getID(), 'changed_on' => 'now');
		foreach ($keys as $col)
			$emptyData[$col] = $data[$col];
		self::storeBackup($table, $emptyData);
		
		$delete = Query::delete($table, $keys);
		$delete->execute($data);
	}
	
	private function makeBackup($table, $data, $keys)
	{
		$select = Query::select($table, null, $keys);
		$select->execute($data);
		$oldData = $select->fetch();
		if (!$oldData) return;
		
		self::storeBackup($table, $oldData);
	}
	
	private static function storeBackup($table, $data)
	{
		if (!isset($data['changed_on']))
		{
			$data['changed_on'] = $data['created_on'];
			$data['changed_by'] = $data['created_by'];
		}
		
		unset($data['created_on']);
		unset($data['created_by']);
		
		$insert = Query::insert("${table}_history", array_keys($data));
		$insert->execute($data);
	}
	
	public static function makeChangeInfo($time, $userID)
	{
		return array(
			'date' => substr($time, 0, strpos($time, ' ')),
			'name' => User::getNameByID($userID),
			'profile' => Config::$profilePrefix . $userID,
		);
	}
	
	public static function convertChangeInfo(&$info)
	{
		if ($info['created_by'] !== null)
			$info['created'] = self::makeChangeInfo($info['created_on'], $info['created_by']);
		
		unset($info['created_on']);
		unset($info['created_by']);
		
		if ($info['changed_by'] !== null)
			$info['changed'] = self::makeChangeInfo($info['changed_on'], $info['changed_by']);
		
		unset($info['changed_on']);
		unset($info['changed_by']);
	}
}
