FA.ActionFormOverlay = ( function() {

    var $overlay = $( '#cta-overlay' ),
        $formEnglish = $overlay.find( '.wrap:not(.ar)' ),
        $formArabic = $overlay.find( '.wrap.ar' );

    var onCloseCallback = null;


    function showOverlay() {
        // if ( app ) app.stopUpdate();

        addListeners();
        $overlay
            .css({
                'display': 'inline-block',
                'opacity': 0
            })
            .transition({
                opacity: 1
            }, 200, 'in');
    }


    function hideOverlay( onComplete ) {
        removeListeners();
        $overlay
            .transition({
                opacity: 0
            }, 200, 'in', function() {
                $overlay.css( 'display', 'none');

                // if ( app ) app.startUpdate();

                // callback
                if ( onCloseCallback ) {
                    onCloseCallback();
                }
            });
    }


    function addListeners() {
        $overlay.on( 'click', function( e ) {
            var $el = $( e.target );
            if ( $el.hasClass( 'btn-close' ) ) {
                hideOverlay()
            }
            else if ( $el.hasClass( 'language-switch' ) ) {
                switchLang();
            }
        } );
    }


    function removeListeners() {
        $overlay.off();
    }


    function switchLang() {
        if ( $overlay.hasClass( 'ar' ) ) {
            $overlay.removeClass( 'ar' ); // note we are saving language state on #cta-overlay
            $formEnglish.css( 'display', 'inline-block' );
            $formArabic.css( 'display', 'none' );
        } else {
            $overlay.addClass( 'ar' );
            $formEnglish.css( 'display', 'none' );
            $formArabic.css( 'display', 'inline-block' );
        }
    }


    //
    // public
    //


    return {

        open: showOverlay,
        close: hideOverlay,

        onClose: function( callback ) {
            onCloseCallback = callback;
        }

    }


} )();
