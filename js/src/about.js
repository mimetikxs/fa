(function() {
    // highlight the relevant link in the header
    var href = location.href;
    var section = href.substr(href.lastIndexOf('/') + 1);
    section = section.split('.')[0];


    // select item in the menu
    if (section === "about") {
        $('.mainNav-menu [href*="' + section + '"]')
            .removeAttr('href')
            .css('cursor', 'default');
    } else {
        $('.subNav-menu [href*="' + section + '"]')
            .addClass( 'active' )
            .removeAttr('href')
            .css('cursor', 'default');
    }


    // language switcher
    var segments = location.pathname.split( '/' ),
        fileSegment = segments[ segments.length - 1 ],
        langSegment = segments[ segments.length - 2 ],
        targetLang = ( langSegment == 'ar' ) ? 'en' : 'ar';

        // console.log('../' + targetLang + '/' + fileSegment);

    $( '[data-section="about"] #content .language-switch' ).click( function( e ) {
        window.location.href = '../' + targetLang + '/' + fileSegment;
    } );

    // take action form overlay
    // action form
    $( '#header [data-action="cta"]' ).on( 'click', function() {
        FA.ActionFormOverlay.open();
    } );

    //
    // video box responsive
    //

    // hardcoded rationm assume same size for all videos
    var videoWidth = 1280,
        videoHeight = 720,
        videoRatio = videoHeight / videoWidth;

    function refreshVideoSize( $videoBox ) {

        // var holderWidth = $videoBox.width(),
        //     holderHeight = $videoBox.height(),
        //     holderRatio = holderWidth / holderHeight,
        //     targetW, targetH;
        //
        // if (holderRatio < videoRatio) {
        //     // fit vertical
        //     targetH = holderHeight;
        //     targetW = holderHeight * videoRatio;
        // } else {
        //     // fit horizontal
        //     targetH = holderWidth / videoRatio;
        //     targetW = holderWidth;
        // }

        // clamp
        // targetH = (targetH > videoHeight) ? videoHeight : targetH;
        // targetW = (targetW > videoWidth) ? videoWidth : targetW;

        $videoBox.css('height', $videoBox.width() * videoRatio)

    }

    $( window ).on( 'resize', function( e ) {
        $( '.video-box' ).each( function() {
            refreshVideoSize( $(this) );
        });
    } ).trigger( 'resize' );


    // init player

    if ( $('[data-sub-section="saydnaya"]').length > 0  &&  videojs ) {
        videojs(
            "video_0",
            {
                controlBar: {
                    volumeMenuButton: false,
                    fullscreenToggle: false
                }
            },
            function() {
                // Player is initialized and ready.
            }
        );
    }

})();
