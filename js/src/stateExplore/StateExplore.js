
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
        slider.onChange( setOpacity );
        slider.setPercent( app.modelOpacity ); // 30%
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

        var locationData = app.data.locationBySlug[ slug ];

        app.changeState( new FA.State360( app, locationData ) );

    }

    //        //
    // Public //
    //        //


    this.enter = function() {

        // initilise the objects only the first time
        app.buildingView = app.buildingView || new FA.BuildingView( app );
        app.menuView = app.menuView || new FA.MenuView( app )

        buildingView =  app.buildingView;
        labelsView = new FA.LabelsView( app );
        menuView = app.menuView;

        buildSlider();

        buildingView.setOpacity( app.modelOpacity );

        onWindowResize();

        // listeners
        $(window).on( 'resize', onWindowResize );
        $labels
            .on( 'mousemove', onMouseMove )
            .on( 'mousedown', onMouseDown )
            .on( 'mouseup', onMouseUp );

        // revealing //////////////////////////////////////////
        $gl.css( 'opacity', 1 );
        $labels.css( 'opacity', 1 );
        $( '#header' ).css( 'top', 0 );
        menuView.show();
        //////////////////////////////////////////////////////

        // testing sound
        ion.sound.play( app.data.mainScreenSound.ambient );

    }


    this.update = function() {

        menuView.update();

        buildingView.update();

        labelsView.update( buildingView.getCamera() );

    }


    this.exit = function() {

        // remove listeners
        $(window).off( 'resize', onWindowResize );
        $labels
            .off( 'mousemove', onMouseMove )
            .off( 'mousedown', onMouseDown )
            .off( 'mouseup', onMouseUp );

        //app.setOverLocation( null );
        // app.setActiveLocation( null );

        //buildingView.destroy();
        menuView.hide();
        labelsView.destroy();

        destroySlider();

        // testing sound
        // ion.sound.volume( app.data.mainScreenSound.ambient, {volume:0.5} );
        ion.sound.pause( app.data.mainScreenSound.ambient );

    }

}
