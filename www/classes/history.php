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
		//Make a backup before replacing
		$oldData = self::fetchOldData($table, $data, $keys);
		if (!$oldData || !self::isChanged($columns, $oldData, $data)) return;
		self::writeOldVersion($table, $oldData);
		
		$columns = array_merge($columns, array('changed_on', 'changed_by'));
		$data['changed_by'] = User::getID();
		$data['changed_on'] = 'now';
		
		$update = Query::update($table, $columns, $keys);
		$update->execute($data);
	}
	
	public static function delete($table, $data, $keys = array('id'))
	{
		//Make a backup before deleting
		$oldData = self::fetchOldData($table, $data, $keys);
		if (!$oldData) return;
		self::writeOldVersion($table, $oldData);
		
		//Preserve time of creation by a row of nulls
		if ($oldData['created_on'] !== null)
			self::writeCreationInfo($table, $oldData, $keys);
		
		$delete = Query::delete($table, $keys);
		$delete->execute($data);
	}
	
	private static function fetchOldData($table, $data, $keys)
	{
		$select = Query::select($table, null, $keys);
		$select->execute($data);
		return $select->fetch();
	}
	
	private static function isChanged($columns, $old, $new)
	{
		foreach ($columns as $col)
			if ($old[$col] != $new[$col])
				return true;
		
		return false;
	}
	
	private static function writeOldVersion($table, $data)
	{
		$data['changed_on'] = 'now';
		$data['changed_by'] = User::getID();
		
		unset($data['created_on']);
		unset($data['created_by']);
		
		self::writeRecord($table, $data);
	}
	
	private static function writeCreationInfo($table, $data, $keys)
	{
		$emptyData = array();
		foreach ($keys as $col)
			$emptyData[$col] = $data[$col];
		
		$emptyData['changed_on'] = $data['created_on'];
		$emptyData['changed_by'] = $data['created_by'];
		self::writeRecord($table, $emptyData);
	}
	
	private static function writeRecord($table, $data)
	{
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
