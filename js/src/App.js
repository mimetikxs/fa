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


    // setup audio
    // window.AudioContext = window.AudioContext || window.webkitAudioContext;
    // var audioContext = new AudioContext();



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

        // sound
        // audioContext : audioContext,
        // sounds : [ ],                   // FA.Sound

        // public methods
        changeState : changeState,

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
            FA.App.changeState( new FA.StateExplore( FA.App ) );
        } );

}

function initMobile() {

    FA.App.changeState( new FA.StateExploreMobile( FA.App ) );

}
