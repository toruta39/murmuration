function random(scale) {
  return (Math.random() - 0.5) * 2 * (scale || 1);
}

function randomVec3(magnitude) {
  return new THREE.Vector3(random(), random(), random()).normalize().multiplyScalar(magnitude || 1);
}

export default class Starling {
  constructor(starlings) {
    this.position = randomVec3(500);
    this.velocity = randomVec3();

    this.maxSpeed = 100 + random(50);
    this.maxForce = 20 + random(10);
    this.recognizableDistance = 200 + random(50);
    this.neighbourDistance = 50;
    this.neighbourEndurance = 10 + random(5);
    this.maxDistanceFromHome = 1000 + random(100);

    this.starlings = starlings;
    this.mesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 5, 30).rotateX(Math.PI/2), new THREE.MeshPhongMaterial({
      color: 0xcccccc
    }));
    this.mesh.position.copy(this.position);
    this.mesh.up.set(0, 0, 1);
  }

  update() {
    let force = new THREE.Vector3();

    force.add(this.separate().multiplyScalar(0.1));
    force.add(this.align().multiplyScalar(0.15));
    force.add(this.cohesion().multiplyScalar(0.05));
    force.add(this.homing().multiplyScalar(0.15));

    this.velocity.add(force);

    let vLength = this.velocity.length();
    if (vLength > this.maxSpeed) {
      this.velocity.multiplyScalar(this.maxSpeed / vLength);
    }

    this.position.add(this.velocity);
    this.mesh.position.copy(this.position);

    let direction = this.velocity.clone();
    this.mesh.lookAt(direction.normalize().add(this.position));
  }

  separate() {
    let len = this.starlings.length;
    let steer = new THREE.Vector3();

    for (let i = 0; i < len; i++) {
      let distance = new THREE.Vector3();
      distance.subVectors(this.starlings[i].position, this.position);
      if (distance.length() > this.recognizableDistance) continue;

      if (distance.length() < this.neighbourDistance - this.neighbourEndurance) {
        steer.add(distance.multiplyScalar(-1));
      }
    }

    steer.normalize().multiplyScalar(this.maxSpeed);

    steer.sub(this.velocity);

    let sLength = steer.length();
    if (sLength > this.maxForce) {
      steer.multiplyScalar(this.maxForce / sLength);
    }

    return steer;
  }

  align() {
    let len = this.starlings.length;
    let steer = new THREE.Vector3();

    for (let i = 0; i < len; i++) {
      let distance = new THREE.Vector3();
      distance.subVectors(this.starlings[i].position, this.position);
      if (distance.length() > this.recognizableDistance) continue;

      steer.add(this.starlings[i].velocity);
    }

    steer.normalize().multiplyScalar(this.maxSpeed);

    steer.sub(this.velocity);

    let sLength = steer.length();
    if (sLength > this.maxForce) {
      steer.multiplyScalar(this.maxForce / sLength);
    }

    return steer;
  }

  cohesion() {
    let len = this.starlings.length;
    let steer = new THREE.Vector3();

    for (let i = 0; i < len; i++) {
      let distance = new THREE.Vector3();
      distance.subVectors(this.starlings[i].position, this.position);
      if (distance.length() > this.recognizableDistance) continue;

      if (distance.length() > this.neighbourDistance + this.neighbourEndurance) {
        steer.add(distance);
      }
    }

    steer.normalize().multiplyScalar(this.maxSpeed);

    steer.sub(this.velocity);

    let sLength = steer.length();
    if (sLength > this.maxForce) {
      steer.multiplyScalar(this.maxForce / sLength);
    }

    return steer;
  }

  homing() {
    let steer = new THREE.Vector3();

    let distance = new THREE.Vector3();
    distance.sub(this.position);

    if (distance.length() > this.maxDistanceFromHome) {
      steer.copy(distance);
      steer.normalize().multiplyScalar(this.maxSpeed);
    }

    steer.sub(this.velocity);

    let sLength = steer.length();
    if (sLength > this.maxForce) {
      steer.multiplyScalar(this.maxForce / sLength);
    }

    return steer;
  }
}
