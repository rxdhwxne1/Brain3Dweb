"use strict";

// Import only what you need, to help your bundler optimize final code size using tree shaking
// see https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)

import {
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    BoxGeometry,
    Mesh,
    MeshNormalMaterial,
    AmbientLight,
    Clock, AxesHelper, ArrowHelper, Vector3, Line, Object3D, ConeGeometry, RectAreaLight
} from 'three';

// If you prefer to import the whole library, with the THREE prefix, use the following line instead:
// import * as THREE from 'three'

// NOTE: three/addons alias is supported by Rollup: you can use it interchangeably with three/examples/jsm/  

// Importing Ammo can be tricky.
// Vite supports webassembly: https://vitejs.dev/guide/features.html#webassembly
// so in theory this should work:
//
// import ammoinit from 'three/addons/libs/ammo.wasm.js?init';
// ammoinit().then((AmmoLib) => {
//  Ammo = AmmoLib.exports.Ammo()
// })
//
// But the Ammo lib bundled with the THREE js examples does not seem to export modules properly.
// A solution is to treat this library as a standalone file and copy it using 'vite-plugin-static-copy'.
// See vite.config.js
// 
// Consider using alternatives like Oimo or cannon-es
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';

import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import {Raycaster, Vector2, MeshBasicMaterial} from 'three';
import {RectAreaLightHelper} from "three/examples/jsm/helpers/RectAreaLightHelper.js";
// Example of hard link to official repo for data, if needed
// const MODEL_PATH = 'https://raw.githubusercontent.com/mrdoob/js/r148/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb';


// INSERT CODE HERE

const scene = new Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new PerspectiveCamera(75, aspect, 0.1, 1000);

const light = new AmbientLight(0xffffff, 1);
scene.add(light);

const rectLight1 = new RectAreaLight(0xffffff, 10, 4, 10);
rectLight1.position.set(-5, 5, 5);
rectLight1.lookAt(0, 0);
scene.add(rectLight1);

const rectLight2 = new RectAreaLight(0xffffff, 10, 4, 10);
rectLight2.position.set(0, -5, 5);
rectLight2.lookAt(0, 0);
scene.add(rectLight2);

const rectLight3 = new RectAreaLight(0xffffff, 10, 4, 10);
rectLight3.position.set(5, 5, -10);
rectLight3.lookAt(0, 0);
scene.add(rectLight3);


const rectLight4 = new RectAreaLight(0xffffff, 10, 4, 10);
rectLight4.position.set(-5, 5, -10);
rectLight4.lookAt(0, 0);
scene.add(rectLight4);


scene.add( new RectAreaLightHelper( rectLight1 ) );
scene.add( new RectAreaLightHelper( rectLight2 ) );
scene.add( new RectAreaLightHelper( rectLight3 ) );
scene.add( new RectAreaLightHelper( rectLight4 ) );



const raycaster = new Raycaster();
const mouse = new Vector2();

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window); // optional

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshNormalMaterial();
const cube = new Mesh(geometry, material);
let sceneMeshes = []

//scene.add(cube);
const loader = new GLTFLoader()
loader.load('assets/models/brain_project.glb', function (gltf) {
    gltf.scene.traverse(function (child) {
           sceneMeshes.push(child)
            scene.add(gltf.scene);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log('An error happened');
        });
});



//renderer.physicallyCorrectLights = true //deprecated
renderer.useLegacyLights = false //use this instead of setting physicallyCorrectLights=true property
renderer.shadowMap.enabled = false
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

controls.enableDamping = true

renderer.domElement.addEventListener('click', onDoubleClick, false)

renderer.domElement.addEventListener('mousemove', onMouseMove, false)


const coneGeometry = new ConeGeometry(0.05, 0.2, 8)
const arrowHelper = new ArrowHelper(
    new Vector3(),
    new Vector3(),
    .25,
    0xffff00)
scene.add(arrowHelper)
const line = new Line(geometry, material)

function onMouseMove(event) {
    mouse.set((event.clientX / renderer.domElement.clientWidth) * 2 - 1, -(event.clientY / renderer.domElement.clientHeight) * 2 + 1)

    // console.log(mouse)

    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObjects(sceneMeshes, false)

    if (intersects.length > 0) {
        //console.log(sceneMeshes.length + " " + intersects.length)
        //console.log(intersects[0])
        //console.log(intersects[0].object.userData.name + " " + intersects[0].distance + " ")
        //console.log((intersects[0].face).normal)
        line.position.set(0, 0, 0)
        line.lookAt((intersects[0].face).normal)
        line.position.copy(intersects[0].point)

        const n = new Vector3()
        n.copy((intersects[0].face).normal)
        n.transformDirection(intersects[0].object.matrixWorld)

        arrowHelper.setDirection(n)
        arrowHelper.position.copy(intersects[0].point)
    }
}

function onDoubleClick(event) {
   // console.log("double click")
    mouse.set((event.clientX / renderer.domElement.clientWidth) * 2 - 1, -(event.clientY / renderer.domElement.clientHeight) * 2 + 1)
    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObjects(sceneMeshes, false)

    if (intersects.length > 0) {
        const n = new Vector3()
        n.copy((intersects[0].face).normal)
        n.transformDirection(intersects[0].object.matrixWorld)

        // const cube = new THREE.Mesh(boxGeometry, material)
        const cube = new Mesh(coneGeometry, material)

        const object = intersects[0].object;
        const uv = intersects[0].uv;
        console.log(object)
        if (object.material.map) {
            const texture = object.material.map;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Draw the texture onto the canvas
            canvas.width = texture.image.width;
            canvas.height = texture.image.height;
            context.drawImage(texture.image, 0, 0);

            // Use the UV coordinates to get the color data from the canvas
            const x = Math.floor(uv.x * canvas.width);
            const y = Math.floor((1 - uv.y) * canvas.height); // UV origin is at top-left, but canvas origin is at bottom-left
            const imageData = context.getImageData(x, y, 1, 1);
            const data = imageData.data;

            // Log the color data
            console.log(`Color at intersection point: rgb(${data[0]}, ${data[1]}, ${data[2]})`);
        }
    }

    cube.lookAt(n)
    cube.rotateX(Math.PI / 2)
    cube.position.copy(intersects[0].point)
    cube.position.addScaledVector(n, 0.1)

    scene.add(cube)
    sceneMeshes.push(cube)

}


function gltfReader(gltf) {
    let testModel = null;

    testModel = gltf.scene;

    if (testModel != null) {
        console.log("Model loaded:  " + testModel);
        scene.add(gltf.scene);
    } else {
        console.log("Load FAILED.  ");
    }
}



camera.position.z = 3;


const clock = new Clock();

// Main loop
const animation = () => {

    renderer.setAnimationLoop(animation); // requestAnimationFrame() replacement, compatible with XR

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // can be used in shaders: uniforms.u_time.value = elapsed;


    cube.rotation.x = elapsed / 2;
    cube.rotation.y = elapsed / 1;



    renderer.render(scene, camera);
};

animation();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
