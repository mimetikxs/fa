FA.utils = {};	// utils namespace

/*
 * Stoyan Stefanov - JavaScript Patterns
 * Observer pattern
 */

FA.utils.publisher = {

	subscribers: {

		any: []

	},

	on: function( type, fn, context ) {

		type = type || any;
		fn = ( typeof fn === "function" ) ? fn : context[ fn ];

		if ( typeof this.subscribers[ type ] === "undefined" ) {

			this.subscribers[ type ] = [];
		}

		this.subscribers[ type ].push( {
			fn: fn,
			context: context || this
		} );

	},

	remove: function( type, fn, context ) {

		this.visitSubscribers( 'unsuscribe', type, fn, context );

	},

	fire: function( type, publication ) {

		this.visitSubscribers( 'publish', type, publication );

	},

	visitSubscribers: function( action, type, arg, context ) {

		var pubtype = type || 'any',
			subscribers = this.subscribers[ pubtype ],
			i, max = subscribers ? subscribers.length : 0;

		for ( i = 0; i < max; i ++ ) {

			if ( action === 'publish' ) {

				subscribers[ i ].fn.call( subscribers[ i ].context, arg );

			} else {

				if ( subscribers[ i ].fn === arg
					&& subscribers[ i ].context === context ) {

					subscribers.splice( i, 1 );
				}
			}
		}

	}

};

// turn any object into a publisher
FA.utils.makePublisher = function( object ) {

	var i, publisher = FA.utils.publisher;

	for ( i in publisher ) {

		if ( publisher.hasOwnProperty( i )
			&& typeof publisher[ i ] === "function" ) {

			object[ i ] = publisher[ i ];
		}
	}

	object.subscribers = { any: [] };

};
