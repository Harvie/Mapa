<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>CZFree Node Monitor</title>
    <link rel="stylesheet" type="text/css" href="map.css" />
    <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAuLM8y0Dds7coOFGVF0nqtxQaDGRBdHCxKyYKLoyuPujpiM7ZexRELZc4fv7XPdRV7-aCrXnEd_-f2A"
      type="text/javascript"></script>
    <? foreach (glob("scripts/*.js") as $file): ?>
    <script type="text/javascript" src="<?=$file?>"></script>
    <? endforeach ?>
  </head>
  
  <body onload="CzfMain.start('map','panel')" onunload="CzfMain.stop()">
    <div id="map"></div>
    <div id="panel"></div>
  </body>
</html>
