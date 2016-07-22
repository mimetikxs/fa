/*
 * State machine + main loop + data model
 * Resources are loaded/initialized during StatePreload
 */


FA.App = (function() {

    var currentState = new FA.StateIdle(),
        prevState = null,

        prevLocation = null,
        activeLocation = null,            // slug of the current location
        prevOverLocation = null,
        overLocation = null;


    // start loop
    update();


    function update() {

        requestAnimationFrame( update );

        currentState.update();

    }


    function changeState( newState ) {

        if ( currentState ) {
            currentState.exit();
            prevState = currentState;
        }
        currentState = newState;
        currentState.enter();

    }


    function getActiveLocation() { return activeLocation; }
    function setActiveLocation( slug ) {

        if (slug === activeLocation) {
            return;
        }

        prevLocation = activeLocation;
        activeLocation = slug;

        this.fire( 'activeLocationChange', { current: activeLocation, prev: prevLocation } );

    }

    function getOverLocation() { return overLocation; }
    function setOverLocation( slug ) {

        if (slug === overLocation) {
            return;
        }

        prevOverLocation = overLocation;
        overLocation = slug;

        this.fire( 'overLocationChange', { location: overLocation, prev: prevOverLocation } );

    }


    //        //
    // Public //
    //        //


    return {

        data : null,

        // prison mesh + texture data
        buildingMesh     : null,
        buildingRoofMesh : null,
        terrainMesh      : null,

        // prison view
        rooms : [ ],                    // FA.InteractiveItem
        buildingView : null,
        modelOpacity : 0.4,

        // 360 view
        view360 : null,

        // public methods
        changeState : changeState,

        // getCurrentState : function() { return currentState; },
        getPrevState : function() { return prevState; },

        getActiveLocation : getActiveLocation,
        setActiveLocation : setActiveLocation,
        getOverLocation : getOverLocation,
        setOverLocation : setOverLocation

    }

})(); // App entry point (singleton)

//
// make publisher
//

FA.utils.makePublisher( FA.App );

//
// is this mobile?
//

if ( FA.utils.isMobile() ) {

    $( 'body' ).addClass( 'mobile' );

}

//
// set inital state
//

if ( $( 'body' ).hasClass( 'mobile' ) ) {

    initMobile();

} else {

    initStandard();

}

function initStandard() {

    FA.App.changeState( new FA.StatePreload( FA.App ) );

    // global scope event listeners:

    // resize content div
    $( window )
        .on( 'resize', function( e ) {
            $( '#content' ).css( 'height', $( window ).height() - 50 ); // header bar is 50px height
        } ).trigger( 'resize' );

    // return to explore view
    $( 'body[data-section="explore"] .mainNav-menu [data-target="explore"]' )
        .on( 'click', function( e ) {
            //FA.App.changeState( new FA.StateExplore( FA.App ) );
            History.pushState( null, null, '?kind=explore' );
        } );

}

function initMobile() {

    FA.App.changeState( new FA.StateExploreMobile( FA.App ) );

}





// ----------------------------------------------------------------------------------------
// history listener
// to provide deep linking to content in the app
// at the moment, links to:
// - home screen (root)
// - videos
// todo:
// - link to 360s
// ----------------------------------------------------------------------------------------

// listen for state changes
History.Adapter.bind( window, 'statechange', processUrl );

// maps the url with an application state (explore, video...)
function processUrl() {

    var urlVars = getUrlVars( History.getState().url ),
        kind = urlVars[ 'kind' ],
        id = urlVars[ 'id' ],
        title;

    // video
    if ( kind === 'video' )
    {
        var isValid = FA.App.data.mediaById[ id ];

        if ( isValid ) {
            FA.App.changeState( new FA.StateVideo2( FA.App, id ) );
        } else {
            // error: url not found
        }
        return;
    }

    // location (aka 360)
    if ( kind === 'location' )
    {
        var isValid = FA.App.data.locationBySlug[ id ];

        if ( isValid ) {
            FA.App.changeState( new FA.State360( FA.App, id ) );
        } else {
            // error: url not found
        }
        return;
    }


    // home
    // if ( url[ 'index' ] )
    // {
        FA.App.changeState( new FA.StateExplore( FA.App ) );
    // }

    // http://stackoverflow.com/questions/4656843/jquery-get-querystring-from-url
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
}
