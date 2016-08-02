FA.Slider = function() {


	this.$dom = null;


	var scope = this,
		percent,
		$slider,
		$guide,
		$bar,

		onChangeCallback = function( value ) {};


	var isTouchDevice = $('body').hasClass( 'mobile' ) || $('body').hasClass( 'tablet' );


	init();


	function init() {

		// html
		var html = [
            '<div class="control-wrap">',
    			'<div class="control">',
                    // '<div class="label">Look inside</div>',
    				'<div class="slider">',
						'<div class="guide"></div>',
    					'<div class="bar"></div>',
    				'</div>',
    			'</div>',
            '</div>'
		].join('');

		var $html = $(html);

		// public
		scope.$dom = $html;

		// shortcuts
		$slider  = $html.find( '.slider' );
		$bar     = $html.find( '.bar' );
		$guide   = $html.find( '.guide' );

		// initially hidden
		$slider.css( {
			'display': 'none',
			'opacity': 0
		} );

		// events
		addListeners();

	}


	function addListeners() {

		if ( isTouchDevice ) {
            addTouchListeners();
        } else {
            addMouseListeners();
        }

	}


	function removeListeners() {

		if ( isTouchDevice ) {
            removeTouchListeners();
        } else {
            removeMouseListeners();
        }

	}


	function addMouseListeners() {

		$slider
			.on( 'mousedown', onMousedown );

		$(document)
			.on( 'mouseup', onMouseup )
			.on( 'mouseout', onMouseout );

	}


	function removeMouseListeners() {

		$slider
			.off( 'mousedown', onMousedown );

		$(document)
			.off( 'mouseup', onMouseup )
			.off( 'mouseout', onMouseout )
			.off( 'mousemove', onMousemove );

	}


	function addTouchListeners() {

		$slider
			.on( 'touchstart', onTouchStart );

		$(document)
			.on( 'touchend', onTouchEnd );

	}


	function removeTouchListeners() {

		$slider
			.off( 'touchstart', onTouchStart );

		$(document)
			.off( 'touchend', onTouchEnd )
			.off( 'touchmove', onTouchMove );

	}


	// subscribers:


	// begin touch /////////////////////////
	// http://www.gianlucaguarini.com/blog/detecting-the-tap-event-on-a-mobile-touch-device-using-javascript/

	function onTouchStart( e ) {

		$( document ).on( 'touchmove', onTouchMove );

		onTouchMove( e ); // trigger

	}


	function onTouchEnd( e ) {

		$( document ).off( 'touchmove', onTouchMove );

	}


	function onTouchMove( e ) {

		var pointerEvent = e.originalEvent.targetTouches[0];

		var sliderWidth = $guide.width(),
			mouseX = pointerEvent.pageX - $bar.offset().left;  // local mouse x

		percent = mouseX / sliderWidth;
		percent = (percent > 1) ? 1 : (percent < 0) ? 0 : percent;	// clamp [0..1]

		updatePercent();

	}

	// end touch /////////////////////////


	function onMousedown( event ) {

		$(document).on( 'mousemove', onMousemove );

		onMousemove( event ); // trigger

		event.stopPropagation();
		return false;

	}


	function onMouseup( event ) {

		$(document).off( 'mousemove', onMousemove );

	}


	function onMousemove( event ) {

		var sliderWidth = $guide.width(),
			mouseX = event.pageX - $bar.offset().left;  // local mouse x

		percent = mouseX / sliderWidth;
		percent = (percent > 1) ? 1 : (percent < 0) ? 0 : percent;	// clamp [0..1]

		updatePercent();

	}


	function onMouseout( event ) {

		// detect mouse out of browser
		if ( event.relatedTarget === null ) {
			$(document).off( 'mousemove', onMousemove );
		}

	}


	function updatePercent() {

		$bar.css( 'width', percent * 100 + '%' );

		onChangeCallback( percent );

	}


	// -------------------
	// public:
	// -------------------

	/*
	 * Sets wath to do when the slider changes.
	 * IMPORTANT: allways asign a function to the callback!
	 * we don't check if it's a function (more performance)
	 * A normalized value is passed as parameter to the callback
	 */
	this.onChange = function( callback ) {

		onChangeCallback = callback;

	};


	/*
	 * Get/set slider percentage
	 */
	this.getPercent = function() { return percent; }
	this.setPercent = function( value ) {

		percent = value;

		updatePercent();

	}


    this.destroy = function() {

        removeListeners();

    }


	/*
	 * Default percent value for this slider
	 */
	this.defaultPercent = 0;


	/*
	 * Sets slider to default value
	 */
	this.reset = function() {

		this.setPercent( this.defaultPercent );

	}


	/*
	 * Apply current values. This will trigger the change callback
	 */
	this.apply = function() {

		updatePercent();

	}


	this.show = function() {

		addListeners();

		$slider
			.css( { 'display': 'block' } )
			.transition( { 'opacity': 1 }, 400, 'in' );

	}


	this.hide = function() {

		removeListeners();

		$slider
			.transition( { 'opacity': 1 }, 400, 'in', function() {
				$(this).css( { 'display': 'none' } );
			} );

	}


}
