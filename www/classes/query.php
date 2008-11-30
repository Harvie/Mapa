<?php

class Query
{
	public static function initialize()
	{
		self::$db = new PDO(Config::$mapDB['dsn']);
		self::$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}
	
	//Only factory methods are public
	private function __construct($type, $sql, $columns)
	{
		if (!self::$transaction)
			throw new Exception('INSERT or UPDATE outside transaction is not allowed.');
		
		$this->type = $type;
		$this->columns = $columns;
		$this->stmt = self::$db->prepare($sql);
	}
	
	public static function select($sql)
	{
		return self::$db->prepare($sql);
	}
	
	public static function delete($sql)
	{
		return self::$db->prepare($sql);
	}
	
	public static function insert($table, $columns)
	{
		$sql = "INSERT INTO $table ";
		$sql .= "(" . implode(',', $columns) . ") ";
		$sql .= "VALUES(:" . implode(',:', $columns) . ")";
		return new Query('insert', $sql, $columns);
	}
	
	public static function update($table, $columns)
	{
		$sql = "UPDATE $table SET ";
		$fn = create_function('$col', 'return "$col = :$col";');
		$sql .= implode(',', array_map($fn, $columns));
		$sql .= " WHERE id = :id";
		return new Query('update', $sql, $columns);
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

	public function execute($values)
	{
		foreach ($this->columns as $col)
			if ($values[$col] === '') //Empty strings are stored as NULL
				$this->stmt->bindParam(":$col", $null = null);
			else
				$this->stmt->bindParam(":$col", $values[$col]);
		
		if ($this->type == 'update')
			$this->stmt->bindParam(':id', $values['id']);
		
		return $this->stmt->execute($row);
	}
	
	private static $db = null;
	private static $transaction = false;
	
	private $columns;
	private $stmt;
}
