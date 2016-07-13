/*
 * Load common resources
 */

FA.StatePreload = function( app ) {

    var name = 'STATE_PRELOAD';

    var loaded = false,
        messageCompleted = false,
        manager;


    function loadData() {

        $.ajax({
            dataType: 'json',
            url : "http://localhost:8888/saydnaya/data/data.json",
            success : function( result ) {

                app.data = new FA.Data( result );

                loadResources();
            },
            error : function( jqXHR, status, errorThrown ) {

                console.log( status );
            }
        });
    }


    function loadResources() {

        manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };

        manager.onLoad = function() {
            loaded = true;
        }

        loadBuildingModel();
        loadTerrain();
        loadRooms();

    }


    function loadBuildingModel() {

        // Main building model
        var loader = new THREE.JSONLoader( manager );
        loader.setTexturePath( 'obj/building/maps/' )
        loader.load(
            'obj/building/building.js',
            function ( geometry, materials ) {
                var material = new THREE.MultiMaterial( materials );
                for (var i = 0; i < materials.length; i++) {
                    materials[ i ].transparent = true;
                }

                scaleGeometry( geometry );

                app.buildingMesh = new THREE.Mesh( geometry, material );
                app.buildingMesh.geometry.computeBoundingSphere();
            },
            onProgress,
            onError
        );

        // Main building roof
        var loader = new THREE.JSONLoader( manager );
        loader.load(
            'obj/building/building-roof.js',
            function ( geometry, materials ) {
                var material = new THREE.MultiMaterial( materials );
                for (var i = 0; i < materials.length; i++) {
                    materials[ i ] = new THREE.MeshPhongMaterial( {
                        color : 0xffffff,
                        transparent : true,
                        polygonOffset : true,
                        polygonOffsetFactor : 1, // positive value pushes polygon further away
                        polygonOffsetUnits : 1
                    } );
                }

                scaleGeometry( geometry );

                app.buildingRoofMesh = new THREE.Mesh( geometry, material );
            },
            onProgress,
            onError
        );

    }


    function loadRooms() {

        var roomData = app.data.locations;

        for ( var i = 0; i < roomData.length; i++ ) {
            loadRoom( roomData[ i ] );
        }

        function loadRoom( data ) {
            var name = data.name,
                slug = data.slug,
                loader = new THREE.JSONLoader( manager );

            loader.load(
                data.objRoom,
                function ( geometry, materials ) {
                    //var bufferGeom = new THREE.BufferGeometry();
                    //bufferGeom.fromGeometry( geometry );
                    var material = new THREE.MeshPhongMaterial( {
                        color : 0xffffff
                    } );

                    scaleGeometry( geometry );

                    var mesh = new THREE.Mesh( geometry, material );
                    var room = new FA.InteractiveItem( mesh, name, slug );

                    app.rooms.push( room );
                },
                onProgress,
                onError
            );
        }

    }


    function loadTerrain() {

        var loader = new THREE.JSONLoader( manager );
        loader.setTexturePath( 'obj/terrain/maps/' )
        loader.load(
            'obj/terrain/terrain.js',
            function ( geometry, materials ) {
                for (var i = 0; i < materials.length; i++) {
                    materials[ i ].transparent = true;
                }
                var material = new THREE.MultiMaterial( materials );

                scaleGeometry( geometry );

                app.terrainMesh = new THREE.Mesh( geometry, material );;
            },
            onProgress,
            onError
        );

    }


    function scaleGeometry( geometry ) {

        // centers the imported models into the scene
        var transform = new THREE.Matrix4(),
            scale = new THREE.Matrix4(),
            translate = new THREE.Matrix4();
        scale.makeScale( 0.2, 0.2, 0.2 );
        translate.makeTranslation( 32.57, 0, 30 );
        transform.multiplyMatrices( scale, translate );

        geometry.applyMatrix( transform );

    }


    function onProgress( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };


    function onError( xhr ) {};


    function goToNext() {

        setTimeout( function() {
            $( '#introMessage' ).fadeOut( 1000, function() {
                app.changeState( new FA.StateVideo( app ) );
            } );
        }, 1000 );

    }


    //        //
    // Public //
    //        //


    this.enter = function() {

        //loadResources();
        loadData();

        // initSound();
        //
        // // init typed
        // $( "#introMessage .message" ).typed( {
        //     stringsElement : $( '#typed-strings' )
        //     ,showCursor : false
        //     ,backDelay : 500
        //     ,callback : goToNext
        // });

    }


    this.update = function() {

        // bypass
        if (loaded) {
            $( '#layer-video' ).fadeOut();
            // $( '#introMessage' ).fadeOut();
            app.changeState( new FA.StateExplore( app ) );
            // app.changeState( new FA.StateVideo2( app ) );
        }

    }


    this.exit = function() {

        // fadeoutSoundVolume( 0.3, 0 );

    }

}
