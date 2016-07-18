/*
 * Load common resources
 */

FA.StatePreload = function( app ) {

    // var name = 'STATE_PRELOAD';

    var loaded = false,
        messageCompleted = false,
        manager;

    var isTimeUp = false,
        intervalId,
        secondsCounter = 0,
        maxSeconds = 2,

        $btnSkip = $( '#layer-intro .btn-skip' ),
        $spinner = $( '#layer-intro .intro-spinner' ),

        $player = $('#layer-intro .video-container'),
        player,
        isVideoReady = false,
        isVideoStarted = false;




    function loadData( onComplete ) {

        $.ajax({
            dataType: 'json',
            url : "http://localhost:8888/saydnaya/data/data.json",
            success : function( result ) {

                app.data = new FA.Data( result );

                onComplete();
            },
            error : function( jqXHR, status, errorThrown ) {

                console.log( status, errorThrown );
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

            showSkip();
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
                    room.setEmissiveDefault( 0x333333 )

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


    function goToNextState() {

        $( '#layer-prison' ).css( 'display', 'block' );

        // fadeout intro
        $( "#layer-intro" ).transition( { opacity: 0 }, 500, 'out',
            function() {
                player.dispose();

                this.remove();

                app.changeState( new FA.StateExplore( app ) );
            }
        );

    }


    function buidlVideo() {

        $player.html(
            '<video id="example_video_1" class="video-js vjs-default-skin vjs-fill" controls preload="none" width="640" height="264" poster="">' +
              '<source src="https://player.vimeo.com/external/174832604.hd.mp4?s=71f0ad7b107b0b7f97283d78d58b0cf01bc8b5fb&profile_id=174" type="video/mp4">' +
              '<source src="https://player.vimeo.com/external/174832604.sd.mp4?s=b555bd13a70870b1bd28e31b784857d9f8cfa19b&profile_id=165" type="video/mp4">' +
              '<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>' +
            '</video>'
        );
        $player.css( { 'display': 'none', 'opacity': 0 } );

        // init videojs
        player = videojs(
            "example_video_1",
            {
                controlBar: {
                    volumeMenuButton: false,
                    fullscreenToggle: false
                }
            },
            function() {
                // Player is initialized and ready.
                isVideoReady = true;
            }
        );

        player.on( 'ended', function() {
            goToNextState();
        } );

    }


    function startVideo() {

        $player
            .css('display', 'block')
            .transition( { opacity: 1 }, 500, 'in',
                function() {
                    $('#introMessage').css('visibility', 'hidden'); // hide message
                }
            );

        player.play();

        isVideoStarted = true;

    }


    function startTimer() {

        intervalId = setInterval( function() {
            secondsCounter++;

            if ( secondsCounter > maxSeconds ) {
                clearInterval( intervalId );
                isTimeUp = true;
            }

        }, 1000 );

    }


    function showSkip() {

        $btnSkip
            .css( { visibility: 'visible', opacity: 0 } )
            .transition( { opacity: 1 }, 500, 'in')
            .on( 'click', function( e ) {

                goToNextState();

            });

        $spinner.transition( { opacity: 0 }, 200, 'out');
        $spinner.transition( { height: 0, delay: 0 }, 300, 'out');
    }


    // function revealText( onComplete ) {
    //
    //     var $lines = $( '#introMessage .hidden' ),
    //         length = $lines.length,
    //         index = 0,
    //         intervalId;
    //
    //     intervalId = setInterval( function() {
    //         $lines.eq( index ).removeClass('hidden');
    //         index++;
    //
    //         if ( index >= length ) {
    //             clearInterval( intervalId );
    //
    //             onComplete();
    //         }
    //     }, 100 );
    //
    // }


    //        //
    // Public //
    //        //


    this.enter = function() {

        // hide layers
        $( '#layer-prison, #layer-video' ).css( 'display', 'none' );

        $( '#layer-prison' ).css( 'opacity', 1 );

        $( '#introMessage .centered' ).transition( { opacity: 1 }, 900, 'in');

        // prepare the player
        buidlVideo();

        // load json + resources
        loadData( loadResources );

        // whait at least two seconds before starting video
        startTimer();

    }


    this.update = function() {

        // console.log( loaded, isVideoReady, isVideoStarted, isTimeUp );

        if ( loaded  &&  isVideoReady  &&  !isVideoStarted  &&  isTimeUp ) {
            // startVideo();
            // goToNextState();
        }

    }


    this.exit = function() {

        if ( intervalId ) {
            clearInterval( intervalId );
        }

        $btnSkip.off();

    }

}
