FA.StateVideo2 = function( app, stateName ) {

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



    function goToNext() {
        console.log(stateName);
        if (stateName === undefined) {
            app.changeState( new FA.StateHome( app ) );
        }
        else if (stateName === "cell") {
            app.changeState( new FA.StateCell( app ) );
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
        $('.btn-next').on('click', function(){
            //app.changeState( new FA.StateVideo2( app, stateName ) );
        });

        $('.btn-exit').show();

        if (stateName === "cell") {
            $('.btn-next').hide();
        } else {
            $('.btn-next').show();
        }






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
            // console.log( data );
        } );

        player.on( 'ended', function( data ) {
            goToNext()
        } );

        $( window ).resize( refreshVideoSize );

        // $('#layer-video').css({
        //     opacity : 1
        // });
        $( '#layer-video' ).css( {
            display : 'block',
            opacity : 1
        } );
        $( '#header' ).css( 'top', -50 );


        player.setVolume(1);
        player.play();

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

        $('.btn-exit').off();
        $('.btn-next').off();

    }

}
