import THREE from 'three';

export default class Starling extends THREE.Object3D {
  constructor() {
    super();
  }

  update() {
    let force = new THREE.Vector3(),
      sep = this.separate(),
      ali = this.align(),
      coh = this.cohesion();

    force.add(sep);
    force.add(ali);
    force.add(coh);

    this.position.add(force);
  }

  separate() {
    return THREE.Vector3();
  }

  align() {
    return THREE.Vector3();
  }

  cohesion() {
    return THREE.Vector3();
  }
}
