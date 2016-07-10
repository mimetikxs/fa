FA.State360 = function( app, locationData ) {

    var name = 'STATE_360';


    var $layer = $( '#layer-360' ),
        $gl = $layer.find( '.gl' ),
        $labels = $layer.find( '.labels' ),

        view360,

        sceneWidth,
        sceneHeight,

        mouse = new THREE.Vector2(),

        isMouseDown = false,
        labelUnderMouse = null, // string
        itemOnDown = null,      // string

        intersectingItem = null; // FA.InteractiveItem



    function onMouseMove( e ) {

        // local
        mouse.x = e.clientX;
        mouse.y = e.clientY - 50; // header height is 50px

        //  mouse position in normalized device coordinates (-1 to +1)
    	mouse.x = (mouse.x / sceneWidth ) * 2 - 1;
    	mouse.y = - ( mouse.y / sceneHeight ) * 2 + 1;

        var target = $( e.target );

        labelUnderMouse = ( target.is( '.tag' ) ) ? target.parent().data('id') : null;

        if ( isMouseDown ) {
            // nothing
        } else {
            var itemUnderMouse = getItemUnderMouse( mouse );

            if ( itemUnderMouse ) {

                intersectingItem = view360.getItemBySlug( itemUnderMouse );
                intersectingItem.$label.addClass( 'over' );
                intersectingItem.mark();

                $labels.css( 'cursor', 'pointer' );

            } else {

                if ( intersectingItem ) {
                    intersectingItem.$label.removeClass( 'over' );
                    intersectingItem.unmark();
                    intersectingItem = null;
                }

                $labels.css( 'cursor', 'default' );
            }
        }

    }


    function getItemUnderMouse( mouse ) {

        if ( !labelUnderMouse ) {
            var intersectingObject = view360.getIntersectingObject( mouse );
            if ( intersectingObject ) {
                return intersectingObject.name;
            } else  {
                return null;
            }
        } else {
            return labelUnderMouse;
        }

    }


    function onMouseDown( e ) {

        isMouseDown = true;

        itemOnDown = getItemUnderMouse( mouse );

    }


    function onMouseUp( e ) {

        isMouseDown = false;

        var itemOnUp = getItemUnderMouse( mouse );
        if ( itemOnUp === itemOnDown  &&  itemOnUp !== null ) {

            // unmark selected item
            if ( intersectingItem ) {
                intersectingItem.$label.removeClass( 'over' );
                intersectingItem.unmark();
                intersectingItem = null;
            }

            // launch video
            var videoData = app.data.mediaById[ itemOnUp ];
            goToVideo( videoData );
        }

    }


    function onWindowResize() {

        sceneWidth = $gl.width();
        sceneHeight = $gl.height();

        view360.setSize( sceneWidth, sceneHeight );

    }


    function addListeners() {

        window.addEventListener( 'resize', onWindowResize, false );

        $( '.btn-exit' ).on( 'click', goBack );

        $labels
            .on( 'mousemove', onMouseMove )
            .on( 'mousedown', onMouseDown )
            .on( 'mouseup', onMouseUp );

        // $( '.label' ).on( 'click', function(){
        //     app.changeState( new FA.StateVideo2( app, "cell", { title: "interactive item" } ) ); // back to cell after video
        // });

    }


    function removeListeners() {

        window.removeEventListener( 'resize', onWindowResize );

        $('.btn-exit')
            .off( 'click', goBack );

        $labels
            .off( 'mousemove', onMouseMove )
            .off( 'mousedown', onMouseDown )
            .off( 'mouseup', onMouseUp );

    }


    function goBack() {

        view360.clear(); // clear when we go back

        app.changeState( new FA.StateExplore( app ) );

    }


    function goToVideo( videoData ) {

        //DO NOT clear the View360 so the scene is available when back from video

        app.changeState( new FA.StateVideo2( app, 'cell', videoData ) );

    }


    //        //
    // Public //
    //        //


    this.enter = function() {

        // create only once
        app.view360 = app.view360 || new FA.View360( app );

        // shortcut
        view360 = app.view360;

        // when we are back from a video, locationData is undefined
        // we assume view360 is not cleared, so we keep the old data
        if ( !locationData ) {
            // do nothing
        } else {
            // load a new 360
            $layer.find( '.title' ).text( locationData.name );
            view360.load( locationData );
        }

        // reveal layer
        $( '#header' ).css( 'top', 0 );
        $layer.css( {
            'visibility': 'visible',
            'opacity': 1
        } );

        addListeners();

        onWindowResize();

    }


    this.update = function ()  {

        view360.update();

    }


    this.exit = function() {

        removeListeners();

        // hide layer
        $layer.css( {
            'opacity': 1,
            'visibility': 'hidden'
        } );

    }

}
