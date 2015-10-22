import THREE from 'three';
import sortPoints from './sortPoints';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.z = 1000;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.domElement.style.position = 'fixed';
renderer.domElement.style.left = '0px';
renderer.domElement.style.top = '0px';

document.body.appendChild(renderer.domElement);

import Flock from './Flock';

const f = new Flock();

f.scale.x = 3;
f.scale.y = 3;
f.scale.z = 3;

for (let i = 0; i < 10; i++) {
  f.addStarling();
}

scene.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 32), new THREE.MeshPhongMaterial()));
const l = new THREE.DirectionalLight(0xffffff);
l.position.y = 10000;
l.position.z = 100;

scene.add(l);
scene.add(f);

function render() {
  sortPoints(f.children[0], camera);
  f.rotation.x += 0.01;
  f.rotation.y += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
