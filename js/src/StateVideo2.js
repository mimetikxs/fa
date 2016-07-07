FA.StateVideo2 = function( app, stateName, data ) {

    var videoWidth,
        videoHeight,
        videoRatio;

    var iframeEl;
    var player;


    var intervalId = null,
        idleSecondsCounter = 0,
        IDLE_TIMEOUT = 2,
        controlsHidden = false;


    function refreshVideoSize() {

        // var holderWidth = $(window).width(),
        //     holderHeight = $(window).height(),
        var holderWidth = $('#layer-video').width(),
            holderHeight = $('#layer-video').height() + 100,
            holderRatio = holderWidth / holderHeight,
            targetW, targetH;

        if (holderRatio < videoRatio) {
            // fit vertical
            targetH = holderHeight;
            targetW = holderHeight * videoRatio;
        } else {
            // fit horizontal
            targetH = holderWidth / videoRatio;
            targetW = holderWidth;
        }

        // clamp
        // targetH = (targetH > videoHeight) ? videoHeight : targetH;
        // targetW = (targetW > videoWidth) ? videoWidth : targetW;

        iframeEl.css( {
            'position'    : 'absolute',
            'height'      : targetH,
            'width'       : targetW,
            'top'         : '50%',
            'left'        : '50%',
            'margin-top'  : -targetH / 2,
            'margin-left' : -targetW / 2
        } );

    }


    function goToNext() {

        player.unload().then(function() {
            // the video was unloaded
            console.log('video unloaded');

            if (stateName === "cell") {
                app.changeState( new FA.StateCell( app ) );
            } else {
                app.changeState( new FA.StateExplore( app ) );
            }
        }).catch(function(error) {
            console.log(error);
        });

    }


    function onMouseMove( e ){

        idleSecondsCounter = 0;

        if ( controlsHidden ) {
            $('#layer-video .controls').css( 'opacity', 1 );
            controlsHidden = false;
        }

    }


    function checkIdleTime() {
        console.log( IDLE_TIMEOUT - idleSecondsCounter );

        idleSecondsCounter++;

        if ( idleSecondsCounter >= IDLE_TIMEOUT ) {

            $('#layer-video .controls').css( 'opacity', 0 );

            controlsHidden = true;

        }

    }


    /*******************
     * Public
     ******************/


    this.enter = function() {

        // events
        $('.btn-exit').on('click', function(){
            goToNext();
        });

        // TODO: fix, not working at the moment
        // $('.btn-next').on('click', function(){
        //     //app.changeState( new FA.StateVideo2( app, stateName ) );
        // });


        $('#layer-video .player').html(
            // '<iframe src="https://player.vimeo.com/video/114154572?background=1&loop=0&" width="500" height="281" frameborder="0">' +
            '<iframe src="https://player.vimeo.com/video/57939677" frameborder="0"></iframe>'
        );

        $( '#header' ).css( 'top', 0 );

        $( '#layer-video' ).css( {
            display : 'block',
            opacity : 1
        } );
        //
        // return;

        $('#layer-video .player').css('opacity', 0); // player is hidden until ready

        iframeEl = $('#layer-video iframe');
        player = new Vimeo.Player( iframeEl[0] );

        player.on( 'play', function( data ) {
            iframeEl = $('iframe');
            videoWidth = 1920; //1280;
            videoHeight = 1080; //720;
            videoRatio = videoWidth / videoHeight;
            refreshVideoSize();
            $('#layer-video .player').css('opacity', 1); // show player
        } );

        player.on( 'timeupdate', function( data ) {
            // console.log( data );
        } );

        player.on( 'ended', function( data ) {
            goToNext()
        } );



        $( window ).on( 'resize', refreshVideoSize );

        $(document).on( 'mousemove', onMouseMove );


        // start idle checker
        intervalId = setInterval( checkIdleTime, 1000 );




        // testing remove text Navigation ////////////////////////

        //TODO:: build video player interface

        $('#layer-video .info .title').text( data.title );

        //////////////////////////////////////////////////////


        player.setVolume(1);
        player.play();

    }


    this.update = function() {


    }


    this.exit = function() {

        $( '#layer-video' ).fadeOut( 0 );

        $( window ).off( 'resize', refreshVideoSize );

        $(document).off( 'mousemove', onMouseMove );

        clearInterval( intervalId );

        $('.btn-exit').off();
        $('.btn-next').off();

    }

}
