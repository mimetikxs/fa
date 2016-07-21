FA.StateExploreMobile = function( app ) {

    var $container,
        $menuType,
        $btnArabic,

        $locationMenu,
        $witnessMenu,
        $currentMenu,

        navMode = null;


    function loadData( onComplete ) {

        var url;
        if ( location.hostname === 'localhost' ) {
            url = 'http://localhost:8888/saydnaya/data/data.json';
        } else {
            url = 'data/data.json';
        }

        $.ajax({
            dataType: 'json',
            url : url,
            success : function( result ) {
                app.data = new FA.Data( result );
                onComplete();
            },
            error : function( jqXHR, status, errorThrown ) {
                console.log( status, errorThrown );
            }
        });

    }


    function loadLayout( onComplete ) {

        $.ajax({
            dataType: 'html',
            url : "exploreMobile.html",
            success : function( result ) {
                // replace the dom
                $('#footer-desktop, #layer-intro').remove();
                $('#content').html( result );
                $('#layer-video').css( {
                    opacity: 0,
                    display: 'none'
                } );
                onComplete();
            },
            error : function( jqXHR, status, errorThrown ) {
                console.log( status, errorThrown );
            }
        });

    }


    function buildNavigation() {

        $container = $( '#explore .navigation .container' );
        $menuType = $( '#explore .navigation .menu-type' );
        $btnArabic = $( '#explore .navigation .ar-watch-videos .folder' );

        var data = app.data;

        $locationMenu = getLocationMenu( app.data );
        $witnessMenu = getWitnessMenu( app.data );

        addListeners();

        setNavMode( 'location' );

    }


    function getLocationMenu( data ) {

        var html = '',
            locations = data.locations,
            location,
            medias,
            $menu = $('<ul class="menu-location"></ul>');

        for ( var i = 0; i < locations.length; i++ ) {
            location = locations[ i ];
            medias = data.mediasByLocation[ location.slug ];
            html +=
            '<li data-location="' + location.slug + '">' +
                '<div class="folder">' + '<span class="icon"></span><span>' + location.name + '</span></div>' +
                '<ul>' +
                    getMediasHtml( medias ) +
                '</ul>' +
            '</li>';
        }

        $menu.append( html );

        return $menu;

        function getMediasHtml( medias ) {
            var html = '',
                media;
            for ( var i = 0; i < medias.length; i++ ) {
                media = medias[ i ];
                html += '<li class="media" data-id="' + media.id + '">' + media.title + '</li>';
            }
            return html;
        }

    }


    function getWitnessMenu( data ) {

        var html = '',
            witnesses = data.witnesses,
            witness,
            medias,
            $menu = $('<ul class="menu-witness"></ul>');

        for ( var i = 0; i < witnesses.length; i++ ) {
            witness = witnesses[ i ];
            medias = data.mediasByWitness[ witness.slug ];
            html +=
            '<li data-witness="' + witness.slug + '">' +
                '<div class="folder">' + '<span class="icon"></span><span>' + witness.name + '</span></div>' +
                '<ul>' +
                    getMediasHtml( medias ) +
                '</ul>' +
            '</li>';
        }

        $menu.append( html );

        return $menu;

        function getMediasHtml( medias ) {
            var html = '',
                media;
            for ( var i = 0; i < medias.length; i++ ) {
                media = medias[ i ];
                html += '<li class="media" data-id="' + media.id + '" data-location="' + media.location + '">' + media.title + '</li>';
            }
            return html;
        }

    }


    function setNavMode( mode ) {

        if ( navMode === mode ) {
            return;
        }

        navMode = mode;

        var $menu;

        if ( mode === 'location' ) {
            $menu = $locationMenu;
        } else if ( mode === 'witness' ) {
            $menu = $witnessMenu;
        }

        // swap divs
        if ( $currentMenu ) $currentMenu.detach();
        $currentMenu = $menu;
        $currentMenu.appendTo( $container );

        // update menu dom
        $menuType
            .find( '.selected' ).removeClass( 'selected' ).end()
            .find( '[data-type="' + mode + '"]' ).addClass( 'selected' );

        // reset highlighted folders
        $container.find( '.selected' )
            .removeClass( 'selected' )
            .find( 'ul' ).css( 'height', 0 );

        // reset model active location
        // app.setActiveLocation( null );

    }


    function goToVideo( mediaData ) {

        app.changeState( new FA.StateVideo2( app, '', mediaData ) );

    }


    function addListeners() {

        // type switcher
        $menuType.on( 'click', onTypeClick );

        $container
            .on( 'click', onClick );

        // go to first video for arabic users
        $btnArabic.on( 'click', function() {
            var mediaData = app.data.medias[ 0 ]; // media by index (0 = first)
            app.changeState( new FA.StateVideo2( app, '', mediaData ) );
        } )

    }


    function removeListeners() {

        $container
            .off( 'click', onClick );

    }


    function onTypeClick( e ) {

        var $target = $( e.target ),
            navMode = $target.data('type');

        if ( !$target.is( 'span' ) ){
            return;
        }

        navMode = $target.data('type');

        setNavMode( navMode )

    }


    function onClick( e ) {

        var $target = $( e.target );

        if ( $target.hasClass( 'folder' ) || $target.parent().hasClass( 'folder' ) ) {

            // if we clicked the inner span, we need to point to the right element
            $target = ( $target.parent().hasClass( 'folder' ) ) ? $target.parent() : $target;

            // if already selected
            if ( $target.parent().hasClass( 'selected' ) ) {
                // deselect current
                $currentMenu.find( '.selected' )
                    .removeClass( 'selected' )
                    .find( 'ul' ).css( 'height', 0 );

                app.setActiveLocation( null );

            } else {

                // deselect current
                $currentMenu.find( '.selected' )
                    .removeClass( 'selected' )
                    .find( 'ul' ).css( 'height', 0 );

                // select new
                var height = $target.next().prop('scrollHeight');
                $target
                    .next().css( 'height', height ).end()
                    .parent().addClass( 'selected' );

                // change active location
                if ( $currentMenu.hasClass( 'menu-location' ) ) {
                    var slug = $target.parent().data( 'location' );

                    app.setActiveLocation( slug );
                }
            }

        } else if ( $target.hasClass( 'media' ) ) {

            var id = $target.data( 'id' ),
                mediaData = app.data.mediaById[ id ];

            goToVideo( mediaData );

        }

    }






    this.enter = function() {

        loadLayout( function() {
            loadData( buildNavigation );
        } );

    }


    this.update = function() {

    }


    this.exit = function() {

    }

}
