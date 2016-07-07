/*
 * State machine + main loop + data model
 * Resources are loaded/initialized during StatePreload
 */


FA.App = (function() {

    var currentState = new FA.StateIdle(),

        prevLocation = null,
        activeLocation = null,            // slug of the current location
        prevOverLocation = null,
        overLocation = null;


    update();


    function update() {

        requestAnimationFrame( update );

        currentState.update();

    }


    function changeState( newState ) {

        if (currentState) {
            currentState.exit();
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

        // mesh + texture data
        buildingMesh     : null,
        buildingRoofMesh : null,
        terrainMesh      : null,
        rooms            : [ ],  // FA.Room

        // views
        buildingView : null,

        // cell
        cellMesh : null,

        // public methods
        changeState : changeState,

        getActiveLocation : getActiveLocation,
        setActiveLocation : setActiveLocation,
        getOverLocation : getOverLocation,
        setOverLocation : setOverLocation


    }

})(); // App entry point (singleton)

// make publisher
FA.utils.makePublisher( FA.App );

// set inital state
FA.App.changeState( new FA.StatePreload( FA.App ) );


//
// global scope event listeners
//

$( window ).on( 'resize', function( e ) {
    $( '#content' ).css( 'height', $(window).height() - 50 ); // header bar is 50px
} ).trigger( 'resize' );
