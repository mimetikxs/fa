FA.InteractiveItem = function( mesh, name, slug ) {

    var object3D = null,
        center = null,
        $label = null;  // refernce to dom element associated with this room


    build3D();
    buildLabel();
    calculateCenter();


    function build3D() {

        object3D = mesh;
        object3D.name = slug;

    }


    function buildLabel() {

        $label = $( '<div class="label" data-id=' + slug + '>' +
            '<div class="line"></div>' +
            '<div class="tag">' + name + '</div>' +
        '</div>' );

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

        object3D.material.emissive.setHex( 0xff0000 );

    }


    function unmark() {

        object3D.material.emissive.setHex( 0x000000 );

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
        unmark : unmark

    }

}
