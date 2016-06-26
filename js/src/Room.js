FA.Room = function( geometry, name, slug ) {

    var name = name,
        slug = slug,

        material = null,
        object3D = null,
        center = null,

        $label = null;  // dom element


    build3D();
    buildLabel();
    calculateCenter();


    function build3D() {

        material = new THREE.MeshPhongMaterial( {
            color : 0xffffff,
            polygonOffset : true,
            polygonOffsetFactor : -1, // positive value pushes polygon further away
            polygonOffsetUnits : 1
        } );

        object3D = new THREE.Mesh( geometry, material );
        object3D.name = slug;

    }


    function buildLabel() {

        $label = $( '<div class="label">' +
            '<div class="line"></div>' +
            '<div class="tag">' + name + '</div>' +
        '</div>' );

    }


    function calculateCenter() {

        geometry.computeBoundingBox();

        center = new THREE.Vector3();
        center.addVectors(
            geometry.boundingBox.min,
            geometry.boundingBox.max
        );
        center.divideScalar( 2 ).add( object3D.position ); // center in world space

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


    //        //
    // Reveal //
    //        //


    return {

        material  : material,
        object3D  : object3D,
        $label    : $label,

        getCenter : getCenter,
        getName   : getName,
        getSlug   : getSlug,

        hideLabel : function() {
            $label.css( 'opacity', 0 );
        }

    }

}
