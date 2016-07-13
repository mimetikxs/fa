// the sound starts at 0 volume, you'll have to

// https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/stop

FA.Sound = function( context, buffer, name, loop ) {

    var gainNode = context.createGain(),
        source;
        // loop = false,

        // elapsedOnPause; // used to track the time


    // https://blog.szynalski.com/2014/04/02/web-audio-api/
    // NOTE: AudioBufferSourceNode ARE SINGLE-USE ENTITIES!

    function play( time ) {

        // stop previous playing sourceNodes (if any)
        if ( source ) {
            source.stop();
        }


        // create a new node graph
        source = context.createBufferSource();
        source.buffer = buffer;
        source.connect( gainNode );                 // Connect the source to the gain node.
        gainNode.connect( context.destination );    // Connect the gain node to the destination.

        // begin muted
        gainNode.gain.value = 0;

        // set loop
        source.loop = loop;

        // start playing
        source.start( time || 0 );  // NOTE: this won't work on iOS

    }


    function pause() {

        // TODO
        //console.log(context.currentTime);
    }


    function stop() {

        source.stop();

    }


    function fadeVolume( volumeStart, volumeEnd, duration, onComplete ) {

        $( { value : volumeStart } ).animate( { value : volumeEnd }, {
            duration : duration,
            easing : 'linear',
            step : function( val ) {
                gainNode.gain.value = val;
            },
            complete : function() {
                if ( onComplete ) onComplete();
            }
        });

    }


    function fadeIn( duration ) {

        var currentGain = gainNode.gain.value;

        fadeVolume( currentGain, 1, duration );

    }


    function fadeOut( duration ) {

        var currentGain = gainNode.gain.value;

        fadeVolume( currentGain, 0, duration );

    }


    function setVolume( val ) {

        gainNode.gain.value = val;

    }


    return {

        getName : function() {  return name; },

        play : play,
        stop : stop,
        pause : pause,
        setVolume : setVolume,
        fadeVolume : fadeVolume,
        fadeIn : fadeIn,
        fadeOut : fadeOut

    }
}
