FA.LabelsView = function( app ) {

    var $dom,

        sceneWidth,
        sceneHeight,
        // isHidden = true, // opacity is 0 initially

        scope = this;

    var mainOpacity = 0;


    init();


    function init() {

        $dom = $('#layer-prison .labels');

        for ( var i = 0; i < app.rooms.length; i++ ) {
            $dom.append( app.rooms[ i ].$label );
        }

        addListeners();

    }


    function addListeners() {

        $dom
            .on( 'mouseenter', '.tag', onMouseenterLabel  )
            .on( 'mouseleave', '.tag', onMouseleaveLabel  )
            .on( 'mouseup', onMouseUp  )
            .on( 'mousedown', onMouseDown  );

    }


    function removeListeners() {

        $dom
            .off( 'mouseenter', '.tag', onMouseenterLabel  )
            .off( 'mouseleave', '.tag', onMouseleaveLabel  )
            .off( 'mouseup', onMouseUp  )
            .off( 'mousedown', onMouseDown  );

    }


    function onMouseenterLabel( e ) {

        var $label = $( e.target ).parent(),
            locationSlug = $label.data( 'id' );

        app.setOverLocation( locationSlug );

    }


    function onMouseleaveLabel( e ) {

        app.setOverLocation( null );

    }


    function onMouseUp( e ) {

        // re-enable labels
        $dom
            .on( 'mouseenter', '.tag', onMouseenterLabel  )
            .on( 'mouseleave', '.tag', onMouseleaveLabel  )

    }


    function onMouseDown( e ) {

        // disable labels
        $dom
            .off( 'mouseenter', '.tag', onMouseenterLabel  )
            .off( 'mouseleave', '.tag', onMouseleaveLabel  )

    }


    function toScreenXY( position, camera ) { //, jqdiv ) {

        var pos = position.clone().project( camera ); // NDC (-1.0 .. 1.0)
        return {
            x: ( pos.x + 1 ) * sceneWidth / 2,    //+ jqdiv.offset().left,
		    y: ( - pos.y + 1 ) * sceneHeight / 2,  //+ jqdiv.offset().top
            z: pos.z
        }

    }


    this.update = function( camera ) {

        var prisonMesh = app.buildingMesh,
            boundingSphereRadius = prisonMesh.geometry.boundingSphere.radius,
            buildingCenter = prisonMesh.position.clone(),
            rooms = app.rooms;

            var appOverLocation = app.getOverLocation(),
                appActiveLocation = app.getActiveLocation();

        // update all labels
        for ( var i = 0, max = rooms.length; i < max; i++ ) {

            var room = rooms[ i ],
                roomSlug = room.getSlug(),
                anchor = room.getCenter(),
                screenCoord = toScreenXY( anchor, camera ),

                distanceToAnchor = camera.position.distanceTo( anchor );
                distanceToCenter = camera.position.distanceTo( buildingCenter ),
                farZ = distanceToCenter + boundingSphereRadius,
                nearZ = distanceToCenter - boundingSphereRadius,
                pct = (distanceToAnchor - nearZ) / (farZ - nearZ);
                pct = 1 - pct;



            // opacity won't be affected by disatnce if this room is active or selected
            var opacity = ( roomSlug !== appActiveLocation ) ? (0.1 + pct) : 0.8;
            opacity = ( roomSlug !== appOverLocation ) ? opacity : 0.8;

            // testing scaling
            var targetScale = ( roomSlug === appOverLocation || roomSlug === appActiveLocation ) ? 1.11 : 1;
            // ease
            room.scale += ( targetScale - room.scale ) * 0.2;

            room.$label.css( {
                'transform' : 'translate3d(' + screenCoord.x  + 'px,' + screenCoord.y + 'px,0px) scale(' + room.scale + ',' + room.scale +')',
                // 'transform' : 'translate3d(' + screenCoord.x  + 'px,' + screenCoord.y + 'px,0px)',
                'opacity' : opacity,
                'z-index' : Math.floor(pct * 100)
            } );

        }

    }


    this.setOpacity = function( val ){

        // if ( isHidden )
        //     return;

        mainOpacity = ( val < 0.6 ) ? 1 : 0;

        $dom.css( 'opacity', mainOpacity );

    }


    this.setSize = function( width, height ) {

        sceneWidth = width;
        sceneHeight = height;

    }


    this.destroy = function() {

        removeListeners();

        $dom.empty();

        $dom.css( 'opacity', 0 );

    }


    // this.hide = function() {
    //
    //     isHidden = true;
    //     $dom.css( 'opacity', 0 );
    //
    // }
    //
    //
    // this.show = function() {
    //
    //     isHidden = false;
    //     $dom.css( 'opacity', mainOpacity );
    //
    // }
}
