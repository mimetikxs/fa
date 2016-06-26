/*
 * Load common resources
 */

FA.StatePreload = function( app ) {

    var loaded = false,
        messageCompleted = false,

        // audio
        context, // TODO: move to App.context
        bufferLoader,
        gainNode;

    var manager;


    function initSound() {

        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();

        bufferLoader = new FA.BufferLoader(
            context,
            [
                'sound/drone-test.mp3'
            ],
            onBuffersLoaded
        );

        bufferLoader.load();

        function onBuffersLoaded( bufferList ) {
            // TODO: store in App.source
            var source = context.createBufferSource();
            source.buffer = bufferList[ 0 ];
            //source.connect( context.destination );
            //source.start( 0 );  // NOTE: this won't work on iOS

            // Create a gain node.
            gainNode = context.createGain();
            source.connect( gainNode );                 // Connect the source to the gain node.
            gainNode.connect( context.destination );    // Connect the gain node to the destination.
            gainNode.gain.value = 0;
            source.start( 0 );  // NOTE: this won't work on iOS, it requires user interaction

            fadeoutSoundVolume( 0, 0.3 );
        }

    }


    function fadeoutSoundVolume( volumeStart , volumeEnd ) {

        $( { value : volumeStart } ).animate( { value : volumeEnd }, {
            duration : 2000,
            easing : 'linear',
            step : function( val ) {
                gainNode.gain.value = val;
            }
        })

    }


     function loadResources() {

         var manager = new THREE.LoadingManager();
         manager.onProgress = function ( item, loaded, total ) {
             console.log( item, loaded, total );
         };

         manager.onLoad = function() {
             loaded = true;
         }

        // main building model
        var loader = new THREE.JSONLoader( manager );
        loader.load(
            // 'obj/prision/D-building_2ndfloor.js',
            'obj/building/D-building.js',
            function ( geometry, materials ) {
                var material = new THREE.MultiMaterial( materials );
                var object = new THREE.Mesh( geometry, material );

                // solid
                app.prisionModel = object;

                // wireframe
                app.helper = new THREE.EdgesHelper( object, 0x000000, 80 );
                app.helper.material.transparent = true;
                app.helper.material.opacity = 0.2;
                app.helper.material.linewidth = 1;
            },
            onProgress,
            onError
        );

        // terrain
        // var loader = new THREE.JSONLoader( manager );
        // loader.load(
        //     //'obj/building/D-groupCellSample.js',
        //     'obj/terrain/terrain.js',
        //     function ( geometry, materials ) {
        //         var material = new THREE.MultiMaterial( materials );
        //         var object = new THREE.Mesh( geometry, material );
        //
        //         // solid
        //         app.terrainModel = object;
        //     },
        //     onProgress,
        //     onError
        // );

        // rooms
        var roomData = [
            { file: 'buttoncorridor', name: 'Corridor', slug: 'corridor'  },
            { file: 'buttongroupcell1', name: 'Group cell 1', slug: 'cell1'  },
            { file: 'buttongroupcell2', name: 'Group cell 2', slug: 'cell2'  },
            { file: 'buttonvisitingroom', name: 'Visiting room', slug: 'visit'  },
            { file: 'buttonwelcomeparty', name: 'Welcome party', slug: 'welcome'  },
            { file: 'buttosolitary', name: 'Solitary confinement', slug: 'solitary'  }
        ];
        for (var i = 0; i < roomData.length; i++) {
            loadRoom( roomData[ i ] );
        }

        // cell
        // instantiate a loader
        var loader = new THREE.JSONLoader( manager );
        loader.setTexturePath( 'obj/groupCell/maps/' )
        loader.load(
            'obj/groupCell/groupCell.js',
            function ( geometry, materials ) {
                var material = new THREE.MultiMaterial( materials );
                var object = new THREE.Mesh( geometry, material );
                app.cellModel = object;
            }
        );

     }


     function loadRoom( data ) {

         var name = data.name,
             slug = data.slug,
             loader = new THREE.JSONLoader( manager );

         loader.load(
             'obj/rooms/' + data.file + '.js',
             function ( geometry, materials ) {
                 var room = new FA.Room( geometry, name, slug );
                 app.rooms.push( room );

                 //test: remove labels of labels not centered
                 if ( slug === 'corridor' || slug === 'welcome' ){
                     room.hideLabel();
                 }
             },
             onProgress,
             onError
         );

     }


     function onProgress( xhr ) {
         if ( xhr.lengthComputable ) {
             var percentComplete = xhr.loaded / xhr.total * 100;
             console.log( Math.round(percentComplete, 2) + '% downloaded' );
         }
     };


     function onError( xhr ) {
     };


    function goToNext() {

        setTimeout( function() {
            $( '#introMessage' ).fadeOut( 1000, function() {
                app.changeState( new FA.StateVideo( app ) );
            } );
        }, 1000 );

    }


    /******************
     * Public
     ******************/


    this.enter = function() {

        loadResources();

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
            $( '#introMessage' ).fadeOut();
            app.changeState( new FA.StateHome( app ) );
        }

    }


    this.exit = function() {

        // fadeoutSoundVolume( 0.3, 0 );

    }

}
