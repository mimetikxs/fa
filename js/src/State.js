// stub:


var State = function( model ) {
    var model = model;

    this.enter = function();
    this.update = function();
    this.exit = function();
}

// stub:


// var StateMachine = function() {
//     var currentState = null;
//
//     var update = function(){
//         currentState.update();
//     }
//
//     // public
//     this.changeState = function( newState ) {
//         if (currentState) {
//             currentState.exit();
//         }
//         currentState = newState;
//         currentState.enter();
//     }
// }
