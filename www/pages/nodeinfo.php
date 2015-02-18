<?php

$id = intval(@$_GET['id']);
$info = Nodes::fetchInfo($id);
if (!$info) return;

$info['owner'] = User::getProfile($info['owner_id']);
History::convertChangeInfo($info);
$info['rights'] = Nodes::getRights($info);
$info['linkRights'] = Links::getRights(null, $info);

$info['links'] = Links::selectFromNode($info);
foreach ($info['links'] as $i => $link)
{
	History::convertChangeInfo($info['links'][$i]);
	$info['links'][$i]['rights'] = Links::getRights($link, $info);
}

$info['galleryurl'] = Config::$galleryPrefix.urlencode($info['name']);
$info['wikiurl'] = Config::$dokuwikiPrefix.urlencode($info['name']);
$wikitext = @file_get_contents(Config::$dokuwikiPrefix.urlencode($info['name']).'?do=export_xhtmlbody&'.Config::$dokuwikiLogin);
if($wikitext) {
	$wikitext = mb_convert_encoding($wikitext, 'HTML-ENTITIES', 'UTF-8');
	$doc = new DOMDocument();
	$doc->loadHTML($wikitext);
	$tables = $doc->getElementsByTagName('table');
	$tables = iterator_to_array($tables);
	$wikitext = $doc->saveHTML($tables[0]);

	$wikitext = preg_replace('/<table/','<p',$wikitext);
	$wikitext = preg_replace('/<\/table>/','</p>',$wikitext);
	$wikitext = preg_replace('/<thead/','<b',$wikitext);
	$wikitext = preg_replace('/<\/thead>/','</b>',$wikitext);
	//$wikitext = preg_replace('/table/','p',$wikitext);
	$wikitext = preg_replace('/<\/tr>/','<br />',$wikitext);
	$wikitext = preg_replace('/<\/th>/',':',$wikitext);

	$wikitext = '<div style="border:1px solid grey;">'.$wikitext.'</div>';
	$info['wikitable'] = $wikitext;
} else {
	$info['wikitable']='<small><small>(Wiki page unavailable)</small></small><br />';
}

/*
$wikitext = @file_get_contents(Config::$dokuwikiPrefix.urlencode($info['name']).'?do=export_raw&'.Config::$dokuwikiLogin);
if($wikitext) {
	preg_match('/{{template>tpl_ap\|[^}]*}}/', $wikitext, $wikitext);
	$wikitext = preg_replace('/({{template>tpl_ap\||}})/','', $wikitext[0]);
	$wikitext = preg_replace('/\|/',"\n", $wikitext);
*/
//	$wikitext = trim(preg_replace('/\n\n*/',"\n", $wikitext));
/*	$wikitext = preg_replace('/\n/',"<br />\n", $wikitext);
	$wikitext = '<div style="border:1px solid grey;">'.$wikitext.'</div>';
	$info['wikitable']=$wikitext;
} else {
	$info['wikitable']='<small><small>(Wiki page unavailable)</small></small><br />';
}

*/

self::writeJSON($info);
