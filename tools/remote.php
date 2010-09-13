<?php

class CzfMapRemote
{
	public function CzfMapRemote($url, $userID, $passMD5)
	{
		$this->url = $url;
		$this->userID = $userID;
		$this->passMD5 = $passMD5;
	}
	
	public function getInfo($nodeID)
	{
		return $this->remoteRequest('nodeinfo', array('id' => $nodeID), false);
	}
	
	public function submit($node)
	{
		$result = $this->remoteRequest('submit', $node, true);
		return $result['id'];
	}
	
	private function remoteRequest($request, $data, $post)
	{
		$url = $this->url . "?request=" . $request;
		$result = $this->curlRequest($url, self::serialize($data), $post);
		
		$json = json_decode($result, true);
		if (isset($json['error']))
			throw new CzfMapRemoteException($json['error']);
		
		return $json;
	}
	
	private function curlRequest($url, $query, $post)
	{
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_HEADER, false);
		curl_setopt($curl, CURLOPT_FAILONERROR, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		
		$cookies = "bbuserid={$this->userID}; bbpassword={$this->passMD5}";
		curl_setopt($curl, CURLOPT_COOKIE, $cookies);
		
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
	
	private $url;
	private $userID;
	private $passMD5;
}

class CzfMapRemoteException extends Exception {}

try {
	$remote = new CzfMapRemote("http://mapa.czfree.net/devel/", 0, '');
	$info = $remote->getInfo(596);
	$info['name'] = "renamed";
	echo $remote->submit($info) . "\n";
}
catch (CzfMapRemoteException $e) {
	echo "ERROR: " . $e->getMessage() . "\n";
}
