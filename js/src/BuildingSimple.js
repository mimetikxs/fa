FA.BuildingSimple = function( geometry ) {

    var $dom = $('#layer-intro .gl'),

        sceneWidth = $dom.width(),
        sceneHeight = $dom.height(),

        camera,
        renderer,

        scene,

        controls;

    var color = 0xDADADA;


    init();


    function init() {

        scaleGeometry( geometry );

        var material = new THREE.MeshBasicMaterial( {color: color} );

        var mesh = new THREE.Mesh( geometry, material );

        var edgeHelper = new THREE.EdgesHelper( mesh, 0xbbbbbb, 30 );
        edgeHelper.material.linewidth = 1;

        //
        // --
        //

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( sceneWidth, sceneHeight );
        renderer.setClearColor( color );

        camera = new THREE.PerspectiveCamera( 40, sceneWidth / sceneHeight, 1, 800 );
        camera.position.x = -29.89;
        camera.position.y = 45.08;
        camera.position.z = 26.63;

        scene = new THREE.Scene();

        scene.add( mesh );
        scene.add( edgeHelper );

        $dom.append( renderer.domElement );

        // this hack creates a dummy element
        // to receibe mouse events to avoid mouse interaction
        // TODO: implement rotation without controls

        var dummy = $('<div></div>');
        dummy.appendTo( $('#layer-intro') );

        controls = new THREE.OrbitControls( camera, dummy[0] );
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1;
        controls.enableKeys = false;

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


    //
    // Public
    //


    this.update = function() {

        controls.update();

        renderer.render( scene, camera );

    }


    this.destroy = function() {

        controls.dispose();
        controls = null;

        $dom.empty();
        renderer = null;

    }


}
