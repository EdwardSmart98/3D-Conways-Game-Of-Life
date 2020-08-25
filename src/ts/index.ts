import * as THREE from "three";
import { OrbitControls } from './lib/orbitControls';
import Stats from "stats.js";
import { CellMap } from "./cellMap";
import { Values } from "./values";

let container: HTMLDivElement;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;

let lastUpdateTime = 0;

const on: number[] = [];
for (let i = 0; i < Values.size * Values.size; i++) {
    if (Math.random() > 0.8) {
        on.push(i);

    }
}

let cellmap : CellMap;
//Display FPS
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);
init();
animate();


function init() {
    container = document.createElement('div');

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight);
    camera.position.setZ(Values.size);
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);


    cellmap = new CellMap(Values.size, on, scene);
    console.log(cellmap);
    cellmap.drawMap();
    //Add light to the scene
    const DirectionalLight = new THREE.DirectionalLight(0x0F0F0F, 10);
    DirectionalLight.position.setZ(2);
    DirectionalLight.position.setY(2);
    DirectionalLight.rotation.set(0, 0, -Math.PI / 2);
    scene.add(DirectionalLight);

    window.addEventListener("resize", onWindowResize, false);
    container.appendChild(renderer.domElement);
    document.body.appendChild(container);

    controls = new OrbitControls(camera, renderer.domElement);
}

function animate() {

    stats.begin();
    requestAnimationFrame(animate);
    render();
    stats.end();
}

function render() {
    if (controls) {
        controls.update();
    }

    if(performance.now() - lastUpdateTime > Values.msBetweenUpdate){
        lastUpdateTime = performance.now();
        cellmap.stepForward();
        cellmap.drawMap();
    }

    renderer.clear();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}