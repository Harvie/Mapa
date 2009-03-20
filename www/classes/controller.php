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
				$output[strlen($output) - 2] = ' '; //Remove last comma - hack for IE
				$output .= $indent."]";
			}
			else
			{
				$output = "{\n";
				foreach ($data as $var => $value)
					$output .= "$indent\t$var: " . self::recursiveJSON($value, "$indent\t") . ",\n";
				$output[strlen($output) - 2] = ' '; //Remove last comma - hack for IE
				$output .= $indent."}";
			}
			return $output;
		}
		
		if (is_numeric($data))
			return $data;
		
		if (is_string($data))
			return '"' . self::escape($data) . '"';
		
		if (is_null($data))
			return 'null';
		
		if (is_bool($data))
			return $data ? 1 : 0;
	}
	
	protected static function writeJSON($data)
	{
		header('Content-Type: text/plain');
		echo self::recursiveJSON($data, "");
	}
}
