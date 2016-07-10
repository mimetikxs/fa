FA.State360 = function( app, locationData ) {

    var name = 'STATE_360';

    var $layer = $( '#layer-360' ),
        $gl = $layer.find( '.gl' ),
        $labels = $layer.find( '.labels' ),

        view360,

        mouseX = 0,
        mouseY = 0,

        windowHalfX = window.innerWidth / 2,
        windowHalfY = window.innerHeight / 2;



    function onWindowResize() {

        sceneWidth = $gl.width();
        sceneHeight = $gl.height();

        view360.setSize( sceneWidth, sceneHeight );

    }


    function addListeners() {

        window.addEventListener( 'resize', onWindowResize, false );

        $( '.btn-exit' ).on( 'click', function(){

            app.changeState( new FA.StateExplore( app ) );

            view360.clear(); // clear when we go back

            //$labels.empty(); // destroy labels

        });

        // $( '.label' ).on( 'click', function(){
        //     app.changeState( new FA.StateVideo2( app, "cell", { title: "interactive item" } ) ); // back to cell after video
        // });

        // TODO:
        // on label/object click we should NOT clear the View360 so the scene is available when back from video

    }


    function removeListeners() {

        window.removeEventListener( 'resize', onWindowResize );

        $('.btn-exit').off();

    }


    function goBack() {

    }


    function goToVideo() {

    }


    //        //
    // Public //
    //        //


    this.enter = function() {

        // create only once
        app.view360 = app.view360 || new FA.View360();

        view360 = app.view360;
        view360.load( locationData );

        // initLabels();

        // reveal layer
        $( '#header' ).css( 'top', 0 );
        $layer.css( {
            'visibility': 'visible',
            'opacity': 1
        } );

        addListeners();

    }


    this.update = function ()  {

        view360.update();

        // updateLabels();

    }


    this.exit = function() {

        removeListeners();

        // hide layer
        $layer.css( {
            'opacity': 1,
            'visibility': 'hidden'
        } );

    }

}
