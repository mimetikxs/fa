FA.Data = function( data ) {

	var mediasByLocation = {},
		mediasByWitness = {},
		mediaById = {},
		locationBySlug = {},
		witnessBySlug = {},

	 	medias = data.media,
		locations = data.locations,
		witnesses = data.witnesses,
		media,
		location,
		witness,
		i, j;

	// create media by location lookup
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

	// create media by witness lookup
	for ( i = 0; i < witnesses.length; i++ ) {
		witness = witnesses[ i ].slug;
		mediasByWitness[ witness ] = [];
		for ( j = 0; j < medias.length; j++ ) {
			media = medias[ j ];
			// iterate the list of witnesses associated to this video
			var witnessList = media.witness;
			for (var k = 0; k < witnessList.length; k++) {
				if ( witnessList[ k ] === witness ) {
					mediasByWitness[ witness ].push( media );
				}
			}

		}
	}

	// create media lookup
	for ( i = 0; i < medias.length; i++ ) {
		media = medias[ i ];
		mediaById[ media.id ] = media;
	}

	// create location lookup
	for ( i = 0; i < locations.length; i++ ) {
		location = locations[ i ];
		locationBySlug[ location.slug ] = location;
	}

	// create witness lookup
	for ( i = 0; i < witnesses.length; i++ ) {
		witness = witnesses[ i ];
		witnessBySlug[ witness.slug ] = witness;
	}

	return {
		locations : locations,
		witnesses : witnesses,
		medias : medias,
		mediasByLocation : mediasByLocation,
		mediasByWitness : mediasByWitness,
		mediaById : mediaById,
		locationBySlug : locationBySlug,
		witnessBySlug : witnessBySlug,

		// intro data
		introVideo : data.introVideo,
		//
		mainScreenSound : data.mainScreenSound
	}

}
