/*
 * State machine and main loop
 * Resources are loaded/initialized during StatePreload
 */


FA.App = (function() {

    var currentState = new FA.StateIdle();


    update();


    function update() {

        requestAnimationFrame( update );

        currentState.update();

    }


    function changeState( newState ) {

        if (currentState) {
            currentState.exit();
        }
        currentState = newState;
        currentState.enter();

    }


    //        //
    // Public //
    //        //


    return {

        // home
        prisionModel : null,
        helper       : null,
        rooms        : [ ],
        terrainModel : null,
        interactiveNode : new THREE.Object3D(),  // container to place meshes to be picked

        // cell
        cellModel : null, // cached model + textures

        // public methods
        changeState : changeState

    }

})(); // App entry point (singleton)


FA.App.changeState( new FA.StatePreload( FA.App ) );    // initial state
