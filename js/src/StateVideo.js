FA.StateVideo = function( app ) {

    var videoWidth,
        videoHeight,
        videoRatio;

    var iframeEl;
    var player;


    function refreshVideoSize() {
        var holderWidth = $(window).width(),
            holderHeight = $(window).height(),
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

    /*******************
     * Public
     ******************/


    this.enter = function() {


        $('.btn-exit').hide();
        $('.btn-next').hide();

        // var options = {
        //     //id : 114154572, //84898863, //,
        //     url: 'https://player.vimeo.com/video/114154572?background=1',
        //     loop : false,
        //     byline : false,
        //     portrait : false,
        //     title : false
        // };
        //
        // player = new Vimeo.Player( 'layer-video', options );

        $('#layer-video .player').html(
            '<iframe src="https://player.vimeo.com/video/114154572?background=1&loop=0&" width="500" height="281" frameborder="0">' +
            '</iframe>'
        );

        iframeEl = $('#layer-video iframe');
        player = new Vimeo.Player( iframeEl[0] );

        player.on( 'play', function( data ) {
            iframeEl = $('iframe');
            videoWidth = 640; //1280;
            videoHeight = 360; //720;
            videoRatio = videoWidth / videoHeight;
            refreshVideoSize();
        } );

        player.on( 'timeupdate', function( data ) {
            console.log( data );
        } );

        player.on( 'ended', function( data ) {
            app.changeState( new FA.StateHome( app ) );
        } );

        // player.on( 'loaded', function( data ) {
        //     //player.play();
        //     console.log( 'video loaded!' );
        //     console.log( data );
        // });

        player.enableTextTrack('en').then(function(track) {
            // track.language = the iso code for the language
            // track.kind = 'captions' or 'subtitles'
            // track.label = the human-readable label
        }).catch(function(error) {
            switch (error.name) {
                case 'InvalidTrackLanguageError':
                    // no track was available with the specified language
                    break;
                case 'InvalidTrackError':
                    // no track was available with the specified language and kind
                    break;
                default:
                    // some other error occurred
                    break;
            }
        });

        // player.getVideoWidth().then( function( width ) {
        //     videoWidth = width;
        // }).catch(function( error ) {
        //     console.log( error );
        // });
        //
        // player.getVideoHeight().then( function( height ) {
        //     videoHeight = height;
        // }).catch(function( error ) {
        //     console.log( error );
        // });

        $( window ).resize( refreshVideoSize );

        $('#layer-video').css({
            opacity : 1
        });

        player.setVolume(1);
        player.play();
        player.stop();

    }


    this.update = function() {


    }


    this.exit = function() {

        $( '#layer-video' ).fadeOut( 1000 );

        $( window ).off( 'resize' );

        player.unload().then(function() {
            // the video was unloaded
            console.log('video unloaded');
        }).catch(function(error) {
            console.log(error);
        });

    }

}
