<?php
header("Content-type: text/html; charset=utf-8");
$jsFiles = glob("scripts/*.js");
$gmapKey = Config::$gmapKey;
$languages = self::getLanguages();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>CZFree Node Monitor</title>
    <link rel="stylesheet" type="text/css" href="map.css" />
    <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=<?=$gmapKey?>" type="text/javascript"></script>
<? foreach ($jsFiles as $file): ?>
    <script type="text/javascript" src="<?=$file?>"></script>
<? endforeach ?>
    <script type="text/javascript">
    	var CzfConfig =
    	{
    		languages: [ "<?=implode('","', $languages) ?>" ]
    	}
    </script>
  </head>
  
  <body onload="CzfMain.start('map','panel')" onunload="CzfMain.stop()">
    <div id="map"></div>
    <div id="panel"></div>
  </body>
</html>
