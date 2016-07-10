FA.StateVideo2 = function( app, stateName, data ) {

    var name = 'STATE_VIDEO';

    var $layer = $( '#layer-video' ),
        $player = $layer.find( '.player' ),
        $controls = $layer.find( '.controls' ),
        $btnExit = $layer.find( '.btn-exit' ),
        player;



    function goToNext() {

        if ( stateName === "cell" ) {
            app.changeState( new FA.State360( app ) );
        } else {
            app.changeState( new FA.StateExplore( app ) );
        }

    }


    function init() {

        // set the names
        $layer.find( '.info .title').text( data.title );
        //$layer.find( '.info-arabic .title').text( data.titleArabic );

        // show player
        $player.css('opacity', 1);

        // events
        $btnExit.on('click', function(){
            goToNext();
        });

        player.on( 'userinactive', function(){
            $('#layer-video .controls').removeClass('active').addClass('inactive');
        } );

        player.on( 'useractive', function(){
            $('#layer-video .controls').removeClass('inactive').addClass('active');
        } );

        player.on( 'ended', function(){
            goToNext();
        } );

        player.play();

    }


    /*******************
     * Public
     ******************/


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

        // add video tag
        $player.html(
            '<video id="example_video_1" class="video-js vjs-default-skin vjs-fill" controls preload="none" width="640" height="264" poster="">' +
            //   '<source src="https://player.vimeo.com/external/173798367.hd.mp4?s=2a49d1c55e3c72aa0efce952686db446589423d1&profile_id=119" type="video/mp4">' +
              '<source src="https://player.vimeo.com/external/173798367.sd.mp4?s=66afc4bfc32a75138f1dd92c347640a15b59a878&profile_id=165" type="video/mp4">' +
              '<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>' +
            '</video>'
        );

        // init videojs
        player = videojs(
            "example_video_1",
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

        $btnExit.off();

        player.dispose();

        $layer.css( {
            opacity: 0,
            display: 'none'
        } );

    }

}
