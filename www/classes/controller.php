<?php

class Controller
{
	public static function run()
	{
		$req = isset($_GET['request']) ? $_GET['request'] : 'index';
		$file = "pages/$req.php";
		
		if (ctype_lower($req) && is_file($file))
			self::render($file);
	}
	
	public static function fail($message)
	{	//Output correct JSON even in case of failure
		die('{ error: "'.self::escape($message).'" }');
	}
	
	private static function render()
	{
		include func_get_arg(0);
	}
	
	protected static function escape($string)
	{
		$string = htmlspecialchars($string);
		return str_replace(array("\\", "\"", "\n", "\r"), array("\\\\", "\\\"", "\\n", ""), $string);
	}
	
	protected static function formatDate($date)
	{
		return substr($date, 0, strpos($date, ' '));
	}
	
	protected static function makeChangeInfo($time, $userID)
	{
		return array(
			'date' => self::formatDate($time),
			'name' => User::getNameByID($userID),
			'profile' => Config::$profilePrefix . $userID,
		);
	}
	
	protected static function convertChangeInfo(&$info)
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
	
	protected static function getLanguages()
	{
		//Borrowed from Jakub Vrána, http://php.vrana.cz/phpminadmin-preklady.php
		$accept = strtolower($_SERVER["HTTP_ACCEPT_LANGUAGE"]);
		preg_match_all('/([-a-z]+)(;q=([0-9.]+))?/', $accept, $matches, PREG_SET_ORDER);
		
		foreach ($matches as $match)
			$langs[$match[1]] = (isset($match[3]) ? $match[3] : 1);
		
		arsort($langs);
		return array_keys($langs);
	}
	
	protected static function recursiveJSON($data, $indent)
	{
		if (is_array($data) || $data instanceof Traversable)
		{
			//Distinguish associative and ordinary array
			if ($data instanceof Traversable || isset($data[0]) || count($data) == 0)
			{
				$output = "[\n";
				foreach ($data as $value)
					$output .= "$indent\t" . self::recursiveJSON($value, "$indent\t") . ",\n";
				$output .= $indent."]";
			}
			else
			{
				$output = "{\n";
				foreach ($data as $var => $value)
					if ($value !== null)
						$output .= "$indent\t$var: " . self::recursiveJSON($value, "$indent\t") . ",\n";
				$output[strlen($output) - 2] = ' '; //Remove last comma - hack for IE
				$output .= $indent."}";
			}
			return $output;
		}
		
		if (is_numeric($data))
			return $data;
		
		if (is_string($data) && is_null($data))
			return '"' . self::escape($data) . '"';
	}
	
	protected static function writeJSON($data)
	{
		header('Content-Type: text/plain');
		echo self::recursiveJSON($data, "");
	}
}
