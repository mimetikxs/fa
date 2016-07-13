FA.SoundPlayer = function() {

    // audio
    var context,
        bufferLoader;


    init() ;


    function init() {

        // create a context
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();

    }


    function load( filesArray ) {

        var bufferLoader = new FA.BufferLoader(
            context,
            [
                'sound/drone-test.mp3'
            ],
            // filesArray,
            onBuffersLoaded
        );

        bufferLoader.load();

    }


    function onBuffersLoaded( bufferList ) {

        var source = context.createBufferSource();
        source.buffer = bufferList[ 0 ];

        source.connect( gainNode );                 // Connect the source to the gain node.
        gainNode.connect( context.destination );    // Connect the gain node to the destination.
        gainNode.gain.value = 0;
        source.start( 0 );                          // NOTE: this won't work on iOS, it requires user interaction

        //fadeoutSoundVolume( 0, 0.3 );

    }




}
