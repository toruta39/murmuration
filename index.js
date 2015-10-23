const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.z = 1500;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x428ED0, 0.2);

window.onresize = function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

renderer.domElement.style.position = 'fixed';
renderer.domElement.style.left = '0px';
renderer.domElement.style.top = '0px';

document.body.appendChild(renderer.domElement);

import Flock from './Flock';

const f = new Flock();

const sunlight = new THREE.DirectionalLight(new THREE.Color(0x428ED0).lerp(new THREE.Color(0xffffff), 0.2));
sunlight.position.x = 1;
sunlight.position.y = 1;
sunlight.position.z = 1;

const backlight = new THREE.DirectionalLight(0x428ED0, 0.3);
backlight.position.x = -1;
backlight.position.y = -1;
backlight.position.z = -1;

scene.add(sunlight);
scene.add(backlight);
scene.add(f);

function render() {
  f.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
