(function() {
    //
    // sync js with media queries
    // to resize top bar
    //
    var $headerMainNav = $('#header .mainNav-menu'),

        wasNarrow = false;



    function isNarrow() {

        return $headerMainNav.css( "display" ) == "none";

    }

    //
    // sync media queries with js
    //
    $( window ).on( 'resize', function( e ) {

        if ( isNarrow() && !wasNarrow ) {
            showStackedTopBar();
            wasNarrow = true;
        }
        else if ( !isNarrow() && wasNarrow  ) {
            showDefaultTopBar();
            wasNarrow = false;
        }

    } ).trigger( 'resize' );


    function showStackedTopBar() {

        // add stacked icon
        $( '#header' ).append(
            '<div class="btn-stacked-menu"></div>'
        );

        $( '.btn-stacked-menu' ).on( 'click', function() {
            var $btn = $(this),
                isActive = $btn.hasClass( 'active' );

            if ( isActive ) {
                $btn.removeClass( 'active' );
                hideStakedMenu();
            } else {
                $btn.addClass( 'active' );
                showStakedMenu();
            }
        } );

    }


    function showDefaultTopBar() {

        // remove stacked icon
        // this removes callbacks
        $( '#header .btn-stacked-menu' ).remove();

    }


    function showStakedMenu() {

        if ( getCurrentFile() == "" || getCurrentFile == "saydnaya.php" ) {
            $( '#header' ).append( getHomeStackedMenu() );
        } else {
            var lang = getCurrentLanguage();
            $( '#header' ).append( get_menuStaked_html( lang ) );
        }

        $( '#header' ).css( { 'z-index': 10002 } );

        highlightCurrentItem();

    }


    function hideStakedMenu() {

        $( '#header .staked-nav' ).remove();

        $( '#header' ).css( { 'z-index': '' } );

    }


    function highlightCurrentItem() {

        var section = getCurrentFile();

        console.log(section);

        $('.staked-nav [href*="' + section + '"]')
            .addClass( 'active' )
            .removeAttr('href')
            .css('cursor', 'default');

    }


    function getCurrentLanguage() {

        var segments = location.pathname.split( '/' );
        return segments[ segments.length - 2 ];

    }


    function getCurrentFile() {

        var segments = location.pathname.split( '/' );
        return segments[ segments.length - 1 ];

    }


    function get_menuStaked_html( lang ) {

        // var ext;
        // if ( location.hostname === 'localhost' ) {
        //     ext = 'php';
        // } else {
        //     ext = 'html';
        // }

        var ext = 'html';

        return [
            '<div class="staked-nav">',
                '<a class="item" href="../">',
                    '<span>Explore</span><span>استكشف</span>',
                '</a>',
                '<a class="item" href="../' + lang + '/about.' + ext + '">',
                    '<span>About</span><span>اعرف أكثر</span>',
                '</a>',
                '<a class="item" href="../' + lang + '/saydnaya.' + ext + '">',
                    '<span>Saydnaya</span><span>صيدنايا</span>',
                '</a>',
                '<a class="item" href="../' + lang + '/detention-in-syria.' + ext + '">',
                    '<span>Detention in Syria</span><span>الاحتجاز في سوريا</span>',
                '</a>',
                '<a class="item" href="../' + lang + '/methodology.' + ext + '">',
                    '<span>Methodology</span><span>منهجية البحث</span>',
                '</a>',
            '</div>'
        ].join('');

    }


    function getHomeStackedMenu() {

        // var ext;
        // if ( location.hostname === 'localhost' ) {
        //     ext = 'php';
        // } else {
        //     ext = 'html';
        // }

        var ext = 'html';

        return [
            '<div class="staked-nav">',
                '<a class="item active" href="./">',
                    '<span>Explore</span><span>استكشف</span>',
                '</a>',
                '<a class="item" href="en/about.' + ext + '">',
                    '<span>About</span><span>اعرف أكثر</span>',
                '</a>',
                '<a class="item" href="en/saydnaya.' + ext + '">',
                    '<span>Saydnaya</span><span>صيدنايا</span>',
                '</a>',
                '<a class="item" href="en/detention-in-syria.' + ext + '">',
                    '<span>Detention in Syria</span><span>الاحتجاز في سوريا</span>',
                '</a>',
                '<a class="item" href="en/methodology.' + ext + '">',
                    '<span>Methodology</span><span>منهجية البحث</span>',
                '</a>',
            '</div>'
        ].join('');

    }
})();
