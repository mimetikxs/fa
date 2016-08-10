
FA.StateExplore = function( app ) {

    // var name = 'STATE_EXPLORE';

    var $gl = $('#layer-prison .gl'),
        $labels = $('#layer-prison .labels'),

        sceneWidth,
        sceneHeight,

        buildingView,
        labelsView,
        menuView,

        slider,

        // mouse picking
        mouse = new THREE.Vector2(),
        isMouseDown = false,

        roomOnDown = null;


    function buildSlider() {

        slider = new FA.Slider();
        slider.setPercent( app.modelOpacity );
        slider.onChange( setOpacity );
        $( 'body' ).append( slider.$dom );

    }


    function destroySlider() {

        slider.destroy();
        slider.$dom.remove();

    }


    function setOpacity( val ) {

        app.modelOpacity = val;

        buildingView.setOpacity( val );
        labelsView.setOpacity( val );

    }


    function onWindowResize() {

        sceneWidth = $gl.width();
        sceneHeight = $gl.height();

        buildingView.setSize( sceneWidth, sceneHeight );
        labelsView.setSize( sceneWidth, sceneHeight );

    }


    function onMouseMove( e ) {

        // local
        mouse.x = e.clientX;
        mouse.y = e.clientY - 50; // header height is 50px

        //  mouse position in normalized device coordinates (-1 to +1) for both components
    	mouse.x = (mouse.x / sceneWidth ) * 2 - 1;
    	mouse.y = - ( mouse.y / sceneHeight ) * 2 + 1;

        var target = $( e.target );

        labelUnderMouse = ( target.is( '.tag' ) ) ? target.parent().data('id') : null;

        if ( isMouseDown ) {
            // app.setOverLocation( null );
        } else {
            var roomUnderMouse = getRoomUnderMouse( mouse );

            app.setOverLocation( roomUnderMouse );

            // change mouse cursor
            if ( roomUnderMouse ) {
                $labels.css( 'cursor', 'pointer' );
            } else {
                $labels.css( 'cursor', 'default' );
            }
        }

    }


    function getRoomUnderMouse( mouse ) {

        if ( !labelUnderMouse ) {
            var intersectingRoom = buildingView.getIntersectingRoom( mouse );
            if ( intersectingRoom ) {
                return intersectingRoom.name;
            } else  {
                return null;
            }
        } else {
            return labelUnderMouse;
        }

    }


    function onMouseDown( e ) {

        isMouseDown = true;

        roomOnDown = getRoomUnderMouse( mouse );

    }


    function onMouseUp( e ) {

        isMouseDown = false;

        var roomOnUp = getRoomUnderMouse( mouse );
        if ( roomOnUp === roomOnDown  &&  roomOnUp !== null ) {
            goToRoom( roomOnUp );
        }

        if (!roomOnUp) {
            app.setOverLocation( null );
        }

    }


    function goToRoom( slug ) {

        app.setActiveLocation( slug );

        FA.Router.pushState( 'location', slug );

    }


    function playSound() {

        try {
            ion.sound.play( app.data.mainScreenSound.ambient );
        } catch( err ) {
            console.log( err );
        }

    }


    function pauseSound() {

        try {
            ion.sound.pause( app.data.mainScreenSound.ambient );
        } catch( err ) {
            console.log( err );
        }

    }


    function addListeners() {

        $(window)
            .on( 'resize', onWindowResize );

        $labels
            .on( 'mousemove', onMouseMove )
            .on( 'mousedown', onMouseDown )
            .on( 'mouseup', onMouseUp );

        // action form
        $( '#header [data-action="cta"]' ).on( 'click', function() {
            FA.ActionFormOverlay.open();
            pauseSound();
            app.stopUpdate();
        } );
        FA.ActionFormOverlay.onClose( function() {
            playSound();
            app.startUpdate();
        } );

    }


    function removeListeners() {

        $(window)
            .off( 'resize', onWindowResize );

        $labels
            .off( 'mousemove', onMouseMove )
            .off( 'mousedown', onMouseDown )
            .off( 'mouseup', onMouseUp );

        // action form
        $( '#header [data-action="cta"]' ).off();
        FA.ActionFormOverlay.onClose( null );

    }


    function showHelpPopup() {

        setOpacity( 1 );

        $( '.info-popup' )
            .css( { 'display': 'block' } )
            .transition( { opacity: 1 }, 400, 'in', function() {
                // add listener
                $( '.info-popup' ).on( 'click', function( e ) {
                    var t = $( e.target );
                    if ( t.is( '.btn-close' ) || t.is( '.info-popup' ) ) {
                        closeHelpPopup();
                    }
                } );
            } );

        // avoid showing popup again
        $( '#content' ).addClass( 'noHelp' );

    }


    function closeHelpPopup() {

        // show gui elements
        menuView.show();
        slider.show();
        $( '#layer-prison .title').css('opacity', 1);

        // hide help
        $( '.info-popup' )
            .transition( { opacity: 0 }, 200, 'in', function() {
                $( '.info-popup' ).css( {'display': 'none' } )
                // remove listener
                $( '.info-popup' ).off();
            } );

        // animate building opacity
        $( app ).animate( {
            modelOpacity: 0.4
        },{
            duration: 1500,
            easing: 'linear',
            step: function ( val ) {
                slider.setPercent( val )
            }
        });

    }


    //        //
    // Public //
    //        //


    this.getName = function() {

        return 'STATE_EXPLORE';

    }


    this.enter = function() {

        // initilise the objects only the first time
        app.buildingView = app.buildingView || new FA.BuildingView( app );
        app.menuView = app.menuView || new FA.MenuView( app )

        menuView = app.menuView;
        buildingView =  app.buildingView;
        labelsView = new FA.LabelsView( app );
        buildSlider();

        onWindowResize();
        addListeners();

        // revealing //////////////////////////////////////////
        $gl.css( 'opacity', 1 );

        var noHelp = $( '#content' ).hasClass( 'noHelp' );

        if ( noHelp ) {
            menuView.show();
            slider.show();
            labelsView.setOpacity( app.modelOpacity );
            buildingView.setOpacity( app.modelOpacity );
            $( '#layer-prison .title').css('opacity', 1);
        } else {
            setTimeout( function() {
                showHelpPopup();
            }, 500 );
        }
        //////////////////////////////////////////////////////

        playSound();

    }


    this.update = function() {

        menuView.update();

        buildingView.update();

        labelsView.update( buildingView.getCamera() );

    }


    this.exit = function() {

        removeListeners();

        menuView.hide();
        labelsView.destroy();

        destroySlider();

        pauseSound();

    }

}
