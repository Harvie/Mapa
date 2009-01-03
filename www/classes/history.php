<?php

class History
{
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
