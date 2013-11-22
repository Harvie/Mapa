<?php
header("Content-type: text/html; charset=utf-8");

$networks = Query::selectAll("networks", null, "name");
$networks->execute();

$config = array(
	'languages' => self::getLanguages(),
	'user' => array('id' => User::getID(), 'name' => User::getName()),
	'nodeRights' => Nodes::getRights(),
	'linkRights' => Links::getRights(),
	'networks' => $networks->fetchAllAssoc(),
	'mapperArea' => User::getMapperArea(),
);

$jsFiles = glob("scripts/*.js");
$gMapURL = '//maps.googleapis.com/maps/api/js?v=3&libraries=geometry&sensor=false&key=' . Config::$gMapKey;
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>CZFree Node Monitor</title>
    <link rel="stylesheet" type="text/css" href="map.css" />
    <script src="<?=htmlentities($gMapURL)?>" type="text/javascript"></script>
<? foreach ($jsFiles as $file): ?>
    <script type="text/javascript" src="<?=$file?>"></script>
<? endforeach ?>
    <script type="text/javascript">
    	var CzfConfig = <?= self::recursiveJSON($config, "    	") ?>;
    	google.maps.event.addDomListener(window, "load",
    		function() { CzfMain.start("map", "panel"); } );
    </script>
  </head>
  
  <body>
<? if (isset($_GET['embedded'])): ?>
    <div id="map" style="margin: 0"></div>
<? else: ?>
    <div id="map"></div>
    <div id="panel"></div>
<? endif ?>
  </body>
</html>
