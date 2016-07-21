FA.State360 = function( app, locationData ) {

    // var name = 'STATE_360';

    var $layer = $( '#layer-360' ),
        $gl = $layer.find( '.gl' ),
        $labels = $layer.find( '.labels' ),
        $btnExit = $layer.find( '.btn-exit' ),
        $btnCloseInfo = $layer.find( '.btn-close' ),
        $btnsShowInfo = $layer.find( '.title, .title-arabic' ), // these two elements trigger the info
        view360,

        sceneWidth,
        sceneHeight,

        mouse = new THREE.Vector2(),

        isMouseDown = false,
        labelUnderMouse = null, // string
        itemOnDown = null,      // string

        intersectingItem = null, // FA.InteractiveItem

        // auto scrolling
        localMouseY = 0,
        targetScroll = 0,
        currentScroll = 0,
        $infoContent = $layer.find( '.box-info .content' );



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

    function onBoxInfoMouseMove( e ) {

        // auto scrolling
        localMouseY = e.pageY - $infoContent.parent().offset().top;

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

        $btnsShowInfo
            .on( 'click', onShowInfoClick );

        $labels
            .on( 'mousemove', onMouseMove )
            .on( 'mousedown', onMouseDown )
            .on( 'mouseup', onMouseUp );

        // auto scroll
        $('.box-info')
            .on( 'mousemove', onBoxInfoMouseMove )




        // $( '.label' ).on( 'click', function(){
        //     app.changeState( new FA.StateVideo2( app, "cell", { title: "interactive item" } ) ); // back to cell after video
        // });

    }


    function onShowInfoClick( e ) {

        var targetLang = $( e.target ).hasClass( 'title-arabic' ) ? 'ar' : 'en';

        showInfo( targetLang );

    }


    function removeListeners() {

        window.removeEventListener( 'resize', onWindowResize );

        $btnExit
            .off( 'click', goBack );

        $btnCloseInfo
            .off( 'click', hideInfo );

        $btnsShowInfo
            .off( 'click', onShowInfoClick );

        $labels
            .off( 'mousemove', onMouseMove )
            .off( 'mousedown', onMouseDown )
            .off( 'mouseup', onMouseUp );

    }


    function goBack() {

        app.changeState( new FA.StateExplore( app ) );

        view360.clear(); // clear when we go back

        destroySound();

    }


    function goToVideo( videoData ) {

        // DO NOT clear the View360 so the scene is available when back from video

        // DO NOT clear the sounds, only pause
        pauseSound();

        var locationData = app.data.locationBySlug[ app.getActiveLocation() ];
        app.changeState( new FA.StateVideo2( app, locationData.slug, videoData ) );

    }


    function loadSound() {

        var locationData = app.data.locationBySlug[ app.getActiveLocation() ],
            soundData = locationData.sound;

        // create the sound for the main screen
        ion.sound({
            sounds: [
                {
                    name: soundData.ambient,
                    loop: true
                },
            ],
            path: "sound/",
            preload: true,
            multiplay: true,
            // volume: 0.9
            // ready_callback: function() {
            //     isSoundLoaded = true;
            // }
        });

        console.log( "loading / playing", soundData.ambient );

        ion.sound.play( soundData.ambient );

    }


    function resumeSound() {

        var locationData = app.data.locationBySlug[ app.getActiveLocation() ],
            soundData = locationData.sound;

        console.log( "resuming", soundData.ambient );

        ion.sound.play( soundData.ambient );

    }


    function pauseSound() {

        var locationData = app.data.locationBySlug[ app.getActiveLocation() ],
            soundData = locationData.sound;

        console.log( "pausing", soundData.ambient );

        ion.sound.pause( soundData.ambient );

    }


    function destroySound() {

        var locationData = app.data.locationBySlug[ app.getActiveLocation() ],
            soundData = locationData.sound;

        console.log( "destroying", soundData.ambient );

        ion.sound.destroy( soundData.ambient );

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

    function showInfo( lang ) {

        var styleAcive = {
                'opacity': 1,
                'top': '30px',
                'color': '#000',
                'background-color': 'rgba(255,255,255,0.8)',
                'height': '',
                'line-height': '',
                'font-size': ''
            },
            styleAciveAr = {
                'opacity': 1,
                'top': '30px',
                'color': '#000',
                'background-color': 'rgba(255,255,255,0.8)',
                'height': '43px',
                'line-height': '40px',
                'font-size': '28px'
            },
            styleInactive = {
                'opacity': 0,
                'top': '',
                'color': '',
                'background-color': '',
                'height': '',
                'line-height': '',
                'font-size': ''
            };

        if ( lang === 'en' ) {
            $layer.find( '.title' ).css( styleAcive );
            $layer.find( '.title-arabic' ).css( styleInactive );
            $layer.find( '.box-info' )
                .addClass( 'en' ).removeClass( 'ar' )
                .find( '.language-switch' ).text( 'العربية' );
        } else {
            $layer.find( '.title' ).css( styleInactive );
            $layer.find( '.title-arabic' ).css( styleAciveAr );
            $layer.find( '.box-info' )
                .addClass( 'ar' ).removeClass( 'en' )
                .find( '.language-switch' ).text( 'English' );
        }

        $layer.find( '.box-info-wrap' )
            .css( { display: 'block' } )
            .transition( { opacity: 1 }, 250, 'in');

    }


    function hideInfo() {

        // reset
        $layer.find( '.title, .title-arabic' ).css({
            'opacity': '',
            'top': '',
            'color': '',
            'background-color': '',
            'height': '',
            'line-height': '',
            'font-size': ''
        });

        $layer.find( '.box-info-wrap' )
            .transition( { opacity: 0 }, 250, 'in', function() {
                $(this).css( { display: 'none' } );
            } );

        // reset scroll
        $layer.find( '.box-info .content' ).scrollTop(0);

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
        // TODO: find another way of detenting when we are comming back from a video
        // checking locationData for this purpose is WRONG
        if ( !locationData ) {
            // do not change the 360  wiew!

            resumeSound();

            // show buttons
            $layer.find( '.btn-exit, .btn-info' ).css( { visibility: 'visible', opacity: 1 } );
            // show labels
            $labels.css( 'display', 'block' );

        } else {

            view360.load( locationData, on3DLoaded );

            initGui( locationData );

            showSpinner();

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

        //
        // update info box scroll if open
        //
        var contentHeight = $infoContent.height(),
            containerHeight = $infoContent.parent().height(),
            overflow = contentHeight - containerHeight,
            pct = ( localMouseY - 40 ) / ( containerHeight - 80 );  // margin of 40px on top and bottom

        pct = Math.min( Math.max( pct, 0 ), 1); // clamp

        if ( overflow > 0 ) {
            targetScroll = pct * overflow;
        } else {
            targetScroll = 0;
        }

        currentScroll += ( targetScroll - currentScroll ) * 0.05;

        $infoContent.css( 'transform', 'translate3d(0px,-' + currentScroll + 'px,0px)' );

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

    }

}
