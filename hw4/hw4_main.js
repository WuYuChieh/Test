import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

import { Candle } from './hw4_class.js';

var camera, scene, renderer;
var candles = [];

function init() {
	
	renderer = new THREE.WebGLRenderer();
	document.body.appendChild(renderer.domElement);
	let width = window.innerWidth;
	let height = window.innerHeight;
	renderer.setSize(width, height);

	renderer.setClearColor(0xe9967a);

	scene = new THREE.Scene();
	var grid = new THREE.GridHelper(200, 20, 'red', 'white');
	//scene.add(grid);
	var axes = new THREE.AxesHelper(5);
	//scene.add(axes);

	camera = new THREE.PerspectiveCamera(35, width / height, 1, 10000);
	camera.position.set(150, 70, 0);
	
	let controls = new OrbitControls(camera, renderer.domElement);
	
	controls.enableKeys = false;

	window.addEventListener('resize', onWindowResize, false);
	////////////////////////////////////////////////////////////////
	let ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshPhongMaterial({
		color: 0x8b0000
	}));
	ground.rotation.x = -Math.PI / 2;
	
	var candle0 = new Candle(0, 0, 0);
	var candle1 = new Candle(-40, 40, 1);
	var candle2 = new Candle(-40, 0, 2);
	var candle3 = new Candle(-40, -40, 3);
	var candle4 = new Candle(0, 40, 4);
	var candle5 = new Candle(0, -40, 5);
	candles.push(candle0, candle1, candle2, candle3, candle4, candle5);
	scene.add(ground);
}

function onWindowResize() {

	let width = window.innerWidth;
	let height = window.innerHeight;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
}

function update(evt) {	///keyboard.ver///

	if (evt.key == 1) 
		candles[0].flameOut();
	if (evt.key == 2) 
		candles[1].flameOut();
	if (evt.key == 3) 
		candles[2].flameOut();
	if (evt.key == 4) 
		candles[3].flameOut();
	if (evt.key == 5) 
		candles[4].flameOut();
	if (evt.key == 6) 
		candles[5].flameOut();
}

function animate() {
	
	window.onkeydown = function(evt){
		var evt = window.event?window.event:evt;
		update(evt);
	}
	
	requestAnimationFrame(animate);
	render();
	
	let cameraRoot = camera.position.clone();
    cameraRoot.y = 0;
	candles.forEach(function(t){t.candle.children[0].lookAt(cameraRoot)});
}

function render() {

	renderer.render(scene, camera);
}

export {init, animate, scene};