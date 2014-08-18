<?php
header("Content-type: text/html; charset=utf-8");

$forum = "http://www.czfree.net/forum";

$select = Query::selectAll("mappers", null, "user_id");
foreach ($select->execute() as $row)
{
	$id = $row['user_id'];
	$contact = User::getContactInfo($id);
	$name = User::convertName($contact['username']);
	
	$mapper = array(
		'nick' => htmlspecialchars($name),
		'profile' => htmlspecialchars("$forum/member.php?action=getinfo&userid=$id"),
		'area' => htmlspecialchars($row['area_desc']),
	);
	
	if ($contact['receiveemail'])
		$mapper['email'] = htmlspecialchars("$forum/member.php?action=mailform&userid=$id");
	
	if ($contact['receivepm'])
		$mapper['pm'] = htmlspecialchars("$forum/private.php?action=newmessage&userid=$id");
	
	if ($contact['icq'])
	{
		$mapper['icq'] = htmlspecialchars($contact['icq']);
		$mapper['flower'] = htmlspecialchars("http://web.icq.com/scripts/online.dll?icq={$contact['icq']}&img=5");
	}
	
	$mappers[$name] = $mapper;
}

uksort($mappers, strcasecmp);

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>Mappers</title>
    <style type="text/css">
      a img { border: none; }
      table { margin: auto; }
      td { border: 1px solid black; }
    </style>
  </head>
  
  <body>
    <table>
      <tr><th>Nick</th><th>Contact</th><th>Area</th></tr>
<? foreach($mappers as $mapper): ?>
      <tr>
        <td><a href="<?=$mapper['profile']?>"><?=$mapper['nick']?></a></td>
        <td>
          <? if (isset($mapper['icq'])): ?><img src="<?=$mapper['flower']?>" alt="icq" /><?=$mapper['icq']?><?endif?> 
          <? if (isset($mapper['email'])): ?><a href="<?=$mapper['email']?>"><img src="<?=$forum?>/images/email.gif" alt="email"/></a><?endif?> 
          <? if (isset($mapper['pm'])): ?><a href="<?=$mapper['pm']?>"><img src="<?=$forum?>/images/pm.gif" alt="pm" /></a><?endif?> 
        </td>
        <td><?=$mapper['area']?></td>
      </tr>
<? endforeach ?>
    </table>
  </body>
</html>
