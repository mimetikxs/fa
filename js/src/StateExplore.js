/*
 * Level 0 (root)
 */

FA.StateExplore = function( app ) {

    var $layerGl = $('#layer-gl'),
        $layerLabels = $('#layer-labels'),

        sceneWidth,
        sceneHeight,

        buildingView,
        labelsView,
        menuView,

        gui,

        // mouse picking
        mouse = new THREE.Vector2(),
        isMouseDown = false;


    function buildGui() {

        // stats = new Stats();
		// stats.domElement.style.position = 'absolute';
		// stats.domElement.style.top = '0px';
        // document.body.appendChild( stats.domElement );

        gui = new dat.GUI( { width: 250 } );

        gui.add( FA.parameters, 'opacity', 0.0, 1.0 ).onChange( setOpacity );
        // gui.close();

        // set initial values
        FA.parameters.opacity = 0.3;
        buildingView.setOpacity( 0.3 );

        // Iterate over all controllers
        for (var i in gui.__controllers) {
            gui.__controllers[ i ].updateDisplay();
        }

    }


    function setOpacity( val ) {

        buildingView.setOpacity( val );
        labelsView.setOpacity( val );

    }


    function onWindowResize() {

        sceneWidth = $layerGl.width();
        sceneHeight = $layerGl.height();

        console.log(sceneWidth, sceneHeight );

        buildingView.setSize( sceneWidth, sceneHeight );
        labelsView.setSize( sceneWidth, sceneHeight )

    }


    function onMouseMove( e ) {

        //  mouse position in normalized device coordinates (-1 to +1) for both components
    	mouse.x = ( e.clientX / sceneWidth ) * 2 - 1;
    	mouse.y = - ( e.clientY / sceneHeight ) * 2 + 1;

        if ( isMouseDown ) {
            return;
        }

        var target = $(e.target),
            labelUnderMouse = ( target.is( '.tag' ) ) ? target.parent().data('id') : null;

        if ( !labelUnderMouse ) {
            var intersectingRoom = buildingView.getIntersectingRoom( mouse );
            if ( intersectingRoom ) {
                app.setOverLocation( intersectingRoom.name );
            } else  {
                app.setOverLocation( null );
            }
        }

    }


    function onMouseDown( e ) {

        isMouseDown = true;

    }


    function onMouseUp( e ) {

        isMouseDown = false;

    }


    function goToRoom( slug ) {

        app.changeState( new FA.StateCell( app ) );

    }


    var count = 0;
    var color = new THREE.Color( 0,0,0 );
    var black = new THREE.Color( 0,0,0 );
    var red = new THREE.Color( 1,0,0 );
    function animateRoom() {
        count += 0.05;
        var val = ( 1 + Math.sin( count ) ) * 0.5;
        color.copy(black);
        color.lerp(red, val);
        // app.rooms[0].material.emissive.setHex(color.getHex());
    }


    //        //
    // Public //
    //        //


    this.enter = function() {

        // views if they don't already exist
        // the object won't be destroyed to keep the state
        // of the view (camera position, etc)
        // this also speeds up transitions from sub-views
        app.buildingView = app.buildingView || new FA.BuildingView( app );
        app.menuView = app.menuView || new FA.MenuView( app )

        buildingView =  app.buildingView;
        labelsView = new FA.LabelsView( app );
        menuView = app.menuView;

        buildGui();

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

        $('#title').text('SEDNAYA PRISON');
        menuView.show();
        //////////////////////////////////////////////////////

    }


    this.update = function() {

        // stats.begin();

        menuView.update();

        buildingView.render();

        labelsView.update( buildingView.getCamera() );

        // stats.end();

    }


    this.exit = function() {

        //buildingView.destroy();
        //menuView.destroy();
        menuView.hide();
        labelsView.destroy();

        // menu

        // gui
        gui.destroy();

        // remove listeners
        $(window).off( 'resize', onWindowResize );
        $layerLabels
            .off( 'mousemove', onMouseMove )
            .off( 'mousedown', onMouseDown )
            .off( 'mouseup', onMouseUp );

        // stats
        // $('#stats').remove();
        // stats = null;

    }

}
