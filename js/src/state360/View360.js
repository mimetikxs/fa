/*
 * 360 view of the cells
 */
FA.View360 = function() {

    var scope = this,

        $dom = $('#layer-360 .gl'),

        sceneWidth = $dom.width(),
        sceneHeight = $dom.height(),

        manager,

        scene,
        camera,
        renderer,
        controls,
        raycaster,

        interactiveGroup, // object picking: this is the parent of all interactive objects

        //TODO: interactive objects

        bodyGeometries = {}, // lookup { "name" : THREE.geometry } // TODO: clear on exit?

        updateCallback = function(){};



    function init( cameraPos, cameraLookAt ) {

        raycaster = new THREE.Raycaster();

        scene = new THREE.Scene();

        var ambient = new THREE.AmbientLight( 0xffffff, 1.0 );
        scene.add( ambient );

        camera = new THREE.PerspectiveCamera( 50, sceneWidth / sceneHeight, 0.1, 300 );
        // camera.position.x = cameraPos.x;
        // camera.position.y = cameraPos.y;
        // camera.position.z = cameraPos.z;
        camera.position.x = (cameraPos.x === 0) ? 0.93 : cameraPos.x;
        camera.position.y = (cameraPos.y === 0) ? 1.55 : cameraPos.y;
        camera.position.z = (cameraPos.z === 0) ? 1.32 : cameraPos.z;

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( sceneWidth, sceneHeight );
        //renderer.setClearColor( 0x666666 );

        // controls
        var interaciveEl = $('#layer-360 .labels')[0];

        controls = new THREE.OrbitControls( camera, interaciveEl );
        controls.enableDamping = true;
        controls.dampingFactor = 0.15;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableKeys = false ;
        // controls.target.x = cameraLookAt.x;
        // controls.target.y = cameraLookAt.y;
        // controls.target.z = cameraLookAt.z;
        controls.target.x = (cameraLookAt.x === 0) ? 0.96 : cameraLookAt.x;
        controls.target.y = (cameraLookAt.y === 0) ? 1.55 : cameraLookAt.y;
        controls.target.z = (cameraLookAt.z === 0) ? 1.2 : cameraLookAt.z;

    }


    function addBody( data ) {

        var material = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.7, color: 0x000000 } );
            transform = new THREE.Matrix4(),
            rotateY = new THREE.Matrix4(),
            translate = new THREE.Matrix4(),
            toRadians = 180 / Math.PI;

        rotateY.makeRotationY( data.angle * toRadians );
        translate.makeTranslation( data.x, 0, data.z );
        transform.multiplyMatrices( translate, rotateY );

        object = new THREE.Mesh( bodyGeometries[ data.name ], material );
        object.applyMatrix( transform );

        scene.add( object );

    }


    function loadBody( fileName ) {

        var loader = new THREE.JSONLoader( manager );
        loader.load(
            'obj/bodies/' + fileName + '.js',
            function ( geometry, materials ) {

                bodyGeometries[ fileName ] = geometry; // store the geometry
            }
        );

    }


    function loadInteractiveObject( data ) {

        // TODO

    }


    function updateWhenReady() {

        controls.update();

        renderer.render( scene, camera );

    }



    //        //
    // Public //
    //        //

    // TODO: move loading out of View360 to State360
    this.load = function( data ) {

        scope.clear();

        init( data.cameraPos, data.cameraLookAt );

        manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };
        manager.onLoad = function() {

            // add bodies
            var bodies = data.bodies;
            for ( var i = 0; i < bodies.length; i++ ) {
                addBody( bodies[ i ] );
            }

            updateCallback = updateWhenReady;

            // add to dom
            $dom.append( renderer.domElement );
        }

        // load the room
        var loader = new THREE.JSONLoader( manager );
        loader.setTexturePath('obj/360s/maps/')
        loader.load(
            'obj/360s/' + data.obj360 + '.js',
            function ( geometry, materials ) {
                var material = new THREE.MultiMaterial( materials );
                var object = new THREE.Mesh( geometry, material );

                scene.add( object );
            }
        );

        // load the bodies
        var bodyNames = [],
            bodies = data.bodies,
            bodyName;
        for (var i = 0; i < bodies.length; i++) {
            bodyName = bodies[ i ].name;
            // load the model only once
            if ( bodyNames.indexOf( bodyName ) === -1 ) {
                bodyNames.push( bodyName );
                loadBody( bodyName );
            }
        }

        // load the interactive objects
        // for (var i = 0; i < data.interactiveObjects.length; i++) {
        //     loadBody( data.bodies[ i ] );
        // }

    }


    this.clear = function() {

        updateCallback = function(){};

        // dispose controls
        if ( controls ) controls.dispose();
        controls = null;

        // clear references
        raycaster = null;
        scene = null;
        camera = null;
        renderer = null;

        $dom.empty();

    }


    this.update = function() {

        updateCallback();

    }


    // this.getIntersectingObject = function( mouse ) {
    //
    //     raycaster.setFromCamera( mouse, camera );
    //
    //     var intersects = raycaster.intersectObjects( roomsGroup.children );
    //
    //     if ( intersects.length > 0 ) {
    //         return intersects[ 0 ].object;
    //     } else {
    //         return null;
    //     }
    //
    // }


    this.setSize = function( width, height ) {

        sceneWidth = width;
        sceneHeight = height;

        camera.aspect = sceneWidth / sceneHeight;
        camera.setViewOffset( (sceneWidth + sceneWidth/6), (sceneHeight - sceneHeight/4) , 0, 0, sceneWidth, sceneHeight );
        camera.updateProjectionMatrix();

        renderer.setSize( sceneWidth, sceneHeight );

    }


    this.getDom = function() {

        return $dom;

    }


    this.getCamera = function() {

        return camera;

    }

}
