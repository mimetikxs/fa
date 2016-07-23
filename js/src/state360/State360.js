FA.State360 = function( app, locationData ) {

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
        $infoContent = $layer.find( '.box-info .content' ),
        infoScrollLocked = false,

        timeoutShowInfo;



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

        if ( infoScrollLocked ) {
            return;
        }

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

        // lock info scroll
        infoScrollLocked = true;


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
            var videoId = itemOnUp;
            goToVideo( videoId );
        }

    }


    function onDocumentMouseUp( e ) {

        infoScrollLocked = false;

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

        $(document)
            .on( 'mouseup', onDocumentMouseUp );

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

        $(document)
            .off( 'mouseup', onDocumentMouseUp );

    }


    function goBack() {

        FA.Router.pushState( 'explore' );

        // view360.clear(); // clear when we go back
        //
        // destroySound();

    }


    function goToVideo( id ) {

        // // DO NOT clear the View360 so the scene is available when back from video
        //
        // // DO NOT clear the sounds, only pause
        // pauseSound();

        FA.Router.pushState( 'video', id );

    }


    function loadSound() {

        var soundData = locationData.sound;

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
            multiplay: false
        });

        ion.sound.play( soundData.ambient );

    }


    function resumeSound() {

        ion.sound.play( locationData.sound.ambient );

    }


    function showSpinner() {

        $layer.find( '.spinner-wrap' ).css( 'display', 'block' );

        // avoid aborting -- TODO: allow abort preloading
        $layer.find( '.btn-exit' ).css( {
            visibility: 'hidden',
            opacity: 0
        } );

        // hide labels
        $labels.css( 'display', 'none' );

    }


    function hideSpinner() {

        $layer.find( '.spinner-wrap' ).css( 'display', 'none' );

        $layer.find( '.btn-exit' )
            .css( 'visibility', 'visible' )
            .transition( { opacity: 1 }, 500, 'out');

        // show labels
        $labels.css( 'display', 'block' );

    }


    function on3DLoaded() {

        hideSpinner();

        // show labels
        $labels.css( 'display', 'block' );

        // show info box
        timeoutShowInfo = setTimeout( function() {
            showInfo( 'en' );
        }, 600 );

    }


    function initGui() {

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
        // var html = convertToHTMLVisibleNewline( locationData.info );
        // $layer.find( '.box-info .content' ).html( html );
        //
        // function convertToHTMLVisibleNewline(value) {
        //     if (value != null && value != "") {
        //         return value.replace(/\n/g, "<br/>");
        //     } else {
        //         return value;
        //     }
        // }

        var html = convertToHTMLParagraph( locationData.info );
        $layer.find( '.box-info .content' ).html( '<p>' + html + '</p>' );
        $layer.find( '.box-info .content p:last-child' ).before( '<span class="separator"></span>' );

        function convertToHTMLParagraph(value) {
            if (value != null && value != "") {
                return value.replace(/\n\n/g, "</p><p>");
            } else {
                return value;
            }
        }

    }


    function showInfo( lang ) {

        var styleAcive = {
                'opacity': 1,
                'top': '30px',
                //'color': '#000',
                // 'background-color': 'rgba(255,255,255,0.8)',
                'color': '#fff',
                'background-color': 'rgba(0,0,0,0.8)',
                'height': '',
                'line-height': '',
                'font-size': ''
            },
            styleAciveAr = {
                'opacity': 1,
                'top': '30px',
                // 'color': '#000',
                // 'background-color': 'rgba(255,255,255,0.8)',
                'color': '#fff',
                'background-color': 'rgba(0,0,0,0.8)',
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

        // $layer.find( '.box-info' )
        //     .css( {'background-color': 'rgba(255,255,255,0.5)' } )
        //     .transition( { 'background-color': 'rgba(0,0,0,0.8)' }, 600, 'easeInOutQuint');

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


    function updateInfoScroll() {

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

        //$infoContent.css( 'transform', 'translate3d(0px,-' + currentScroll + 'px,0px)' );
        $infoContent.parent().scrollTop( currentScroll );

    }


    //        //
    // Public //
    //        //


    // info about this state
    this.getName = function() {

        return 'STATE_LOCATION';

    }


    this.enter = function() {

        // create only once
        app.view360 = app.view360 || new FA.View360( app );

        // shortcut
        view360 = app.view360;

        // if this location is opened
        // assume the user is coming back from a video
        // and re-use the undestroyed view
        if ( app.getOpenedLoactionId() === locationData.slug ) {

            // do not change the 360  wiew!

            resumeSound();

            // show buttons and labels
            $layer.find( '.btn-exit' ).css( { visibility: 'visible', opacity: 1 } );
            $labels.css( 'display', 'block' );

        } else {

            // load a new view
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

        updateInfoScroll();

    }


    this.exit = function() {

        removeListeners();

        // hide layer
        $layer.css( {
            'opacity': 0,
            'visibility': 'hidden'
        } );
        // hide buttons
        $layer.find( '.btn-exit' ).css( {
            visibility: 'hidden',
            opacity: 0
        } );

        clearTimeout( timeoutShowInfo );

    }

}
