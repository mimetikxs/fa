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

})();
