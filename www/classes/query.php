<?php

class Query
{
	public static function initialize()
	{
		self::$db = new PDO(Config::$mapDB['dsn'], Config::$mapDB['user'], Config::$mapDB['pass']);
		self::$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}
	
	//Only factory methods are public
	private function __construct($sql, $columns, $readonly = false)
	{
		if (!$readonly && !self::$transaction)
			throw new Exception('INSERT or UPDATE outside transaction is not allowed.');
		
		$this->columns = $columns;
		$this->stmt = self::prepare($sql);
	}
	
	public static function prepare($sql)
	{
		$stmt = self::$db->prepare($sql);
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		return $stmt;
	}
	
	public static function select($table, $columns = null, $keys = array('id'))
	{
		$sql = 'SELECT ';
		$sql .= $columns ? implode(',',$columns) : '*';
		$sql .= " FROM $table ";
		$sql .= 'WHERE '.implode(' AND ', self::makeNamedParams($keys));
		return new Query($sql, $keys, true);
	}
	
	public static function selectAll($table, $columns = null, $order = 'id')
	{
		$sql = 'SELECT ';
		$sql .= $columns ? implode(',',$columns) : '*';
		$sql .= " FROM $table ORDER BY $order";
		return new Query($sql, array(), true);
	}
	
	public static function insert($table, $columns)
	{
		$sql = "INSERT INTO $table ";
		$sql .= "(" . implode(',', $columns) . ") ";
		$sql .= "VALUES(:" . implode(',:', $columns) . ")";
		return new Query($sql, $columns);
	}
	
	public static function update($table, $columns, $keys = array('id'))
	{
		$sql = "UPDATE $table SET ";
		$sql .= implode(',', self::makeNamedParams($columns));
		$sql .= ' WHERE '.implode(' AND ', self::makeNamedParams($keys));
		return new Query($sql, array_merge($columns, $keys));
	}
	
	public static function delete($table, $keys = array('id'))
	{
		$sql = "DELETE FROM $table ";
		$sql .= ' WHERE '.implode(' AND ', self::makeNamedParams($keys));
		return new Query($sql, $keys);
	}
	
	public static function makeNamedParams($columns)
	{
		foreach ($columns as &$col)
			$col = "$col = :$col";
		return $columns;
	}
	
	public static function filtersToSQL($table, $column, $filters)
	{
		if (!is_array($filters))
			return "";
		
		$include = self::makeInClause(@$filters["${column}_include"]);
		$exclude = self::makeInClause(@$filters["${column}_exclude"]);
		
		$sql = "";
		
		if ($include !== false)
			$sql .= " AND $table.$column $include";
		
		if ($exclude !== false)
			$sql .= " AND $table.$column NOT $exclude";
		
		return $sql;
	}
	
	private static function makeInClause($list)
	{
		if (!is_array($list))
			return false;
		
		$sanitized = array_map('intval', $list);
		$joined = implode(",", $sanitized);
		return "IN($joined)";
	}
	
	public static function beginTransaction()
	{
		self::$transaction = true;
		return self::$db->beginTransaction();
	}
	
	public static function commit()
	{
		self::$transaction = false;
		return self::$db->commit();
	}
	
	public static function rollBack()
	{
		self::$transaction = false;
		return self::$db->rollBack();
	}

	public static function lastInsertId()
	{
		$id = self::$db->lastInsertId();
		
		if ($id === false) //Hack for PostgreSQL, requires version >= 8.1
			$id = self::$db->query('SELECT lastval()')->fetchColumn();
		
		return $id;
	}
	
	public function execute($values = null)
	{
		if (is_array($this->columns))
			foreach ($this->columns as $col)
				$this->stmt->bindParam(":$col", $values[$col]);
		
		$this->stmt->execute();
		return $this->stmt;
	}
	
	public function fetchAllAssoc($key = 'id')
	{
		$data = array();
		
		foreach ($this->stmt as $row)
		{
			$id = $row[$key];
			unset($row[$key]);
			$data[$id] = $row;
		}
		
		return $data;
	}
	
	private static $db = null;
	private static $transaction = false;
	
	private $columns;
	private $stmt;
}
