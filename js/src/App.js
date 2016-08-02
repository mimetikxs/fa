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
        overLocation = null,
        openedLocationId = null,

        requestId,  // allows start/stop animation loop (useful for cta overlay)
        isStoped;


    // https://www.airtightinteractive.com/2015/01/building-a-60fps-webgl-game-on-mobile/
    // http://threejs.org/docs/api/core/Clock.html
    // var clock = new THREE.Clock( true ),
    //     frameDuration = 1/50,
    //     lastElapsed = 0;


    // start loop
    start();


    function start() {

        // resume loop
        if ( !requestId ) {
            update();
            isStoped = false;
        }

    }


    function stop() {

        // stop loop
        if ( requestId ) {
           cancelAnimationFrame( requestId );
           requestId = undefined;
           isStoped = true;
        }

    }


    function update() {

        // var elapsed = clock.getElapsedTime()
        // if ( elapsed - lastElapsed > frameDuration ) {
        //     lastElapsed = elapsed;
        //     currentState.update();
        // }

         currentState.update();

        requestId = requestAnimationFrame( update );

    }


    function changeState( newState ) {

        if ( currentState ) {
            currentState.exit();
            prevState = currentState;
        }
        currentState = newState;
        currentState.enter();

    }


    function goToVideo( id, direction ) {

        var videoData = FA.App.data.mediaById[ id ];

        if ( !videoData ) {
            console.log("[ WARNING ] Resource not found, setting default state");
            goToExplore();
            return;
        }

        if ( openedLocationId ) {
            var locationData = FA.App.data.locationBySlug[ openedLocationId ];
            ion.sound.pause( locationData.sound.ambient );
        }

        changeState( new FA.StateVideo2( FA.App, videoData, direction ) );

    }


    function goToLocation( id ) {

        // handle special case
        if ( $( 'body' ).hasClass( 'mobile' ) ) {
            return;
        }

        var locationData = FA.App.data.locationBySlug[ id ];

        if ( !locationData ) {
            console.log("[ WARNING ] Resource not found, setting default state");
            goToExplore();
            return;
        }

        changeState( new FA.State360( FA.App, locationData ) );

        openedLocationId = id;

    }


    function goToExplore() {

        // handle special case
        if ( $( 'body' ).hasClass( 'mobile' ) ) {
            changeState( new FA.StateExploreMobile( FA.App ) );
            return;
        }

        // this operations are needed to clear
        // resources that have been kept in an idle/inactive state
        if ( openedLocationId ) {
            FA.App.view360.clear();

            var locationData = FA.App.data.locationBySlug[ openedLocationId ];
            ion.sound.destroy( locationData.sound.ambient );
        }

        changeState( new FA.StateExplore( FA.App ) );

        openedLocationId = null;

    }


    // intro aka preload
    function goToIntro() {

        // handle special case
        if ( $( 'body' ).hasClass( 'mobile' ) ) {
            changeState( new FA.StateExploreMobile( FA.App ) );
            return;
        }

        // TODO:
        // destroy all the sounds
        // destroy or reset the main model view
        // reset the app

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


    function getOpenedLoactionId() {

        return openedLocationId;

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
        rooms : [ ],   // FA.InteractiveItem
        buildingView : null,
        modelOpacity : 0.4,

        // 360 view
        view360 : null,

        // public methods
        changeState : changeState,

        getActiveLocation : getActiveLocation,
        setActiveLocation : setActiveLocation,
        getOverLocation : getOverLocation,
        setOverLocation : setOverLocation,
        getOpenedLoactionId : getOpenedLoactionId,

        goToLocation : goToLocation,
        goToVideo : goToVideo,
        goToExplore : goToExplore,
        goToIntro : goToIntro,

        // this mathods are useful to freeze
        // the loop when form overlay is displayed
        stopUpdate : stop,
        startUpdate : start,
        isStoped : function() { return isStoped; }

    }

})(); // App entry point (singleton)


//
// make publisher
//

FA.utils.makePublisher( FA.App );

//
// device detection
// https://web.wurfl.io/#wurfl-js
//
// console.log(WURFL);
if ( WURFL.is_mobile === true ) {

    var formFactor = WURFL.form_factor,
        deviceName =  WURFL.complete_device_name

    if ( formFactor === 'Smartphone' ) {
        $( 'body' ).addClass( 'mobile' );
    }
    else if ( formFactor === 'Tablet' ) {
        $( 'body' ).addClass( 'tablet' );
    }

    if ( deviceName.indexOf( 'iPad' ) !== -1
        || deviceName.indexOf( 'iPhone' ) !== -1
        || deviceName.indexOf( 'iPod' ) !== -1 ) {
            $( 'body' ).addClass( 'ios' );
    }

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
            FA.Router.pushState( 'explore' );
        } );

}

function initMobile() {

    FA.App.changeState( new FA.StateExploreMobile( FA.App ) );

    // var warning = $( browserWarningHtml );
    // $('body').append( warning );

}



// remove address bar on mobile devices
//http://stackoverflow.com/questions/4068559/removing-address-bar-from-browser-to-view-on-android
// function hideAddressBar(){
//   if(document.documentElement.scrollHeight<window.outerHeight/window.devicePixelRatio)
//     document.documentElement.style.height=(window.outerHeight/window.devicePixelRatio)+'px';
//   setTimeout( function(){
//       window.scrollTo(1,1)
//   },0);
// }
// window.addEventListener("load",function(){hideAddressBar();});
// window.addEventListener("orientationchange",function(){hideAddressBar();});





// var browserWarningHtml = [
//     '<div class="warning-browser">',
//         '<div class="box">',
//             '<div class="info-en">',
//                 '<p>Click and Drag to move the camera</p>',
//                 '<p>Best experienced with headphones</p>',
//             '</div>',
//             '<div class="info-ar">',
//                 '<p>انقر واسحب على الساحة لتحريك الكاميرا</p>',
//                 '<p>أدر مكبرات الصوت</p>',
//             '</div>',
//             '<div class="btn-close"></div>',
//         '</div>',
//     '</div>'
// ].join('');
//
//
// var mobileWarningHtml = [
//     '<div class="warning-browser">',
//         '<div class="box">',
//             '<div class="info-en">',
//                 '<p>Click and Drag to move the camera</p>',
//                 '<p>Best experienced with headphones</p>',
//             '</div>',
//             '<div class="info-ar">',
//                 '<p>انقر واسحب على الساحة لتحريك الكاميرا</p>',
//                 '<p>أدر مكبرات الصوت</p>',
//             '</div>',
//             '<div class="btn-close"></div>',
//         '</div>',
//     '</div>'
// ].join('');
