<?php

require_once('czfmap_remote.php');

try {
	//Initialize connection, see CzfMapRemote for parameter description
	$remote = new CzfMapRemote("http://mapa.czfree.net/devel/", 666, "098f6bcd4621d373cade4e832627b4f6");
	
	//Create new (empty) node, set basic properties
	$node = $remote->getNode();
	$node->type = CzfMapNode::TYPE_AP;
	$node->name = 'API test';
	$node->address = 'test';
	$node->lat = 50.00576;
	$node->lng = 14.40937;
	
	//Find a node by its name, add link to the node
	$search1 = $remote->search('p12.Javor');
	$javorID = $search1[0]['id'];
	$link1 = $node->addLink($javorID);
	$link1->media = CzfMapLink::MEDIA_2GHZ;
	$link1->active = 0;
	
	//Add another link the same way
	$search2 = $remote->search('NFX');
	$nfxID = $search2[0]['id'];
	$link2 = $node->addLink($nfxID);
	$link2->media = CzfMapLink::MEDIA_FIBER;
	$link2->active = 0;
	
	//Save changes (create the node)
	$node->save();
	
	//Retrieve the same node by its ID and modify it
	$node = $remote->getNode($node->id);
	$node->name = 'API test renamed';
	$node->status = CzfMapNode::STATUS_CONSTRUCTION;
	
	//Retrieve the first link by endpoint ID and modify it
	$link = $node->links[$javorID];
	$link->media = CzfMapLink::MEDIA_5GHZ;
	
	//Remove the second link and save the changes
	$node->removeLink($nfxID);
	$node->save();
	
	//Delete the node completely
	$node->delete();
	
	/* Warning: Don't try to synchronize the map with your IS by deleting
	 *          all nodes and recreating them, map history would grow
	 *          rapidly and your access would be revoked!
	 */
}
catch (CzfMapRemoteException $e) {
	echo "ERROR: " . $e->getMessage() . "\n";
}
