import THREE from 'three';

// This function is not performant at all.
// So is it really necessary to use points in your use case?

export default function sortPoints(points, camera) {
  var vector = new THREE.Vector3();

  // Model View Projection matrix
  var matrix = new THREE.Matrix4();
  matrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
  matrix.multiply( points.matrixWorld );

  //

  var geometry = points.geometry;

  var index = geometry.getIndex();
  var positions = geometry.getAttribute( 'position' ).array;
  var length = positions.length / 3;

  if ( index === null ) {

    var array = new Uint16Array( length );

    for ( var i = 0; i < length; i ++ ) {

      array[ i ] = i;

    }

    index = new THREE.BufferAttribute( array, 1 );

    geometry.setIndex( index );

  }

  var sortArray = [];

  for ( var i = 0; i < length; i ++ ) {

    vector.fromArray( positions, i * 3 );
    vector.applyProjection( matrix );

    sortArray.push( [ vector.z, i ] );

  }

  function numericalSort( a, b ) {

    return b[ 0 ] - a[ 0 ];

  }

  sortArray.sort( numericalSort );

  var indices = index.array;

  for ( var i = 0; i < length; i ++ ) {

    indices[ i ] = sortArray[ i ][ 1 ];

  }

  geometry.index.needsUpdate = true;

}
