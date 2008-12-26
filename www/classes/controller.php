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
}
