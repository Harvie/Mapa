#!/bin/sh

INDIR="`dirname "$0"`"
OUTDIR=${1:-.}
SIZE=${2:-15x15}

function SVGtoPNG()
{
	sed "s/{COLOR1}/$3/;s/{COLOR2}/$4/" "$1" | convert -background transparent -scale $SIZE - "$2"
}

while read node_number source node_color; do
	while read status_number status_color; do
		SVGtoPNG "$INDIR/$source" "$OUTDIR/$node_number-$status_number.png" $status_color $node_color
	done < "$INDIR/colors.txt"
done < "$INDIR/images.txt"
