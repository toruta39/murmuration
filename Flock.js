import Starling from './Starling';

export default class Flock extends THREE.Object3D {
  constructor() {
    super();
    this.starlings = [];

    let len = 200;

    for (let i = 0; i < len; i++) {
      this.addStarling();
    }
  }

  addStarling() {
    let starling = new Starling(this.starlings);
    this.starlings.push(starling);
    this.add(starling.mesh);
  }

  update() {
    this.starlings.forEach(function(starling) {
      starling.update();
    });
  }
}
