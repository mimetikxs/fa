/*
 * Level 0 (root)
 */

FA.StateHome = function( app ) {

    var $layerGl,
        $layerLabels;

    var sceneWidth, sceneHeight;

    var camera, scene, renderer;

    var directionalLight;

    var controls;

    var gui;

    // mouse picking
    var mouse = new THREE.Vector2(),
        raycaster,
        INTERSECTED,
        isMouseDown = false,
        roomNameOnDown = null; // if a room is under the mouse onMouseDown we store the name


    function initScene() {

        camera = new THREE.PerspectiveCamera( 40, sceneWidth / sceneHeight, 1, 2000 );
        camera.position.z = 2;
        camera.position.x = -65.7;
        camera.position.y = 151.6;
        camera.position.z = 98.0;

        // isometric view: http://stackoverflow.com/questions/23450588/isometric-camera-with-three-js
        // var aspect = sceneWidth / sceneHeight;
	    // var d = 80;
        // camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );
        // camera.position.set( 80, 80, 80 ); // all components equal
        // camera.lookAt( new THREE.Vector3() ); // or the origin

        scene = new THREE.Scene();

        raycaster = new THREE.Raycaster();

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( sceneWidth, sceneHeight );
        renderer.setClearColor( 0x333333 );

        $layerGl.append( renderer.domElement );

    }


    function addObjects() {

        // lights
        var ambient = new THREE.AmbientLight( 0x333333 );
        scene.add( ambient );

        directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
        directionalLight.position.set( 0, 0, 0.1 );
        scene.add( directionalLight );

        var offset = new THREE.Vector3( 32.57, 0, 30 ); // centers the imported models into the scene

        // prision model
        app.prisionModel.position.copy( offset );
        scene.add( app.prisionModel );

        // line helper
        scene.add( app.helper );

        // interactive rooms
        for ( var i = 0; i < app.rooms.length; i++ ) {
            var roomObj = app.rooms[ i ].object3D;
            roomObj.position.copy( offset );
            app.interactiveNode.add( roomObj );
            var roomLabel = app.rooms[ i ].$label;
            $layerLabels.append( roomLabel );
        }
        scene.add( app.interactiveNode );

        // ground plane
        var geometry = new THREE.PlaneBufferGeometry( 1000, 1000, 50, 50 );
        var material = new THREE.MeshBasicMaterial( {color  : 0x666666, side: THREE.SigleSide} );
        var plane = new THREE.Mesh( geometry, material );
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = 0.002;
        scene.add( plane );

    }


    function addControls() {

        // controls
        controls = new THREE.OrbitControls( camera, renderer.domElement );
        //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        //controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.02;
        controls.maxPolarAngle = 1.1;
        controls.minPolarAngle = 0.45;
        controls.enableKeys = false;

    }


    function addLabels() {

    }


    function buildGui() {

        stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
        document.body.appendChild( stats.domElement );

        gui = new dat.GUI( { width: 250 } );

        //gui.remember( APP.parameters );

        gui.add( FA.parameters, 'opacity', 0.0, 1.0 ).onChange( onOpacityChange );
        //gui.add( FA.parameters, 'boolParam').onChange( onBoolChange );
        // gui.close();

        // set initial values
        FA.parameters.opacity = 0.3;
        onOpacityChange( 0.3 );

        // Iterate over all controllers
        for (var i in gui.__controllers) {
            gui.__controllers[ i ].updateDisplay();
        }

        // callbacks

        function onOpacityChange( value ) {
            var materials = app.prisionModel.material.materials;
            for (var i = 0; i < materials.length; i++) {
                materials[i].transparent = true;
                materials[i].opacity = value;
                materials[i].needsUpdate = true;
            }
        }

        function onBoolChange( value ) {
            if ( value === true ) {
            } else {
            }
        }

    }


    function onWindowResize() {

        sceneWidth = $layerGl.width();
        sceneHeight = $layerGl.height();

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }


    function onMouseMove( e ) {

        //  mouse position in normalized device coordinates
    	// (-1 to +1) for both components
    	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        if ( !isMouseDown ) {
            findIntersections();
        }

    }


    function onMouseDown( e ) {

        roomNameOnDown = ( INTERSECTED ) ? INTERSECTED.name : null;
        isMouseDown = true;

    }


    function onMouseUp( e ) {

        if ( roomNameOnDown ) {
            findIntersections();
            var roomNameOnUp = ( INTERSECTED ) ? INTERSECTED.name : null;

            if ( roomNameOnDown === roomNameOnUp ) {
                goToRoom( roomNameOnUp );
            }
        }

        roomNameOnDown = null;
        isMouseDown = false;

    }


    function findIntersections() {

        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( app.interactiveNode.children );

        if ( intersects.length > 0 ) {

            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[ 0 ].object;

            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );

        } else {

            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = null;

        }
    }


    function toScreenXY( position, camera ) { //, jqdiv ) {

        var pos = position.clone().project( camera ); // NDC (-1.0 .. 1.0)

        // return { x: ( pos.x + 1 ) * jqdiv.width() / 2 + jqdiv.offset().left,
        //      y: ( - pos.y + 1) * jqdiv.height() / 2 + jqdiv.offset().top };

        return {
            x: ( pos.x + 1 ) * sceneWidth / 2,
		    y: ( - pos.y + 1 ) * sceneHeight / 2
        }

    }


    function updateLabels() {

        var rooms = app.rooms;
        for (var i = 0; i < rooms.length; i++) {
            var room = rooms[ i ],
                screenCoord = toScreenXY( room.getCenter(), camera );

            room.$label.css( 'transform', 'translate3d(' + screenCoord.x  + 'px,' + screenCoord.y + 'px,0px)' );
        }

    }


var count = 0;
var color = new THREE.Color(0,0,0);
var black = new THREE.Color(0,0,0);
var red = new THREE.Color(1,0,0);
function animateRoom() {
    count += 0.05;
    var val = (1 + Math.sin(count)) * 0.5;
    color.copy(black);
    color.lerp(red, val);

    // app.rooms[0].material.emissive.setHex(color.getHex());
}


    function goToRoom( slug ) {

        if ( slug==='cell1' || slug==='cell2' ){
            app.changeState( new FA.StateCell( app ) );
        } else {
            app.changeState( new FA.StateVideo2( app ) );
        }

    }


    /*******************
     * Public
     ******************/


    this.enter = function() {

        $layerGl = $('#layer-gl');
        $layerLabels = $('#layer-labels');

        $layerGl.css( 'opacity', 1 );
        $layerLabels.css( 'opacity', 1 );
        $( '#header' ).css( 'top', 0 );

        sceneWidth = $layerGl.width();
        sceneHeight = $layerGl.height();

        initScene();
        addObjects();
        buildGui();
        addControls();

        // listeners
        window.addEventListener( 'resize', onWindowResize, false );
        $layerGl
            .on( 'mousemove', onMouseMove )
            .on( 'mousedown', onMouseDown )
            .on( 'mouseup', onMouseUp );

        $( '.dg.ac, #stats' ).css('visibility', 'visible');

    }


    this.update = function() {

        stats.begin();

        controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

        directionalLight.position.copy( camera.position );

        if (renderer) {
            renderer.render( scene, camera );
        }

        updateLabels();

        stats.end();

    }


    this.exit = function() {

        // dispose controls
        controls.dispose;
        controls = null;

        // destroy stats and gui
        $('#stats').remove();
        stats = null;
        gui.destroy();

        // remove listeners
        window.removeEventListener( 'resize', onWindowResize );
        $layerGl
            .off( 'mousemove', onMouseMove )
            .off( 'mousedown', onMouseDown )
            .off( 'mouseup', onMouseUp );

        // remove scene
        $layerGl.empty();
        renderer = null;

        $layerLabels.empty();

        // unmark marked room
        INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

    }

}
