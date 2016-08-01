FA.MenuView = function( app ) {

    var $container = $( '#layer-prison .navigation .container' ),
        $menuType = $( '#layer-prison .navigation .menu-type' ),
        $btnArabic = $( '#layer-prison .navigation .ar-watch-videos .folder' ),
        $locationMenu,
        $witnessMenu,
        $currentMenu,

        // auto scrolling
        localMouseY = 0,
        targetScroll = 0,
        currentScroll = 0,

        // wait a 500msecs before deselecting
        timeoutId = null,
        timeoutDuration = 500,

        isMouseDown = false,

        navMode = null;


    var isTouchDevice = $('body').hasClass( 'mobile' ) || $('body').hasClass( 'tablet' );


    init();


    function init() {

        build();

        onWindowResize();

        addListeners();

        setNavMode( 'location' );

    }


    function build() {

        var data = app.data;

        $locationMenu = getLocationMenu( app.data );
        $witnessMenu = getWitnessMenu( app.data );

        if ( isTouchDevice ) {
            $container.css( 'overflow-y', 'auto' );
        }

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

        // if ( $menu === $currentMenu )
        //     return;

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
        app.setActiveLocation( null );

        // only on desktop
        var isTouchDevice = $('body').hasClass( 'mobile' ) || $('body').hasClass( 'tablet' );
        if ( !isTouchDevice ) {
            if ( mode === 'location' ) {
                $container
                    .off( 'mouseenter', '.media', onMouseenterMedia )
                    .off( 'mouseleave', '.media', onMouseleaveMedia )
                    .on( 'mouseenter', '.folder', onMouseenterFolder )
                    .on( 'mouseleave', '.folder', onMouseleaveFolder );
            } else if ( mode === 'witness' ) {
                $container
                    .off( 'mouseenter', '.folder', onMouseenterFolder )
                    .off( 'mouseleave', '.folder', onMouseleaveFolder )
                    .on( 'mouseenter', '.media', onMouseenterMedia )
                    .on( 'mouseleave', '.media', onMouseleaveMedia );
            }
        }

    }


    function goToVideo( id, direction ) {

        FA.Router.pushState( 'video', id, direction );

    }


    function goToLocation( id ) {

        FA.Router.pushState( 'location', id );

    }


    function deselectCurrentFolder() {

        $currentMenu.find( '.selected' )
            .removeClass( 'selected' )
            .find( 'ul' ).css( 'height', 0 );

    }


    function selectFolder( $folder ) {

        var height = $folder.next().prop( 'scrollHeight' );
        $folder
            .next().css( 'height', height ).end()
            .parent().addClass( 'selected' );

    }


    function addListeners() {

        if ( isTouchDevice ) {
            addTouchListeners();
        } else {
            addMouseListeners();
        }

    }


    function addMouseListeners() {

        $(window)
            .on( 'resize', onWindowResize )
            .on( 'mousedown', onMouseDown )
            .on( 'mouseup', onMouseUp );

        // type switcher
        $menuType.on( 'click', onTypeClick );

        // items
        $container
            .on( 'click', onClick )
            .on( 'mousemove', onMouseMove );

        // go to first video for arabic users
        $btnArabic.on( 'click', function() {
            var mediaData = app.data.medias[ 0 ]; // media by index (0 = first)

            goToVideo( mediaData.id, 'rtl' );
        } )

        // app listeners
        app.on( 'overLocationChange', onModelOverLocationChange );
        app.on( 'activeLocationChange', onModelActiveLocationChange );

    }


    function addTouchListeners() {

        $(window)
            .on( 'resize', onWindowResize );

        // type switcher
        $menuType.on( 'click', onTypeClick );

        // items
        $container
            .on( 'click', onClick );

        // go to first video for arabic users
        $btnArabic.on( 'click', function() {
            var mediaData = app.data.medias[ 0 ]; // media by index (0 = first)

            goToVideo( mediaData.id, 'rtl' );
        } );

        app.on( 'activeLocationChange', onModelActiveLocationChange );

    }


    function removeListeners() {

        $(window)
            .off( 'resize', onWindowResize )
            .off( 'mousedown', onMouseDown )
            .off( 'mouseup', onMouseUp );

        $container
            .off( 'click', onClick )
            .off( 'mousemove', onMouseMove )
            .off( 'mouseenter', '.folder', onMouseenterFolder )
            .off( 'mouseleave', '.folder', onMouseleaveFolder )
            .off( 'mouseenter', '.media', onMouseenterMedia )
            .off( 'mouseleave', '.media', onMouseleaveMedia );

        app.remove( 'overLocationChange', onModelOverLocationChange );
        app.remove( 'activeLocationChange', onModelActiveLocationChange );

    }


    function onModelOverLocationChange( e ) {

        var prev = e.prev,
            current = e.location,
            el;

        el = $('.menu-location [data-location="' + current + '"]');
        el.addClass( 'over' );

        el = $('.menu-location [data-location="' + prev + '"]');
        el.removeClass( 'over' );

    }


    function onModelActiveLocationChange( e ) {

        if ( !$currentMenu.hasClass( 'menu-location' ) ) {
            return;
        }

        deselectCurrentFolder();

        var location = e.current;

        if ( location ) {
            var el = $('.menu-location [data-location="' + location + '"]');
            selectFolder( el.find('.folder') );
        }

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

        var $target = $( e.target ),
            targetIsFolder = $target.hasClass( 'folder' ) || $target.parent().hasClass( 'folder' );

        if ( targetIsFolder ) {

            // if we clicked the inner span, we need to point to the right element
            $target = ( $target.parent().hasClass( 'folder' ) ) ? $target.parent() : $target;

            // if already selected
            if ( $target.parent().hasClass( 'selected' ) ) {

                if ( $currentMenu.hasClass( 'menu-location' ) ) {
                    app.setActiveLocation( null );
                } else {
                    deselectCurrentFolder();
                }

            } else {

                // change active location
                if ( $currentMenu.hasClass( 'menu-location' ) ) {
                    var slug = $target.parent().data( 'location' );
                    app.setActiveLocation( slug );
                } else {
                    deselectCurrentFolder();
                    selectFolder( $target );
                }
            }

            // [ for empty folders ]
            // jump into 360 view
            // if we are in location mode and this folder is empty
            var numChildren = $target.parent().find('li').length;
            if ( navMode === 'location'  &&  numChildren === 0 ) {
                var slug = $target.parent().data( 'location' );

                goToLocation( slug );

            }

        } else if ( $target.hasClass( 'media' ) ) {

            goToVideo( $target.data( 'id' ) );

        }

    }


    function onMouseMove( e ) {

        if ( isMouseDown )
            return;

        localMouseY = e.pageY - $container.offset().top;

    }


    function onMouseenterFolder( e ) {

        if ( isMouseDown )
            return;

        clearTimeout( timeoutId );

        var locationSlug = $( e.target ).parent().data( 'location' );

        app.setOverLocation( locationSlug );

    }


    function onMouseleaveFolder( e ) {

        if ( isMouseDown )
            return;

        clearTimeout( timeoutId );
        timeoutId = setTimeout( function(){

            app.setOverLocation( null );

        }, timeoutDuration );

    }


    function onMouseenterMedia( e ) {

        if ( isMouseDown )
            return;

        clearTimeout( timeoutId );

        var locationSlug = $( e.target ).data( 'location' );

        app.setActiveLocation( locationSlug );

    }


    function onMouseleaveMedia( e ) {

        clearTimeout( timeoutId );
        timeoutId = setTimeout( function(){

            app.setActiveLocation( null );

        }, timeoutDuration );

    }


    function onMouseDown( e ) {

        isMouseDown = true;

    }


    function onMouseUp( e ) {

        isMouseDown = false;

    }


    function onWindowResize() {

        var windowHeight = $(window).innerHeight(),
            startY = $container.offset().top,
            height = windowHeight - startY - 110;

        $container.css( 'height', height );

    }


    //        //
    // Public //
    //        //


    this.update = function() {

        var menuHeight = $currentMenu.height(),
            containerHeight = $container.height(),
            overflow = menuHeight - containerHeight,
            pct = ( localMouseY - 40 ) / ( containerHeight - 80 );  // margin of 40px on top and bottom

        pct = Math.min( Math.max( pct, 0 ), 1); // clamp

        if ( overflow > 0 ) {
            targetScroll = pct * overflow;
        } else {
            targetScroll = 0;
        }

        currentScroll += ( targetScroll - currentScroll ) * 0.08;

        $currentMenu.css( 'transform', 'translate3d(0px,-' + currentScroll + 'px,0px)' );

    }


    this.show = function() {

        $('#layer-prison .navigation')
            .css( {
                'display': 'block',
                'z-index': ''
            } )
            .transition( { 'opacity': 1 }, 400, 'in' );

        // TODO: enable events on show
        // add listeners
        // addListeners();
        //
        // if ( navMode === 'location' ) {
        //     $container
        //         .on( 'mouseenter', '.folder', onMouseenterFolder )
        //         .on( 'mouseleave', '.folder', onMouseleaveFolder );
        // } else if ( navMode === 'witness' ) {
        //     $container
        //         .on( 'mouseenter', '.media', onMouseenterMedia )
        //         .on( 'mouseleave', '.media', onMouseleaveMedia );
        // }

    }


    this.hide = function() {

        $('#layer-prison .navigation')
            .css( {
                'z-index': 0
            } )
            .transition( { 'opacity': 1 }, 400, 'in', function() {
                $(this).css( { 'display': 'none' } );
            } );

        localMouseY = 0;

        // TODO: disable event on hide
        // removeListeners();

    }


    this.destroy = function() {

        removeListeners();

        $container.empty();

    }

}
