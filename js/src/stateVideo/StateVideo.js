//
// app:          [FA.App] A reference to the app object.
// fromLocation: [String] The id/slug of the location the video was launched. This defines the behaviour of the arrows.
//                        An empty string or null will allow navigation through all the medias.
//                        Pass the id of a location to navigate only through the videos associated.
// data          [Object] The data to feed the video.

// FA.StateVideo2 = function( app, fromLocation, videoId ) {
FA.StateVideo2 = function( app, videoId ) {

    var $layer = $( '#layer-video' ),
        $player = $layer.find( '.player' ),
        $controls = $layer.find( '.controls' ),
        $arrowPrev = $layer.find( '.btn-prev' ),
        $arrowNext = $layer.find( '.btn-next' ),
        $btnExit = $layer.find( '.btn-exit' ),

        player,

        videoData,

        isArrowHover,
        isUserActive,

        isReady; // testing: avoid stalled state due fast clicks on arrows

    var timeoutId; // testing


    function close() {

        var prevState = ( app.getPrevState() ) ? app.getPrevState().getStateData() : null;

        if ( prevState.kind === 'location' ) {
            History.back();
        } else {
            if ( $( 'body' ).hasClass( 'mobile' ) ) {
                //app.changeState( new FA.StateExploreMobile( app ) );
                //History.pushState( null, null, '?explore=false' )
            } else {
                History.pushState( null, null, '?kind=explore' )
            }
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
            currIndex,
            prevState = ( app.getPrevState() ) ? app.getPrevState().getStateData() : null;



        if ( prevState  &&  prevState.kind === 'location'  &&  prevState.id !== undefined ) {
            // navigate only videos contained in the location
            videos = app.data.mediasByLocation[ prevState.id ];
        } else {
            // navigate all the videos
            videos = app.data.medias;
        }

        lastIndex = videos.length - 1;
        currIndex = videos.indexOf( videoData );

        // prev
        if ( currIndex > 0 ) {
            var prevVideo = videos[ currIndex - 1 ];
            $arrowPrev
                .find( '.label' ).text( prevVideo.title ).end()
                .css( 'visibility', 'visible' )
                .attr( 'data-id', prevVideo.id );
        } else {
            $arrowPrev
                .css( 'visibility', 'hidden' );
        }

        // next
        if ( currIndex < lastIndex ) {
            var nextVideo = videos[ currIndex + 1 ];
            $arrowNext
                .find( '.label' ).text( nextVideo.title ).end()
                .css( 'visibility', 'visible' )
                .attr( 'data-id', nextVideo.id );
        } else {
            $arrowNext
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

    }


    function removeListeners() {

        $btnExit.off();
        $layer.find( '.btn-prev, .btn-next' ).off();

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

        videoData = app.data.mediaById[ id ]

        var isMobile = false, // TODO
            sources = [];

        initControls(  );

        if ( !isMobile ) {
            sources.push( { type: "video/mp4", src: videoData.video.hd } )
        } else {
            sources.push( { type: "video/mp4", src: videoData.video.sd } )
        }

        // change sources
        player.src( sources );
        player.play();

    }


    /*******************
     * Public
     ******************/


     // info about this state
     this.getStateData = function() {

         return {
             kind: 'video',
             id: videoId
         }

     }


    this.enter = function() {

        // get the data
        videoData = app.data.mediaById[ videoId ];

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
        var isMobile = false,                // TODO: actual mobile check (read body data attr)
            poster = ( isMobile ) ? '' : '', // TODO: add poster on mobile devices
            html = '';
        html += '<video id="video_1" class="video-js vjs-default-skin vjs-fill" controls preload="none" width="640" height="264" poster="' + poster + '">';
        html += ( isMobile ) ? '' : '<source src="' + videoData.video.hd + '" type="video/mp4">'; // do not add hd source if this is a mobile device
        html += '<source src="' + videoData.video.sd + '" type="video/mp4">';
        html += '<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>';
        html += '</video>';
        $player.html( html );

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
