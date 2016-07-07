/*
 * Level 0 (root)
 */

FA.StateExplore = function( app ) {

    // TODO: change opacity of model if mouse over left menu
    // opacity returns to the value of the slider after mouse leave


    var $layerGl = $('#layer-gl'),
        $layerLabels = $('#layer-labels'),

        sceneWidth,
        sceneHeight,

        buildingView,
        labelsView,
        menuView,

        slider,

        // mouse picking
        mouse = new THREE.Vector2(),
        isMouseDown = false;



var roomOnDown = null;


    function buildSlider() {

        slider = new FA.Slider();
        slider.onChange( setOpacity );
        slider.setPercent( 30 ); // 30%
        $('body').append( slider.$dom );

    }


    function destroySlider() {

        slider.destroy();
        slider.$dom.remove();

    }


    function setOpacity( val ) {

        buildingView.setOpacity( val );
        labelsView.setOpacity( val );

    }


    function onWindowResize() {

        sceneWidth = $layerGl.width();
        sceneHeight = $layerGl.height();

        buildingView.setSize( sceneWidth, sceneHeight );
        labelsView.setSize( sceneWidth, sceneHeight )

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
            app.setOverLocation( getRoomUnderMouse( mouse ) );
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

        //app.setActiveLocation( slug );

        app.changeState( new FA.StateCell( app ) );

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

        buildingView.setOpacity( 0.3 );

        onWindowResize();

        // listeners
        $(window).on( 'resize', onWindowResize );
        $layerLabels
            .on( 'mousemove', onMouseMove )
            .on( 'mousedown', onMouseDown )
            .on( 'mouseup', onMouseUp );

        // revealing //////////////////////////////////////////
        $layerGl.css( 'opacity', 1 );
        $layerLabels.css( 'opacity', 1 );
        $( '#header' ).css( 'top', 0 );
        menuView.show();
        //////////////////////////////////////////////////////

        console.log(app.getActiveLocation(), app.getOverLocation());

    }


    this.update = function() {

        menuView.update();

        buildingView.update();

        labelsView.update( buildingView.getCamera() );

    }


    this.exit = function() {

        // remove listeners
        $(window).off( 'resize', onWindowResize );
        $layerLabels
            .off( 'mousemove', onMouseMove )
            .off( 'mousedown', onMouseDown )
            .off( 'mouseup', onMouseUp );

        app.setOverLocation( null );
        // app.setActiveLocation( null );

        //buildingView.destroy();
        menuView.hide();
        labelsView.destroy();

        // slider.hide();
        destroySlider();


    }

}
