// http://www.html5rocks.com/en/tutorials/webaudio/intro/
// http://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js


FA.BufferLoader = function( context, filesList, callback ) {

    this.context = context;
    this.filesList = filesList;   // [ { url: "path/to/sound", soundId: "soundId", loop: bool }, ... ]
    this.loadCount = 0;
    this.onload = callback;

    // output
    // this.bufferLookup = {};       // { "name" : soundBuffer, ... }
    // this.bufferLookup.each = function( fn ) {
	// 		for ( prop in this )
	// 			if ( typeof this[ prop ] === 'object' )
	// 				fn( this[ prop ] );
	// 	};

    this.bufferList = [ ];

}


FA.BufferLoader.prototype.loadBuffer = function( url, i, soundId, loop ) {

    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open( "GET", url, true );
    request.responseType = "arraybuffer";

    var scope = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        scope.context.decodeAudioData(
            request.response,
            function( buffer ) {

                if ( !buffer ) {
                    alert( 'error decoding file data: ' + url );
                    return;
                }

                // store the newly decoded buffer into the lookup
                //scope.bufferLookup[ soundId ] = buffer;

                scope.bufferList[ i ] = {
                    id: soundId,
                    buffer: buffer,
                    loop: loop
                }

                // execute the callback and pass the buffer lookup
                if ( ++scope.loadCount == scope.filesList.length ) {
                    //scope.onload( scope.bufferLookup );
                    scope.onload( scope.bufferList );
                }

            },
            function( error ) {
                console.error( 'decodeAudioData error', error );
            }
        );
    }

    request.onerror = function() {
        alert('BufferLoader: XHR error');
    }

    request.send();
}


FA.BufferLoader.prototype.load = function() {

    for ( var i = 0; i < this.filesList.length; ++i ) {
        var url = this.filesList[ i ].url,
            soundId = this.filesList[ i ].soundId,
            loop = this.filesList[ i ].loop;

        this.loadBuffer( url, i, soundId, loop );
    }

}
