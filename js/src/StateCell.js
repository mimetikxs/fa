FA.StateCell = function( app ) {

    var $layer;

    var camera, scene, renderer;

    var mouseX = 0, mouseY = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    var directionalLight,
        pointLight;

    var controls;

    var cube, label;


    function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }


    function render() {

        //directionalLight.position.copy( camera.position );

        renderer.render( scene, camera );

    }


    function init() {

        camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 2000 );
        camera.position.z = 2;

        // scene

        scene = new THREE.Scene();

        var ambient = new THREE.AmbientLight( 0xffffff );
        //scene.add( ambient );

        directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
        directionalLight.position.set( 0, 0, 10 );
        //scene.add( directionalLight );

        pointLight = new THREE.PointLight( 0xffffff, 1, 50 );
        scene.add( pointLight );


        // model

        // center on scene
        app.cellModel.position.x = -3;
        app.cellModel.position.y = -2;
        app.cellModel.position.z = -4;

        scene.add( app.cellModel );

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        $layer.append( renderer.domElement );


        // add dummi item
        var geometry = new THREE.BoxGeometry( 0.05, 0.05, 0.05 );
        var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
        cube = new THREE.Mesh( geometry, material );
        cube.position.x = 4;
        cube.position.y = -1;
        scene.add( cube );



        // events

        window.addEventListener( 'resize', onWindowResize, false );

    }


    function toScreenXY( position, camera ) {

        var pos = position.clone().project( camera ); // NDC (-1.0 .. 1.0)
        return {
            x: ( pos.x + 1 ) * windowHalfX,
		    y: ( - pos.y + 1 ) * windowHalfY
        }

    }


    function updateLabels() {

        camera.updateMatrixWorld();

        var screenCoord = toScreenXY( cube.position, camera );

        label.find('.label').css( 'transform', 'translate3d(' + screenCoord.x  + 'px,' + screenCoord.y + 'px,0px)' );

    }


    //        //
    // Public //
    //        //


    this.enter = function() {

        $layer = $( '#layer-cell' );

        init();

        $layer.css( 'visibility', 'visible' );
        $layer.css( 'opacity', 1 );

        // label test
        label = $( '<div class="labels">' +
            // '<div class="label">' +
                '<div class="label">INTERACTIVE ITEM</div>' +
            // '</div>' +
        '</div>');
        $('#layer-cell').after( label );// controls

        controls = new THREE.OrbitControls( camera, $('.labels')[0] );
        controls.enableDamping = true;
        controls.dampingFactor = 0.15;
        controls.enableZoom = true;
        controls.scaleFactor = 0.08;

        // add buttons
        $('<div class="btn-exit">back</div>').appendTo(label);
        $('<div class="btn-next">next story</div>').appendTo(label);

        // events
        $('.btn-exit').on('click', function(){
            app.changeState( new FA.StateHome( app ) );
        });

        $('.btn-next').on('click', function(){
            app.changeState( new FA.StateVideo2( app ) ); // back to home after this video
        });

        $('.label').on('click', function(){
            app.changeState( new FA.StateVideo2( app, "cell" ) ); // back to cell after video
        });

        $( '#header' ).css( 'top', 0 );

    }


    this.update = function ()  {

        controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

        render();

        updateLabels();

    }


    this.exit = function() {

        // dispose controls
        controls.dispose();
        controls = null;

        // remove listeners
        window.removeEventListener( 'resize', onWindowResize );
        $('.btn-exit').off();
        $('.btn-next').off();
        $('.label').off();

        // remove scene
        $layer.empty();
        $layer.css( 'visibility', 'hidden' );
        $layer.css( 'opacity', 0 );

        label.remove();

    }

}
