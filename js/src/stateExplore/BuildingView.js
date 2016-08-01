/*
 * 3D view of the building
 */
FA.BuildingView = function( app ) {

    var $dom,

        sceneWidth,
        sceneHeight,

        camera,
        renderer,

        scene,
        roomsGroup,

        directionalLight,

        buildingMesh,
        roofMesh,
        rooms,
        terrainMesh,
        roofEdgeHelper,

        controls,

        raycaster;


    var isTouchDevice = $( 'body' ).hasClass( 'mobile' ) || $('body').hasClass( 'tablet' );


    init();


    function init() {

        // shortcuts
        buildingMesh = app.buildingMesh;
        roofMesh = app.buildingRoofMesh;
        terrainMesh = app.terrainMesh;
        rooms = app.rooms;

        $dom = $('#layer-prison .gl');

        sceneWidth = $dom.width();
        sceneHeight = $dom.height();

        initScene();
        addObjects();
        addControls();

        // listen to model changes
        app.on( 'activeLocationChange', onModelActiveLocationChange );
        app.on( 'overLocationChange', onModelOverLocationChange );

    }


    function initScene() {

        raycaster = new THREE.Raycaster();

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 40, sceneWidth / sceneHeight, 1, 300 );
        // camera.position.x = -17;
        // camera.position.y = 24.79;
        // camera.position.z = 14.97;
        camera.position.x = -26;
        camera.position.y = 16;
        camera.position.z = 14;

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( sceneWidth, sceneHeight );
        renderer.setClearColor( 0x666666 );

        $dom.append( renderer.domElement );

    }


    function addObjects() {

        // lights
        var ambient = new THREE.AmbientLight( 0x333333 );
        scene.add( ambient );

        directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
        directionalLight.position.set( 0, 0, 0.1 );
        scene.add( directionalLight );

        // building
        scene.add( buildingMesh );

        // line helper (building)
        var edgeHelper = new THREE.EdgesHelper( buildingMesh, 0x000000, 80 );
        edgeHelper.material.transparent = true;
        edgeHelper.material.opacity = 0.3;
        edgeHelper.material.linewidth = 1;
        scene.add( edgeHelper );

        // roof
        var materials = roofMesh.material.materials;
        for (var i = 0; i < materials.length; i++) {
            materials[i].transparent = true;
        }
        roofMesh.renderOrder = 1;
        scene.add( roofMesh );

        // line helper (roof)
        roofEdgeHelper = new THREE.EdgesHelper( roofMesh, 0x000000, 20 );
        roofEdgeHelper.material.transparent = true;
        roofEdgeHelper.material.opacity = 0.2;
        roofEdgeHelper.material.linewidth = 1;
        roofEdgeHelper.renderOrder = 1;
        scene.add( roofEdgeHelper );

        // rooms
        roomsGroup = new THREE.Object3D();

        for ( var i = 0; i < rooms.length; i++ ) {
            roomsGroup.add( rooms[ i ].object3D );
        }

        scene.add( roomsGroup );

        // terrain
        scene.add( terrainMesh );

    }


    function addControls() {

        var interaciveEl = $('#layer-prison .labels')[0];

        // controls
        controls = new THREE.OrbitControls( camera, interaciveEl );
        //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
        controls.scaleFactor = 0.04;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.zoomSpeed = 0.2;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.008;
        controls.maxPolarAngle = 1.1;
        controls.minPolarAngle = 0.7;
        controls.enableKeys = false;
        controls.minDistance = 22;
    	controls.maxDistance = 40;

        if ( isTouchDevice ) {
            controls.rotateSpeed = 0.1;
        }

    }


    function onModelActiveLocationChange( e ) {

        var location = e.current;

        for ( var i = 0; i < rooms.length; i++ ) {
            var room = rooms[ i ],
                roomSlug = room.getSlug();

            if ( room.getSlug() === location ) {
                room.$label.addClass( 'selected' );
                room.mark();

            } else {
                room.$label.removeClass( 'selected' );
                if ( roomSlug !== app.getOverLocation() ) {
                    room.unmark();
                }

            }
        }

    }


    function onModelOverLocationChange( e ) {

        var location = e.location;

        for ( var i = 0; i < rooms.length; i++ ) {
            var room = rooms[ i ],
                roomSlug = room.getSlug();

            if ( roomSlug === location ) {
                room.$label.addClass( 'over' );
                room.mark();

                // if ( roomSlug !== app.getActiveLocation() ) {
                //     roomUnderMouse = room.object3D;
                // }
            } else {
                room.$label.removeClass( 'over' );
                if ( roomSlug !== app.getActiveLocation() ) {
                    room.unmark();
                }
                // roomUnderMouse = null;
            }
        }

    }


    // var count = 0;
    // var color = new THREE.Color( 0,0,0 );
    // var black = new THREE.Color( 0,0,0 );
    // var red = new THREE.Color( 1,0,0 );
    // function animateRoom() {
    //     count += 0.1;
    //
    //     if ( !roomUnderMouse )
    //         return;
    //
    //     var val = 0.5 * (1 + Math.sin( count )) * 0.5;
    //
    //     color.copy(black);
    //     color.lerp(red, val);
    //
    //     roomUnderMouse.material.emissive.setHex(color.getHex());
    // }


    //        //
    // Public //
    //        //


    this.update = function() {

        // animateRoom();

        controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

        directionalLight.position.copy( camera.position );

        renderer.render( scene, camera );

    }


    this.getIntersectingRoom = function( mouse ) {

        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( roomsGroup.children );

        if ( intersects.length > 0 ) {
            return intersects[ 0 ].object;
        } else {
            return null;
        }

    }


    this.setSize = function( width, height ) {

        sceneWidth = width;
        sceneHeight = height;

        camera.aspect = sceneWidth / sceneHeight;
        camera.setViewOffset( (sceneWidth + sceneWidth/6), (sceneHeight - sceneHeight/4) , 0, 0, sceneWidth, sceneHeight );
        camera.updateProjectionMatrix();

        renderer.setSize( sceneWidth, sceneHeight );

    }


    this.setOpacity = function( val ) {

        // building
        var materials = buildingMesh.material.materials;
        for ( var i = 0; i < materials.length; i++ ) {
            materials[ i ].opacity = 0.1 + val * ( 1 - 0.15 ); // remap from [0.0-1.0] to [0.1-1.0]
            materials[ i ].needsUpdate = true;
        }

        // roof
        materials = roofMesh.material.materials;
        for ( var i = 0; i < materials.length; i++ ) {
            materials[ i ].opacity = val * val * 1.1; // exponential curve
            materials[ i ].needsUpdate = true;
        }
        roofEdgeHelper.material.opacity = val * val * 0.2;  // exponential curve
        roofEdgeHelper.material.needsUpdate = true;

        // terrain
        materials = terrainMesh.material.materials;
        for ( var i = 0; i < materials.length; i++ ) {
            materials[ i ].opacity = val * val + 0.05;   // exponential curve
            materials[ i ].needsUpdate = true;
        }

    }


    this.destroy = function() {

        // dispose controls
        controls.dispose();
        controls = null;

        // remove scene
        $dom.empty();
        renderer = null;

        // remove app.listeners
        app.remove( 'activeLocationChange', onModelActiveLocationChange );
        app.remove( 'overLocationChange', onModelOverLocationChange );

    }


    this.getDom = function() {

        return $dom;

    }


    this.getCamera = function() {

        return camera;

    }

}
