FA.StateVideo2 = function( app, videoData, direction ) {

    var $layer = $( '#layer-video' ),
        $player = $layer.find( '.player' ),
        $controls = $layer.find( '.controls' ),
        $arrowLeft = $layer.find( '.btn-prev' ),
        $arrowRight = $layer.find( '.btn-next' ),
        $btnExit = $layer.find( '.btn-exit' ),

        player,

        isArrowHover,
        isUserActive,

        isReady; // testing: avoid stalled state due fast clicks on arrows

    var timeoutId; // testing


    function close() {

        if ( app.getOpenedLoactionId() ) {

            var locationId = app.getOpenedLoactionId();
            FA.Router.pushState( 'location', locationId );

        } else if ( $( 'body' ).hasClass( 'mobile' ) ) {

            //History.pushState( null, null, '?kind=explore&mobile=true' )

        } else {

            FA.Router.pushState( 'explore' );

        }

    }


    function init() {

        initControls();

        addListeners();

        initPlayer();

        player.play();

    }


    function initControls() {

        // set the info
        var witnessData = app.data.witnessBySlug[ videoData.witness ],
            locationData = app.data.locationBySlug[ videoData.location ];

        $layer.find( '.info' )
            .find('.title span').text( videoData.title ).end()
            .find('.witness').text( witnessData.name ).end()
            .find('.location').text( locationData.name );

        $layer.find( '.info-arabic' )
            .find('.title span').text( videoData.titleAr ).end()
            .find('.witness').text( witnessData.nameAr ).end()
            .find('.location').text( locationData.nameAr );

        // set arrows
        var videos,
            lastIndex,
            currIndex;

        // if ( app.openedLocationId ) {
        //     // navigate only videos contained in the location
        //     videos = app.data.mediasByLocation[ app.openedLocationId ];
        // } else {
        //     // navigate all the videos
        //     videos = app.data.medias;
        // }

        // navigate all the videos
        videos = app.data.medias;

        lastIndex = videos.length - 1;
        currIndex = videos.indexOf( videoData );

        var leftVideo  = ( currIndex > 0 )         ? videos[ currIndex - 1 ] : null,
            rightVideo = ( currIndex < lastIndex ) ? videos[ currIndex + 1 ] : null;

        // invert navigation
        if ( direction === 'rtl' ) {
            var temp = leftVideo;
            leftVideo = rightVideo;
            rightVideo = temp;
        }

        // left
        if ( leftVideo ) {
            $arrowLeft
                .find( '.label' ).text( leftVideo.title ).end()
                .css( 'visibility', 'visible' )
                .attr( 'data-id', leftVideo.id );
        } else {
            $arrowLeft
                .css( 'visibility', 'hidden' );
        }

        // right
        if ( rightVideo ) {
            $arrowRight
                .find( '.label' ).text( rightVideo.title ).end()
                .css( 'visibility', 'visible' )
                .attr( 'data-id', rightVideo.id );
        } else {
            $arrowRight
                .css( 'visibility', 'hidden' );
        }

    }


    function initPlayer() {

        // show player
        $player.css('opacity', 1);

        // events

        player.on( 'userinactive', function(){
            isUserActive = false;
            if( !player.paused()  &&  !isArrowHover ) {
                hideControls();
            }
            if( !player.paused() ) {
                $( '#layer-video .bottom-bar' ).css( 'bottom', 30 );
            }
        } );

        player.on( 'useractive', function(){
            isUserActive = true;
            if( !player.paused() ) {
                showControls();
            }

            $( '#layer-video .bottom-bar' ).css( 'bottom', 50 );
        } );

        player.on( 'pause', function() {
            showControls();
            $( '#layer-video .bottom-bar' ).css( 'bottom', 50 );
        } );

        player.on( 'ended', function(){
            showControls();
            $( '#layer-video .bottom-bar' ).css( 'bottom', 50 );
        } );

        // player.on( 'seeking', function() {
        //     console.log("seeking...");
        // } );

        player.on( 'stalled', function() {
            console.log("VIDEO STALLED");
            console.log("-------------");
            //showSpinner
            $layer.find( '.spinner-wrap' ).css( 'display', 'block' );
        } );

        player.on( 'playing', function() {
            // hide spinner
            $layer.find( '.spinner-wrap' ).css( 'display', 'none' );
        } );

        player.on( 'play', function() {
            // hide spinner
            $layer.find( '.spinner-wrap' ).css( 'display', 'none' );
            // showControls();
        } );

        // testing
        // $(document).on('tap', function(){
        //     console.log("click!");
        // })
    }


    function addListeners() {

        $btnExit.on( 'click', function() {
            close();
        } );

        $layer.find( '.btn-prev, .btn-next' )
            .on( 'click', function() {

                goToVideo( $( this ).attr( 'data-id' ) );

                // hide controls
                // isArrowHover = false;
                // isUserActive = false;
                // hideControls();
                var label = $(this).find('.label');
                label.css('visibility', 'hidden');
                //
                timeoutId = setTimeout( function(){
                    label.css('visibility', 'visible');
                    // showControls();
                }, 1000);
            } )
            .on( 'mouseenter', function() {
                isArrowHover = true;
            } )
            .on( 'mouseleave', function() {
                isArrowHover = false;
                if ( !isUserActive ) {
                    hideControls();
                }
            } );

        // action form
        $( '#layer-video [data-action="cta"]' ).on( 'click', function() {
            FA.ActionFormOverlay.open();
            player.pause();
        } );
        FA.ActionFormOverlay.onClose( function() {
            // player.play();
        } );

    }


    function removeListeners() {

        $btnExit.off();
        $layer.find( '.btn-prev, .btn-next' ).off();

        // action form
        $( '#layer-video [data-action="cta"]' ).off();
        FA.ActionFormOverlay.onClose( null );

    }


    function showControls() {

        if ( $('#layer-video .controls').hasClass( 'inactive' ) ){
            $( '#layer-video .controls' ).removeClass( 'inactive' ).addClass( 'active' );
        }
        // $controls.css( 'pointer-events', 'auto' );

    }


    function hideControls() {

        if ( $('#layer-video .controls').hasClass( 'active' ) ){
            $('#layer-video .controls').removeClass( 'active' ).addClass('inactive');
        }
        // $controls.css( 'pointer-events', 'none' );

    }


    function goToVideo( id ) {

        FA.Router.pushState( 'video', id, direction );

    }


    function getVideoElementHtml( videoData ) {

        // add video element
        var isMobile = false,                // TODO: actual mobile check (read body data attr)
            poster = ( isMobile ) ? '' : '', // TODO: add poster on mobile devices?
            html = '';
        html += '<video id="video_1" class="video-js vjs-default-skin vjs-fill" controls preload="none" width="640" height="264" poster="' + poster + '">';
        html += ( isMobile ) ? '' : '<source src="' + videoData.video.hd + '" type="video/mp4">'; // do not add hd source if this is a mobile device
        html += '<source src="' + videoData.video.sd + '" type="video/mp4">';
        html += '<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>';
        html += '</video>';

        return html;

    }


    //        //
    // Public //
    //        //


     // info about this state
     this.getName = function() {

         return 'STATE_VIDEO';

     }


    this.enter = function() {

        // prepare dom elements
        $( '#header' ).css( 'top', 0 );

        // show layer
        $layer.css( {
            display : 'block',
            opacity : 1
        } );

        // show controls
        $controls.removeClass('inactive').addClass('active');

        // player is hidden until ready
        $player.css('opacity', 0);

        // add video element
        $player.html( getVideoElementHtml( videoData ) );

        // init videojs
        player = videojs(
            "video_1",
            {
                controlBar: {
                    volumeMenuButton: false,
                    fullscreenToggle: false
                }
            },
            function() {
                // Player is initialized and ready.
                init();
            }
        );

    }


    this.update = function() {

        // do nothing

    }


    this.exit = function() {

        removeListeners();

        player.dispose();

        $layer.css( {
            opacity: 0,
            display: 'none'
        } );

    }

}
