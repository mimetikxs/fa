FA.InteractiveItem = function( mesh, name, slug, labelOffset ) {

    var object3D = null,
        center = null,
        $label = null;  // refernce to dom element associated with this room

    // testing
    // scaling on active/selected
    var scale = 1;

    var emissiveDefault = 0x000000,
        emissiveHighlight = 0xff0000,
        isDoubleSide = true,
        opacityDefault = 1.0,
        opacityHighLight = 1.0;


    build3D();
    buildLabel();
    calculateCenter();


    function build3D() {

        object3D = mesh;
        object3D.name = slug;

        // testing: different opacity on highlight
        opacityDefault = object3D.material.opacity;
        opacityHighLight = object3D.material.opacity;

        if ( object3D.material.length > 1 ) {
            for (var i = 0; i < object3D.material.length; i++) {
                setMaterial( object3D.material[ i ] );
            }
        } else {
            setMaterial( object3D.material );
        }

        function setMaterial( material ) {
            material.side = THREE.DoubleSide;
            material.emissive.setHex( emissiveDefault );
            material.polygonOffset = true;
            material.polygonOffsetFactor = -2; // positive value pushes polygon further away
            material.polygonOffsetUnits = 1;
            material.needsUpdate = true;
        }
    }


    function buildLabel() {

        $label = $( '<div class="label" data-id=' + slug + '>' +
            '<div class="line"></div>' +
            '<div class="tag">' + name + '</div>' +
        '</div>' );

        if (labelOffset) {
            $label.css({
                'margin-left': labelOffset.x,
                'margin-top': labelOffset.y,
            })
        }

    }


    function calculateCenter() {

        mesh.geometry.computeBoundingBox();

        center = new THREE.Vector3();
        center.addVectors(
            mesh.geometry.boundingBox.min,
            mesh.geometry.boundingBox.max
        );
        center.divideScalar( 2 );

    }


    function getName() {

        return name;

    }


    function getSlug() {

        return slug;

    }


    function getCenter() {

        calculateCenter();
        return center;

    }


    function mark() {

        object3D.material.emissive.setHex( emissiveHighlight );
        object3D.material.opacity = opacityHighLight;
        object3D.material.needsUpdate = true;

    }


    function unmark() {

        object3D.material.emissive.setHex( emissiveDefault );
        object3D.material.opacity = opacityDefault;
        object3D.material.needsUpdate = true;

    }


    function setEmissiveDefault( hex ) {

        emissiveDefault = hex;

        // object3D.material.emissive.setHex( emissiveDefault );
        // object3D.material.needsUpdate = true;

    }

    function setEmissiveHighligt( hex ) {

        emissiveHighlight = hex;

        // object3D.material.emissive.setHex( emissiveHighlight );
        // object3D.material.needsUpdate = true;

    }


    function setDoubleSide( bool ) {

        isDoubleSide = bool;

        object3D.material.side = (bool) ? THREE.DoubleSide : THREE.FrontSide;
        object3D.material.needsUpdate = true;

    }


    function setHighlightOpacity( val ) {

        opacityHighLight = val;

    }


    //        //
    // Reveal //
    //        //


    return {

        object3D  : object3D,
        $label    : $label,

        getCenter : getCenter,
        getName   : getName,
        getSlug   : getSlug,

        mark : mark,
        unmark : unmark,

        scale : scale,

        setEmissiveDefault : setEmissiveDefault,
        setDoubleSide: setDoubleSide,

        // TODO: set material props on Highlight (include an object with values opacity, colour, emmissive, etc)
        setHighlightOpacity : setHighlightOpacity

    }

}
