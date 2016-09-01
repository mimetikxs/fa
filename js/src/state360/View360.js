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
        objectGeomtries = {},           // lookup { "name" : THREE.Geometry }

        updateCallback = function(){};

    var orbitCenter = new THREE.Vector3();

    var intersecting = null;

    var isTouchDevice = $( 'body' ).hasClass( 'mobile' ) || $('body').hasClass( 'tablet' );


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

        camera = new THREE.PerspectiveCamera( cameraData.fov, sceneWidth / sceneHeight, 0.01, 1000 );
        camera.position.set(
            cameraData.position.x,
            cameraData.position.y,
            cameraData.position.z
        );

        var ambient = new THREE.AmbientLight( 0xffffff, lightIntensity );
        scene.add( ambient );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( sceneWidth, sceneHeight );

        // controls
        var interaciveEl = $('#layer-360 .labels')[0];

        controls = new THREE.OrbitControls( camera, interaciveEl );
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableKeys = false;
        controls.scaleFactor = 0.05;
        controls.minPolarAngle = cameraData.minPolar;
        controls.maxPolarAngle = ( cameraData.maxPolar === "PI" ) ? Math.PI : cameraData.maxPolar;
        controls.target = orbitCenter;

        if ( isTouchDevice ) {
            controls.rotateSpeed = 0.1;
        }

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
                },
                onProgress,
                onError
            );
        }

    }


    function addBody( data ) {

        // abort if this geomtry wasn't loaded
        if ( !bodyGeometries[ data.name ] ) {
            return;
        }

        var material = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.8, color: 0x000000 } );
            transform = new THREE.Matrix4(),
            rotateY = new THREE.Matrix4(),
            translate = new THREE.Matrix4(),
            toRadians = Math.PI / 180;

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
            },
            onProgress,
            onError
        );

    }


    function loadInteractiveObject( data ) {

        //console.log(data);

        var name = data.fileName,
            mediaId = data.mediaId,
            mediaData = app.data.mediaById[ mediaId ],
            loader = new THREE.JSONLoader( manager );

        loader.setTexturePath( 'obj/360s/maps/' )
        loader.load(
            'obj/360s/' + name + '.js',
            function ( geometry, materials ) {
                //console.log("TODO: fix this. Material is -> ", material); // TODO: pfg need to fix. is loading *undefined* material

                // manualy create a material
                var color, opacity;

                if ( data.isGrey ) {
                    color = 0x222222;
                    opacity = 0.5;
                } else {
                    color = 0x000000;
                    opacity = 0.8;
                }

                opacity = ( data.opacity ) ? data.opacity : opacity;

                var material = new THREE.MeshPhongMaterial( {
                    color : color,
                    transparent: true,
                    opacity: opacity
                } );

                var mesh = new THREE.Mesh( geometry, material );
                var item = new FA.InteractiveItem( mesh, mediaData.title, mediaId, data.labelOffset );

                // TODO: more consistent material storage in the json
                item.setEmissiveDefault( 0x000000 );
                if ( data.doubleSide !== undefined ) {
                    item.setDoubleSide( data.doubleSide );
                }
                if ( data.opacityHighLight !== undefined ) {
                    item.setHighlightOpacity( data.opacityHighLight );
                }

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
                    toRadians = Math.PI / 180;

                rotateY.makeRotationY( data.angle * toRadians );
                translate.makeTranslation( data.x, data.y, data.z );
                transform.multiplyMatrices( translate, rotateY );

                var material = materials[ 0 ]; // only has one material
                var mesh = new THREE.Mesh( geometry, material );
                mesh.applyMatrix( transform );

                scene.add( mesh );
            },
            onProgress,
            onError
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

        renderer.render( scene, camera );

        updateLabels();

    }


    function onProgress( xhr ) {
        // if ( xhr.lengthComputable ) {
        //     var percentComplete = xhr.loaded / xhr.total * 100;
        //     console.log( Math.round(percentComplete, 2) + '% downloaded' );
        // }
    };


    function onError( xhr ) {
        console.log( "LOADING ERROR", xhr );
    };


    //        //
    // Public //
    //        //


    this.load = function( data, onComplete ) {

        scope.clear();

        init( data.camera, data.light );

        manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
            // console.log( item, loaded, total );
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
        var objects = data.interactiveObjects;
        for (var i = 0; i < objects.length; i++) {
            loadInteractiveObject( objects[ i ] );
        }

        // load the interactive objects
        var objects = data.objects;
        for (var i = 0; i < objects.length; i++) {
            loadObject( objects[ i ] );
        }

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


    this.getItemBySlug = function( slug ) {

        for ( var i = 0, max = interactiveItems.length; i < max; i++ ) {
            if ( interactiveItems[ i ].getSlug() == slug ) {
                return interactiveItems[ i ];
            }
        }
        return null;

    }
}
