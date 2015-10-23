import THREE from 'THREE';

const WIDTH = 64;
const BOUNDS = 400;

export default class SimulationRenderer {
  constructor(renderer) {
    this.renderer = renderer;
    this.flipflop = true;

    this.camera = new THREE.Camera();
    this.camera.position.z = 1;

    this.scene = new THREE.Scene();

    this.uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2(WIDTH, WIDTH) },
      texture: { type: "t", value: null }
    };

    this.passThroughShader = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec2 resolution;
        uniform float time;
        uniform sampler2D texture;

        void main() {
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          vec3 color = texture2D(texture, uv).xyz;
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.passThroughShader);
    this.scene.add(this.mesh);

    // var positionShader = new THREE.ShaderMaterial({

    //   uniforms: {
    //     time: { type: "f", value: 1.0 },
    //     delta: { type: "f", value: 0.0 },
    //     resolution: { type: "v2", value: new THREE.Vector2(WIDTH, WIDTH) },
    //     texturePosition: { type: "t", value: null },
    //     textureVelocity: { type: "t", value: null },
    //   },
    //   vertexShader: document.getElementById('vertexShader').textContent,
    //   fragmentShader: document.getElementById('fragmentShaderPosition').textContent

    // });

    // this.positionShader = positionShader;

    // var velocityShader = new THREE.ShaderMaterial({

    //   uniforms: {
    //     time: { type: "f", value: 1.0 },
    //     delta: { type: "f", value: 0.0 },
    //     resolution: { type: "v2", value: new THREE.Vector2(WIDTH, WIDTH) },
    //     texturePosition: { type: "t", value: null },
    //     textureVelocity: { type: "t", value: null },
    //     testing: { type: "f", value: 1.0 },
    //     seperationDistance: { type: "f", value: 1.0 },
    //     alignmentDistance: { type: "f", value: 1.0 },
    //     cohesionDistance: { type: "f", value: 1.0 },
    //     freedomFactor: { type: "f", value: 1.0 },
    //     predator: { type: "v3", value: new THREE.Vector3() }
    //   },
    //   defines: {
    //     WIDTH: WIDTH.toFixed(2)
    //   },
    //   vertexShader: document.getElementById('vertexShader').textContent,
    //   fragmentShader: document.getElementById('fragmentShaderVelocity').textContent

    // });

    // this.velocityUniforms = velocityShader.uniforms;

    // this.renderPosition = function(position, velocity, output, delta) {

    //   this.mesh.material = positionShader;
    //   positionShader.uniforms.texturePosition.value = position;
    //   positionShader.uniforms.textureVelocity.value = velocity;
    //   positionShader.uniforms.time.value = performance.now();
    //   positionShader.uniforms.delta.value = delta;
    //   renderer.render(scene, camera, output);
    //   this.currentPosition = output;

    // };

    // this.renderVelocity = function(position, velocity, output, delta) {

    //   this.mesh.material = velocityShader;
    //   velocityShader.uniforms.texturePosition.value = position;
    //   velocityShader.uniforms.textureVelocity.value = velocity;
    //   velocityShader.uniforms.time.value = performance.now();
    //   velocityShader.uniforms.delta.value = delta;
    //   renderer.render(scene, camera, output);
    //   this.currentVelocity = output;

    // };
  }

  init() {
    var dtPosition = this.generatePositionTexture(WIDTH * WIDTH);
    var dtVelocity = this.generateVelocityTexture(WIDTH * WIDTH);

    this.rtPosition1 = this.getRenderTarget(THREE.RGBAFormat);
    this.rtPosition2 = this.rtPosition1.clone();
    this.renderTexture(dtPosition, this.rtPosition1);
    this.renderTexture(this.rtPosition1, this.rtPosition2);

    this.rtVelocity1 = this.getRenderTarget(THREE.RGBFormat);
    this.rtVelocity2 = this.rtVelocity1.clone();
    this.renderTexture(dtVelocity, this.rtVelocity1);
    this.renderTexture(this.rtVelocity1, this.rtVelocity2);

    // this.velocityUniforms.testing.value = 10;
  }

  renderTexture(input, output) {
    this.mesh.material = this.passThroughShader;
    this.uniforms.texture.value = input;
    this.renderer.render(this.scene, this.camera, output);
  };

  getRenderTarget(type) {
    var renderTarget = new THREE.WebGLRenderTarget(WIDTH, WIDTH, {
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: type,
      type: THREE.FloatType,
      stencilBuffer: false
    });

    return renderTarget;
  }

  simulate(delta) {
    if (this.flipflop) {
      this.renderVelocity(this.rtPosition1, this.rtVelocity1, this.rtVelocity2, delta);
      this.renderPosition(this.rtPosition1, this.rtVelocity2, this.rtPosition2, delta);
    } else {
      this.renderVelocity(this.rtPosition2, this.rtVelocity2, this.rtVelocity1, delta);
      this.renderPosition(this.rtPosition2, this.rtVelocity1, this.rtPosition1, delta);
    }

    this.flipflop = ! this.flipflop;
  };

  generatePositionTexture(length) {
    var buffer = new Float32Array(length * 4);

    for (var k = 0, kl = buffer.length; k < kl; k += 4) {
      var x = (Math.random() - 0.5) * 2 * BOUNDS;
      var y = (Math.random() - 0.5) * 2 * BOUNDS;
      var z = (Math.random() - 0.5) * 2 * BOUNDS;

      buffer[ k + 0 ] = x;
      buffer[ k + 1 ] = y;
      buffer[ k + 2 ] = z;
      buffer[ k + 3 ] = 1;
    }

    var texture = new THREE.DataTexture(buffer, WIDTH, WIDTH, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;

    return texture;
  }

  generateVelocityTexture(length) {
    var buffer = new Float32Array(length * 3);

    for (var k = 0, kl = buffer.length; k < kl; k += 3) {
      var x = Math.random() - 0.5;
      var y = Math.random() - 0.5;
      var z = Math.random() - 0.5;

      buffer[ k + 0 ] = x * 10;
      buffer[ k + 1 ] = y * 10;
      buffer[ k + 2 ] = z * 10;
    }

    var texture = new THREE.DataTexture(buffer, WIDTH, WIDTH, THREE.RGBFormat, THREE.FloatType);
    texture.needsUpdate = true;

    return texture;
  }
}
