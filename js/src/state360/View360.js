/*
 * 360 view of the cells
 */

FA.View360 = function( app ) {

    var scope = this,

        $dom = $('#layer-360 .gl'),
        $labels = $('#layer-360 .labels'),

        sceneWidth,
        sceneHeight,

        manager,

        scene,
        camera,
        renderer,
        controls,
        raycaster,

        interactiveGroup,               // object picking: this is the parent of all interactive objects
        interactiveItems = [],          // FA.InteractiveItem

        bodyGeometries = {},            // lookup { "name" : THREE.Geometry }

        updateCallback = function(){},

        locationData = null;            // the current data being displayed

    var orbitCenter = new THREE.Vector3();

    var intersecting = null;

    // var directionalLight;



    function init( cameraData, lightIntensity ) {

        raycaster = new THREE.Raycaster();

        scene = new THREE.Scene();

        interactiveGroup = new THREE.Object3D();
        scene.add( interactiveGroup );

        orbitCenter.set(
            cameraData.lookAt.x,
            cameraData.lookAt.y,
            cameraData.lookAt.z
        );

        camera = new THREE.PerspectiveCamera( cameraData.fov, sceneWidth / sceneHeight, 0.01, 300 );
        camera.position.set(
            cameraData.position.x,
            cameraData.position.y,
            cameraData.position.z
        );

        var ambient = new THREE.AmbientLight( 0xffffff, lightIntensity );
        scene.add( ambient );

        // directionalLight = new THREE.DirectionalLight( 0xffffff, 3 );
        // directionalLight.target.position.copy( orbitCenter );
        // scene.add( directionalLight );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( sceneWidth, sceneHeight );

        // controls
        var interaciveEl = $('#layer-360 .labels')[0];

        controls = new THREE.OrbitControls( camera, interaciveEl );
        controls.enableDamping = true;
        controls.dampingFactor = 0.15;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableKeys = false;
        controls.scaleFactor = 0.08;
        controls.minPolarAngle = cameraData.minPolar;
        controls.maxPolarAngle = ( cameraData.maxPolar === "PI" ) ? Math.PI : cameraData.maxPolar;
        controls.target = orbitCenter;

        scope.setSize( $dom.width(), $dom.height() );

    }


    function loadRoom( fileNames ) {

        for (var i = 0; i < fileNames.length; i++) {
            var fileName = fileNames[ i ];

            var loader = new THREE.JSONLoader( manager );
            loader.setTexturePath('obj/360s/maps/')
            loader.load(
                'obj/360s/' + fileName + '.js',
                function ( geometry, materials ) {
                    var material = new THREE.MultiMaterial( materials );
                    var object = new THREE.Mesh( geometry, material );

                    scene.add( object );
                }
            );
        }

    }


    function addBody( data ) {

        // abort if this geomtry wasn't loaded
        if ( !bodyGeometries[ data.name ] ) {
            return;
        }

        var material = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.6, color: 0x000000 } );
            transform = new THREE.Matrix4(),
            rotateY = new THREE.Matrix4(),
            translate = new THREE.Matrix4(),
            toRadians = 180 / Math.PI;

        rotateY.makeRotationY( data.angle * toRadians );
        translate.makeTranslation( data.x, data.y, data.z );
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

        var name = data.fileName,
            mediaId = data.mediaId,
            mediaData = app.data.mediaById[ mediaId ],
            loader = new THREE.JSONLoader( manager );
        loader.setTexturePath( 'obj/360s/maps/' )
        loader.load(
            'obj/360s/' + name + '.js',
            function ( geometry, materials ) {
                var material = materials[ 0 ]; // only has one matetial
                var mesh = new THREE.Mesh( geometry, material );
                var item = new FA.InteractiveItem( mesh, mediaData.title, mediaId );

                interactiveItems.push( item );

                interactiveGroup.add( item.object3D );

                $labels.append( item.$label );
            }
        );

    }


    function loadObject( data ) {

        var name = data.name,
            loader = new THREE.JSONLoader( manager );
        loader.setTexturePath( 'obj/360s/maps/' )
        loader.load(
            'obj/360s/' + name + '.js',
            function ( geometry, materials ) {

                var transform = new THREE.Matrix4(),
                    rotateY = new THREE.Matrix4(),
                    translate = new THREE.Matrix4(),
                    toRadians = 180 / Math.PI;

                rotateY.makeRotationY( data.angle * toRadians );
                translate.makeTranslation( data.x, data.y, data.z );
                transform.multiplyMatrices( translate, rotateY );

                var material = materials[ 0 ]; // only has one material
                var mesh = new THREE.Mesh( geometry, material );
                mesh.applyMatrix( transform );

                scene.add( mesh );
            }
        );



    }


    function updateLabels() {

        for ( var i = 0, max = interactiveItems.length; i < max; i++ ) {
            var item = interactiveItems[ i ],
                anchor = item.getCenter(),
                ndc = anchor.clone().project( camera ); // NDC (-1.0 .. 1.0)

            // clipping
		    if ( ndc.z < -1  ||  ndc.z > 1
		    	||  ndc.x < -1  ||  ndc.x > 1
		    	||  ndc.y < -1  ||  ndc.y > 1 ) {

		    	item.$label.css( {
		    		visibility : 'hidden'
		    	});

		    } else {
                var screenCoord = {
                    x: ( ndc.x + 1 ) * sceneWidth / 2,    //+ jqdiv.offset().left,
        		    y: ( - ndc.y + 1 ) * sceneHeight / 2  //+ jqdiv.offset().top
                }

                item.$label.css( {
                    'visibility' : 'visible',
                    'transform' : 'translate3d(' + screenCoord.x  + 'px,' + screenCoord.y + 'px,0px)'
                } );
            }
        }

    }


    function updateWhenReady() {

        controls.update();

        // directionalLight.position.copy( camera.position );

        renderer.render( scene, camera );

        updateLabels();

    }


    //        //
    // Public //
    //        //


    this.load = function( data, onComplete, onError ) {

        locationData = data;

        scope.clear();

        init( data.camera, data.light );

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

            // add renderer to dom
            $dom.append( renderer.domElement );

            updateCallback = updateWhenReady;

            if ( onComplete ) onComplete();
        }

        // load the room
        loadRoom( data.obj360 );

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
        // var objects = data.objects;
        // for (var i = 0; i < objects.length; i++) {
        //     loadInteractiveObject( objects[ i ] );
        // }

        var objects = data.objects;
        for (var i = 0; i < objects.length; i++) {
            loadObject( objects[ i ] );
        }

    }


    this.clear = function() {

        locationData = null;

        updateCallback = function(){};

        // dispose controls
        if ( controls ) controls.dispose();
        controls = null;

        // clear references
        raycaster = null;
        scene = null;
        camera = null;
        renderer = null;

        interactiveItems = [];
        bodyGeometries = {};

        // clear dom
        $dom.empty();
        $labels.empty();

    }


    this.update = function() {

        updateCallback();

    }


    this.getIntersectingObject = function( mouse ) {

        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( interactiveGroup.children );

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


    this.getDom = function() {

        return $dom;

    }


    this.getCamera = function() {

        return camera;

    }


    this.getLocationData = function() {

        return locationData;

    }


    this.getItemBySlug = function( slug ) {

        for ( var i = 0, max = interactiveItems.length; i < max; i++ ) {
            if ( interactiveItems[ i ].getSlug() === slug ) {
                return interactiveItems[ i ];
            }
        }
        return null;

    }
}
