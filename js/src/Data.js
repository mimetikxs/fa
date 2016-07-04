FA.Data = function( data ) {

	var mediasByLocation = {},
		mediasByWitness = {},

	 	medias = data.media,
		locations = data.locations,
		witnesses = data.witnesses,
		media,
		location,
		witness,
		i, j;

	// create location lookup
	for ( i = 0; i < locations.length; i++ ) {
		location = locations[ i ].slug;
		mediasByLocation[ location ] = [];
		for ( j = 0; j < medias.length; j++ ) {
			media = medias[ j ];
			if ( media.location === location ) {
				mediasByLocation[ location ].push( media );
			}
		}
	}

	// create witness lookup
	for ( i = 0; i < witnesses.length; i++ ) {
		witness = witnesses[ i ].slug;
		mediasByWitness[ witness ] = [];
		for ( j = 0; j < medias.length; j++ ) {
			media = medias[ j ];
			if ( media.witness === witness ) {
				mediasByWitness[ witness ].push( media );
			}
		}
	}

	return {
		locations : locations,
		witnesses : witnesses,
		medias : medias,
		mediasByLocation : mediasByLocation,
		mediasByWitness : mediasByWitness
	}

}
