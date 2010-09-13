<?php

class CzfMapRemote
{
	public static function getInfo($nodeID)
	{
		return self::remoteRequest('nodeinfo', array('id' => $nodeID), false);
	}
	
	public static function submit($node)
	{
		return self::remoteRequest('submit', $node, true);
	}
	
	private static function remoteRequest($request, $data, $post)
	{
		$url = self::$url . "?request=" . $request;
		$result = self::httpRequest($url, self::serialize($data), $post);
		
		$json = json_decode($result, true);
		if (isset($json['error']))
			throw new CzfMapRemoteException($json['error']);
		
		return $json;
	}
	
	private static function httpRequest($url, $query, $post)
	{
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_HEADER, false);
		curl_setopt($curl, CURLOPT_FAILONERROR, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		
		if ($post)
			curl_setopt($curl, CURLOPT_POSTFIELDS, $query);
		else
			$url .= $query;
		
		curl_setopt($curl, CURLOPT_URL, $url);
		$result = curl_exec($curl);
		
		if (curl_errno($curl) != 0) {
			$error = curl_error($curl);
			curl_close($curl);
			throw new CzfMapRemoteException($error);
		}
		
		curl_close($curl);
		return $result;
		
	}
	
	private static function requestURL($request, $data = array())
	{
		return self::$url . "?request=" . $request . self::serialize($data);
	}
	
	private static function serialize($data, $prefix = null)
	{
		$query = '';
		
		foreach ($data as $name => $value)
		{
			$key = ($prefix !== null) ? "{$prefix}[$name]" : $name;
			
			if (is_array($value))
				$query .= self::serialize($value, $key);
			else
				$query .= '&' . urlencode($key) . '='. urlencode($value);
		}
		
		return $query;
	}
	
	private static $url = "http://mapa.czfree.net/devel/";
}

class CzfMapRemoteException extends Exception {}

try {
	$info = CzfMapRemote::getInfo(596);
	print_r(CzfMapRemote::submit($info));
}
catch (CzfMapRemoteException $e) {
	echo "ERROR: " . $e->getMessage() . "\n";
}
