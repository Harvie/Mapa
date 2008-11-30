<?php

class Controller
{
	public static function run()
	{
		if (isset($_GET['request']))
		{
			$req = $_GET['request'];
			$file = "ajax/$req.php";
			
			if (ctype_lower($req) && is_file($file))
				self::render($file);
		}
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
}
