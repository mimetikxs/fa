FA.State360 = function( app, locationData ) {

    // var name = 'STATE_360';


    var $layer = $( '#layer-360' ),
        $gl = $layer.find( '.gl' ),
        $labels = $layer.find( '.labels' ),
        $btnExit = $layer.find( '.btn-exit' ),
        $btnCloseInfo = $layer.find( '.btn-close' ),
        $btnShowInfo = $layer.find( '.btn-info' ),
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

        $btnExit
            .on( 'click', goBack );

        $btnCloseInfo
            .on( 'click', hideInfo );

        $btnShowInfo
            .on( 'click', showInfo );

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

        $btnExit
            .off( 'click', goBack );

        $btnCloseInfo
            .off( 'click', hideInfo );

        $btnShowInfo
            .off( 'click', showInfo );

        $labels
            .off( 'mousemove', onMouseMove )
            .off( 'mousedown', onMouseDown )
            .off( 'mouseup', onMouseUp );

    }


    function goBack() {

        app.changeState( new FA.StateExplore( app ) );

        view360.clear(); // clear when we go back

        app.sounds = [ ]; // clear the 360 sounds

    }


    function goToVideo( videoData ) {

        // DO NOT clear the View360 so the scene is available when back from video

        // DO NOT clear the sounds

        app.changeState( new FA.StateVideo2( app, view360.getLocationData().slug, videoData ) );

    }


    function loadSound() {

        var soundData = locationData.sound;

        var filesList = [
            {
                url : 'sound/' + soundData.ambient,
                soundId : "ambient",
                loop : true
            }
            // TODO: enter and exit sounds
        ];

        var bufferLoader = new FA.BufferLoader(
            app.audioContext,
            filesList,
            onBuffersLoaded
        );

        bufferLoader.load();

        function onBuffersLoaded( bufferList ) {

            for (var i = 0; i < bufferList.length; i++) {
                var buffer = bufferList[ i ].buffer,
                    id = bufferList[ i ].id,
                    loop = bufferList[ i ].loop;

                var sound = FA.Sound( app.audioContext, buffer, id, loop );

                app.sounds.push( sound );

                // testing
                // play sound as soon as it's loaded
                sound.play();
                sound.fadeIn( 2000 );

            }

        }

    }


    function showSpinner() {

        $layer.find( '.spinner-wrap' ).css( 'display', 'block' );

        // avoid aborting -- TODO: allow abort preloading
        $layer.find( '.btn-exit, .btn-info' ).css( {
            visibility: 'hidden',
            opacity: 0
        } );

        // hide labels
        $labels.css( 'display', 'none' );

    }


    function hideSpinner() {

        $layer.find( '.spinner-wrap' ).css( 'display', 'none' );

        $layer.find( '.btn-exit, .btn-info' )
            .css( 'visibility', 'visible' )
            .transition( { opacity: 1 }, 500, 'out');

        // show labels
        $labels.css( 'display', 'block' );

    }


    function on3DLoaded() {

        hideSpinner();

        // show labels
        $labels.css( 'display', 'block' );

    }


    function initGui( locationData ) {

        $layer
            .find( '.title' ).text( locationData.name ).end()
            .find( '.title-arabic' ).text( locationData.nameAr );

        // hide the info box
        $layer.find( '.box-info-wrap' )
            .css( {
                display: 'none',
                opacity: 0,
            });

        // hide / show the info button
        var noInfo = locationData.info === "" || !locationData.info;
        $btnShowInfo.css( {
            display: noInfo ? 'none' : 'inline-block'
        } );

        // parse and display
        // http://juristr.com/blog/2010/05/n-will-break-your-json-jquery-wcf/
        var html = convertToHTMLVisibleNewline( locationData.info );
        $layer.find( '.box-info .content' ).html( html );

        function convertToHTMLVisibleNewline(value) {
            if (value != null && value != "") {
                return value.replace(/\n/g, "<br/>");
            } else {
                return value;
            }
        }

    }

    function showInfo() {

        $layer.find( '.box-info-wrap' )
            .css( { display: 'block' } )
            .transition( { opacity: 1 }, 250, 'in');

        $btnShowInfo.addClass( 'active' );
    }


    function hideInfo() {

        $layer.find( '.box-info-wrap' )
            .transition( { opacity: 0 }, 250, 'in', function() {
                $(this).css( { display: 'none' } );
            } );

        // reset scroll
        $layer.find( '.box-info .content' ).scrollTop(0);

        $btnShowInfo.removeClass( 'active' );

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
            // do not change the 360  wiew!

            // play the sounds (already loaded)
            app.sounds[0].play();
            app.sounds[0].fadeIn( 2000 );

            // show buttons
            $layer.find( '.btn-exit, .btn-info' ).css( { visibility: 'visible', opacity: 1 } );
            // show labels
            $labels.css( 'display', 'block' );

        } else {

            view360.load( locationData, on3DLoaded );

            initGui( locationData );

            showSpinner();

            // testing sound
            loadSound();
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

        // hide info box
        hideInfo();

        // hide layer
        $layer.css( {
            'opacity': 1,
            'visibility': 'hidden'
        } );
        // hide buttons
        $layer.find( '.btn-exit, .btn-info' ).css( {
            visibility: 'hidden',
            opacity: 0
        } );

        // fadeout all the sounds
        for ( var i = 0; i < app.sounds.length; i++ ) {
            app.sounds[ i ].fadeOut( 1000 );
        }

    }

}
