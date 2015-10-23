import THREE from 'THREE';
import SimulationRenderer from './SimulationRenderer';

let last = performance.now();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
camera.position.z = 350;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffffff, 100, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(scene.fog.color);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.domElement.style.position = 'fixed';
renderer.domElement.style.left = '0px';
renderer.domElement.style.top = '0px';

document.body.appendChild(renderer.domElement);
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  var now = performance.now();
  var delta = (now - last) / 1000;

  if (delta > 1) delta = 1; // safety cap on large deltas
  last = now;

  // renderer.render(scene, camera);
}

scene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 32), new THREE.MeshPhongMaterial()));
var simulator = new SimulationRenderer(renderer);
simulator.init();

animate();
