FA.Slider = function() {


	this.$dom = null;


	var scope = this,
		percent,
		$slider,
		$bar,

		isDisabled,

		isMouseDown = false,
		isMouseOut = false,

		openWidth = 204,
		closedWidth = 85,

		onChangeCallback = function( value ) {};


	init();


	function init() {

		// html
		var html = [
            '<div class="control-wrap">',
    			'<div class="control">',
                    '<div class="label">Look inside</div>',
    				'<div class="slider">',
    					'<div class="bar"></div>',
    				'</div>',
    			'</div>',
            '</div>'
		].join('');

		var $html = $(html);

		// public
		scope.$dom = $html;

		// shortcuts
		$slider  = $html.find('.slider');
		$bar     = $html.find('.bar');

		// events
		enable();

	}


	function enable() {

		if ( isDisabled )
			isDisabled = false;

		$slider
			.on( 'mousedown', onMousedown );
		$(document)
			.on( 'mouseup', onMouseup )
			.on( 'mouseout', onMouseout );
		// fold / unfold
		scope.$dom
			.on( 'mouseenter', onMouseenter )
			.on( 'mouseleave', onMouseleave );

	}


	function disable() {

		isDisabled = true;

		$slider
			.off( 'mousedown', onMousedown );
		$(document)
			.off( 'mouseup', onMouseup )
			.off( 'mouseout', onMouseout )
			.off( 'mousemove', onMousemove );
		// fold / unfold
		scope.$dom
			.off( 'mouseenter', onMouseenter )
			.off( 'mouseleave', onMouseleave );
	}


	// subscribers


	function onMousedown( event ) {

		isMouseDown = true;

		$(document).on( 'mousemove', onMousemove );

		event.stopPropagation();
		return false;

	}


	function onMouseup( event ) {

		isMouseDown = false;

		$(document).off( 'mousemove', onMousemove );

		if ( isMouseOut ) {
			scope.$dom.css( 'width', closedWidth );
		}

	}


	function onMousemove( event ) {

		var sliderWidth = $slider.width(),
			mouseX = event.pageX - $slider.offset().left;  // local mouse x

		percent = mouseX / sliderWidth * 100;
		percent = (percent > 100) ? 100 : (percent < 0) ? 0 : percent;	// clamp [0..100]

		updatePercent();

	}


	function onMouseout( event ) {

		// detect mouse out of browser
		if ( event.relatedTarget === null ) {
			$(document).off( 'mousemove', onMousemove );

			// close
			isMouseOut = true;
			scope.$dom.css( 'width', closedWidth );
		}

	}


	function onMouseenter( e ) {

		isMouseOut = false;

		scope.$dom.css( 'width', openWidth );

	}


	function onMouseleave( e ) {

		isMouseOut = true;

		if ( !isMouseDown ) {
			scope.$dom.css( 'width', closedWidth );
		}

	}


	function updatePercent() {

		$bar.css( 'width', percent + '%' );

		// a normalized value is passed to the handler
		onChangeCallback( percent * 0.01 );

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

        disable();

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

	/*
	 * hack
	 */
	this.refreshWidth = function() {

	}


}
