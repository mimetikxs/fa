FA.Router = ( function() {

    //
    // listen for state changes
    //
    History.Adapter.bind( window, 'statechange', processUrl );


    //
    // change App state based on the current url
    //
    function processUrl() {

        var urlVars = getUrlVars( History.getState().url ),
            kind = urlVars[ 'kind' ],
            id = urlVars[ 'id' ];

        // video
        if ( kind === 'video' )
        {
            var direction = urlVars[ 'dir' ];

            FA.App.goToVideo( id, direction );
            return;
        }

        // location (aka 360)
        if ( kind === 'location' )
        {
            FA.App.goToLocation( id );
            return;
        }

        // default: explore
        FA.App.goToExplore();

    }


    //
    // http://stackoverflow.com/questions/4656843/jquery-get-querystring-from-url
    //
    function getUrlVars( hashString ) {

        var vars = {},
            hash,
            hashes = hashString.slice( hashString.indexOf( '?' ) + 1 ).split( '&' );
        for ( var i = 0; i < hashes.length; i++ ) {
            hash = hashes[ i ].split( '=' );
            vars[ hash [ 0 ] ] = hash[ 1 ];
        }
        return vars;

    }


    function pushState( kind, id, direction ) {

        var title,
            url;

        if ( kind === 'video' ) {
            title = FA.App.data.mediaById[ id ].title;
            var dirString = ( !direction ) ?  '' : '&dir=' + direction;
            url = '?kind=video&id=' + id + dirString;
        }

        else if ( kind === 'location' ) {
            title = FA.App.data.locationBySlug[ id ].name;
            url = '?kind=location&id=' + id;
        }

        else if ( kind === 'explore' ) {
            title = 'Explore Saydnaya';
            url = '?kind=explore';
        }

        History.pushState( null, title, url );

    }


    //        //
    // Public //
    //        //


    return {

        pushState : pushState,
        processUrl : processUrl,

        getUrlVars : getUrlVars

    }

} )();
