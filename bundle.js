(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Starling = require('./Starling');

var _Starling2 = _interopRequireDefault(_Starling);

var Flock = (function (_THREE$Object3D) {
  _inherits(Flock, _THREE$Object3D);

  function Flock() {
    _classCallCheck(this, Flock);

    _get(Object.getPrototypeOf(Flock.prototype), 'constructor', this).call(this);
    this.starlings = [];

    var len = 200;

    for (var i = 0; i < len; i++) {
      this.addStarling();
    }
  }

  _createClass(Flock, [{
    key: 'addStarling',
    value: function addStarling() {
      var starling = new _Starling2['default'](this.starlings);
      this.starlings.push(starling);
      this.add(starling.mesh);
    }
  }, {
    key: 'update',
    value: function update() {
      this.starlings.forEach(function (starling) {
        starling.update();
      });
    }
  }]);

  return Flock;
})(THREE.Object3D);

exports['default'] = Flock;
module.exports = exports['default'];

},{"./Starling":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function random(scale) {
  return (Math.random() - 0.5) * 2 * (scale || 1);
}

function randomVec3(magnitude) {
  return new THREE.Vector3(random(), random(), random()).normalize().multiplyScalar(magnitude || 1);
}

var Starling = (function () {
  function Starling(starlings) {
    _classCallCheck(this, Starling);

    this.position = randomVec3(500);
    this.velocity = randomVec3();

    this.maxSpeed = 100 + random(50);
    this.maxForce = 20 + random(10);
    this.recognizableDistance = 200 + random(50);
    this.neighbourDistance = 50;
    this.neighbourEndurance = 10 + random(5);
    this.maxDistanceFromHome = 1000 + random(100);

    this.starlings = starlings;
    this.mesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 5, 30).rotateX(Math.PI / 2), new THREE.MeshPhongMaterial({
      color: 0xcccccc
    }));
    this.mesh.position.copy(this.position);
    this.mesh.up.set(0, 0, 1);
  }

  _createClass(Starling, [{
    key: "update",
    value: function update() {
      var force = new THREE.Vector3(),
          sep = this.separate(),
          ali = this.align(),
          coh = this.cohesion(),
          hom = this.homing();

      force.add(sep.multiplyScalar(0.1));
      force.add(ali.multiplyScalar(0.15));
      force.add(coh.multiplyScalar(0.05));
      force.add(hom.multiplyScalar(0.15));

      this.velocity.add(force);

      var vLength = this.velocity.length();
      if (vLength > this.maxSpeed) {
        this.velocity.multiplyScalar(this.maxSpeed / vLength);
      }

      this.position.add(this.velocity);
      this.mesh.position.copy(this.position);

      var direction = this.velocity.clone();
      this.mesh.lookAt(direction.normalize().add(this.position));
    }
  }, {
    key: "separate",
    value: function separate() {
      var len = this.starlings.length;
      var steer = new THREE.Vector3();

      for (var i = 0; i < len; i++) {
        var distance = new THREE.Vector3();
        distance.subVectors(this.starlings[i].position, this.position);
        if (distance.length() > this.recognizableDistance) continue;

        if (distance.length() < this.neighbourDistance - this.neighbourEndurance) {
          steer.add(distance.multiplyScalar(-1));
        }
      }

      steer.normalize().multiplyScalar(this.maxSpeed);

      steer.sub(this.velocity);

      var sLength = steer.length();
      if (sLength > this.maxForce) {
        steer.multiplyScalar(this.maxForce / sLength);
      }

      return steer;
    }
  }, {
    key: "align",
    value: function align() {
      var len = this.starlings.length;
      var steer = new THREE.Vector3();

      for (var i = 0; i < len; i++) {
        var distance = new THREE.Vector3();
        distance.subVectors(this.starlings[i].position, this.position);
        if (distance.length() > this.recognizableDistance) continue;

        steer.add(this.starlings[i].velocity);
      }

      steer.normalize().multiplyScalar(this.maxSpeed);

      steer.sub(this.velocity);

      var sLength = steer.length();
      if (sLength > this.maxForce) {
        steer.multiplyScalar(this.maxForce / sLength);
      }

      return steer;
    }
  }, {
    key: "cohesion",
    value: function cohesion() {
      var len = this.starlings.length;
      var steer = new THREE.Vector3();

      for (var i = 0; i < len; i++) {
        var distance = new THREE.Vector3();
        distance.subVectors(this.starlings[i].position, this.position);
        if (distance.length() > this.recognizableDistance) continue;

        if (distance.length() > this.neighbourDistance + this.neighbourEndurance) {
          steer.add(distance);
        }
      }

      steer.normalize().multiplyScalar(this.maxSpeed);

      steer.sub(this.velocity);

      var sLength = steer.length();
      if (sLength > this.maxForce) {
        steer.multiplyScalar(this.maxForce / sLength);
      }

      return steer;
    }
  }, {
    key: "homing",
    value: function homing() {
      var steer = new THREE.Vector3();

      var distance = new THREE.Vector3();
      distance.sub(this.position);

      if (distance.length() > this.maxDistanceFromHome) {
        steer.copy(distance);
        steer.normalize().multiplyScalar(this.maxSpeed);
      }

      steer.sub(this.velocity);

      var sLength = steer.length();
      if (sLength > this.maxForce) {
        steer.multiplyScalar(this.maxForce / sLength);
      }

      return steer;
    }
  }]);

  return Starling;
})();

exports["default"] = Starling;
module.exports = exports["default"];

},{}],3:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Flock = require('./Flock');

var _Flock2 = _interopRequireDefault(_Flock);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.z = 1500;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x428ED0, 0.2);

window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

renderer.domElement.style.position = 'fixed';
renderer.domElement.style.left = '0px';
renderer.domElement.style.top = '0px';

document.body.appendChild(renderer.domElement);

var f = new _Flock2['default']();

var sunlight = new THREE.DirectionalLight(new THREE.Color(0x428ED0).lerp(new THREE.Color(0xffffff), 0.2));
sunlight.position.x = 1;
sunlight.position.y = 1;
sunlight.position.z = 1;

var backlight = new THREE.DirectionalLight(0x428ED0, 0.3);
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

},{"./Flock":1}]},{},[3]);
