import THREE from 'three';
import Starling from './Starling';

export default class Flock extends THREE.Object3D {
  constructor() {
    super();
    this._starlings = [];

    let vLength = 5000;

    let positions = new Float32Array( vLength * 3 );
    let colors = new Float32Array( vLength * 3 );

    let vertex;
    let color = new THREE.Color();

    let random = (scale) => (scale || 1) * (Math.random() - 0.5) * 2;
    let randomVector3 = (scale) => new THREE.Vector3(random(), random(), random()).normalize().multiplyScalar(scale || 1);

    for (let i = 0, l = vLength; i < l; i ++) {
      vertex = randomVector3(random(200));
      // vertex = new THREE.Vector3(5, 5, vLength / 2 - i);
      vertex.toArray( positions, i * 3 );

      color.setRGB(1, 1, 0);

      colors[i*3] = color.r;
      colors[i*3+1] = color.g;
      colors[i*3+2] = color.b;
    }

    this._geometry = new THREE.BufferGeometry();
    this._geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    this._geometry.addAttribute( 'aColor', new THREE.BufferAttribute( colors, 3 ) );

    this._material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          type: 'c',
          value: new THREE.Color(0xffffff)
        },
        texture: {
          type: 't',
          value: THREE.ImageUtils.loadTexture('./star.png')
        },
        time: {
          type: 'f',
          value: 1.0
        }
      },
      transparent: true,
      vertexShader: `
        attribute vec3 aColor;
        varying vec3 vColor;

        void main() {
          vColor = aColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 10000.0 / length(mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform sampler2D texture;

        varying vec3 vColor;

        void main() {
          float occilator = (sin(time) + 1.0) / 2.0;
          vec4 tex = texture2D(texture, gl_PointCoord);
          gl_FragColor = vec4(tex.xyz * vColor, tex.w * occilator);
        }
      `
    });

    setInterval(() => this._material.uniforms.time.value += 0.03, 30);

    this._points = new THREE.Points(this._geometry, this._material);

    this.add(this._points);
  }

  addStarling() {
    this._starlings.push(new Starling());
  }

  update() {
    this._starlings.forEach(function(starling) {
      starling.update();
    });
  }
}
