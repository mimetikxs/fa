FA.StateVideo2 = function( app, videoData, direction ) {

    var $layer = $( '#layer-video' ),
        $player = $layer.find( '.player' ),
        $controls = $layer.find( '.controls' ),
        $arrowLeft = $layer.find( '.btn-prev' ),
        $arrowRight = $layer.find( '.btn-next' ),
        $btnExit = $layer.find( '.btn-exit' ),

        player,

        isArrowHover,
        isReady; // testing: avoid stalled state due fast clicks on arrows

    var isTouchDevice = $('body').hasClass( 'mobile' ) || $('body').hasClass( 'tablet' );


    function close() {

        if ( app.getOpenedLoactionId() ) {
            var locationId = app.getOpenedLoactionId();
            FA.Router.pushState( 'location', locationId );
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
        // var witnessData = app.data.witnessBySlug[ videoData.witness ],
        var locationData = app.data.locationBySlug[ videoData.location ];

        // testing (several witness names)
        var witnesses = videoData.witness,
            witnessData,
            witnessNames = [],
            witnessNamesAr = [];
        for (var i = 0; i < witnesses.length; i++) {
            witnessData = app.data.witnessBySlug[ witnesses[ i ] ],
            witnessNames.push( witnessData.name );
            witnessNamesAr.push( witnessData.nameAr );
        }
        var names = witnessNames.join(', '),
            namesAr = witnessNamesAr.join(', ');

        $layer.find( '.info' )
            .find('.title span').text( videoData.title ).end()
            //.find('.witness').text( witnessData.name ).end()
            .find('.witness').text( names ).end()
            .find('.location').text( locationData.name );

        $layer.find( '.info-arabic' )
            .find('.title span').text( videoData.titleAr ).end()
            //.find('.witness').text( witnessData.nameAr ).end()
            .find('.witness').text( namesAr ).end()
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
                .css( 'visibility', '' )
                .attr( 'data-id', leftVideo.id );
        } else {
            $arrowLeft
                .css( 'visibility', 'hidden' );
        }

        // right
        if ( rightVideo ) {
            $arrowRight
                .find( '.label' ).text( rightVideo.title ).end()
                .css( 'visibility', '' )
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

        // player.on('tap', function(){
        //     console.log("tap");
        //     if (player.userActive() === true) {
        //         player.userActive(false);
        //     } else {
        //         player.userActive(true);
        //         player.pause();
        //     }
        // });

        player.on( 'userinactive', function(){
            // isUserActive = false;
            if( !player.paused()  &&  !isArrowHover ) {
                hideControls();
            }
            if( !player.paused() ) {
                $( '#layer-video .bottom-bar' ).css( 'bottom', 30 );
            }
        } );

        player.on( 'useractive', function(){
            // isUserActive = true;
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
            showActionBig();
            $( '#layer-video .bottom-bar' ).css( 'bottom', 50 );
        } );

        player.on( 'seeking', function() {
            console.log("seeking...");
            hideActionBig();
        } );

        player.on( 'stalled', function() {
            console.log("stalled");
            showSpinner();
        } );

        // detect stalled
        player.on( 'progress', function() {
            // console.log("progress");
            hideSpinner();
        } );
        player.on( 'playing', function() {
            // console.log("playing");
            hideSpinner();
        } );
        player.on( 'loadeddata', function() {
            // console.log("loadeddata");
            hideSpinner();
        } );
        player.on( 'canplay', function() {
            // console.log("canplay");
            hideSpinner();
        } );
        player.on( 'canplaythrough', function() {
            // console.log("canplaythrough");
            hideSpinner();
        } );


        player.on( 'play', function() {
            hideActionBig();
            hideSpinner();

            if ( isTouchDevice ) {
                $layer.find( '.touch-overlay' ).css( 'display', 'block' );
            }
        } );

        // testing
        // $(document).on('tap', function(){
        //     console.log("click!");
        // })
    }


    function hideSpinner() {
        $layer.find( '.spinner-wrap' ).css( 'display', 'none' );
    }


    function showSpinner() {
        $layer.find( '.spinner-wrap' ).css( 'display', 'block' );
    }


    function addListeners() {

        if ( isTouchDevice ) {
            addTouchListeners();
        } else {
            addMouseListeners();
        }

    }


    function addMouseListeners() {

        // close
        $btnExit.on( 'click', function() {
            close();
        } );

        // arrows
        $layer.find( '.btn-prev, .btn-next' )
            .on( 'click', function() {
                goToVideo( $( this ).attr( 'data-id' ) );
            } )

            .on( 'mouseenter', function() {
                $( this )
                    .find( '.arrow' ).css( { color: '#000', 'background-color': 'rgba(255,255,255,0.8)' } ).end()
                    .find( '.label' ).css( { opacity: 1 } );

                // labels could be hidden after click, show them now
                showLabels();

                isArrowHover = true;
            } )

            .on( 'mouseleave', function() {
                $( this )
                    .find( '.arrow' ).css( { color: '', 'background-color': '' } ).end()
                    .find( '.label' ).css( { opacity: 0 } );

                if ( player.userActive() !== true  &&  !player.ended() ) {
                    hideControls();
                }

                isArrowHover = false;
            } );

        // action form
        $( '#layer-video [data-action="cta"]' ).on( 'click', function() {
            FA.ActionFormOverlay.open();
            player.pause();
        } );
        // FA.ActionFormOverlay.onClose( function() {
        //     player.play();
        // } );

    }


    function addTouchListeners() {

        // close
        $btnExit.on( 'click', function() {
            close();
        } );

        // arrows
        $layer.find( '.btn-prev, .btn-next' )
            .on( 'click', function() {
                goToVideo( $( this ).attr( 'data-id' ) );
            } );

        // action form
        $( '#layer-video [data-action="cta"]' ).on( 'click', function() {
            FA.ActionFormOverlay.open();
            player.pause();
        } );

        // overlay
        $layer.find( '.touch-overlay' ).on( 'click', function() {
            $( this ).css( 'display', 'none' );
            player.pause();
        } );

    }


    function removeListeners() {

        $btnExit.off();
        $layer.find( '.btn-prev, .btn-next' ).off();

        // action form
        $( '#layer-video [data-action="cta"]' ).off();
        FA.ActionFormOverlay.onClose( null );

        // only on touch devices
        $layer.find( '.touch-overlay' ).off();

    }


    function showControls() {

        if ( $('#layer-video .controls').hasClass( 'inactive' ) ){
            $( '#layer-video .controls' ).removeClass( 'inactive' ).addClass( 'active' );
        }

    }


    function hideControls() {

        if ( $('#layer-video .controls').hasClass( 'active' ) ){
            $('#layer-video .controls').removeClass( 'active' ).addClass('inactive');
        }

    }


    function showLabels() {

        if ( isTouchDevice ) {
            return;
        }

        $controls.find( '.label' ).css( 'visibility', 'visible' );

    }


    function hideLabels() {

        // NOTE: this hides "share" on the social menu
        $controls.find('btn-prev.label, btn-next.label').css('visibility', 'hidden');

    }


    function goToVideo( id ) {

        FA.Router.pushState( 'video', id, direction );

    }


    function getVideoElementHtml( videoData ) {

        // add video element
        var isMobile = $( 'body' ).hasClass( 'mobile' ) || $('body').hasClass( 'tablet' ),
            poster = ( isMobile ) ? 'poster="' + videoData.poster + '"' : '',
            html = '';
        html += '<video id="video_1" class="video-js vjs-default-skin vjs-fill" controls preload="none" width="640" height="264"' + poster + '>';
        html += ( isMobile ) ? '' : '<source src="' + videoData.video.hd + '" type="video/mp4">';
        html += '<source src="' + videoData.video.sd + '" type="video/mp4">';
        html += '<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>';
        html += '</video>';

        return html;

    }


    function showActionBig() {

        $('#layer-video .takeAction:not(.big)')
            .transition( { opacity: 0 }, 300, 'out', function() {
                $(this).css( { visibility: 'hidden' } )
            } );

        $('#layer-video .takeAction.big')
            .css( { opacity: 0, visibility: 'visible' } )
            .transition( { opacity: 1 }, 300, 'out' );

    }


    function hideActionBig() {


        if ( $('.takeAction:not(.big)').css( 'opacity' ) < 1 ) {

            $('.takeAction:not(.big)')
                .css( { opacity: 0, visibility: 'visible' } )
                .transition( { opacity: 1 }, 300, 'out' );

        }

        $('.takeAction.big')
            .transition( { opacity: 0 }, 300, 'out', function() {
                $(this).css( { visibility: 'hidden' } )
            } );

    }


    //        //
    // Public //
    //        //



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

        // labels hidden by default
        hideLabels();

        // player is hidden until ready
        $player.css('opacity', 0);

        // add video element
        $player.html( getVideoElementHtml( videoData ) );

        // reset action buttons visibility
        $( '.takeAction:not(.big)' ).css( { visibility: 'visible', opacity: 1 } )
        $( '.takeAction.big' ).css( { visibility: 'hidden', opacity: 0 } );

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

        $layer.find( '.touch-overlay' ).css( 'display', 'none' );

    }

}
