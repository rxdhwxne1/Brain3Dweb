"use strict";

// Import only what you need, to help your bundler optimize final code size using tree shaking
// see https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)

import {
    ArrowHelper,
    BoxGeometry,
    Clock,
    ConeGeometry,
    Line,
    Mesh,
    MeshNormalMaterial,
    PerspectiveCamera,
    Raycaster,
    RectAreaLight,
    Scene,
    SRGBColorSpace,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer
} from 'three';
import {color} from "./utils/color.js";
import {move_camera_with_color} from "./utils/move_camera.js";
import ThreeMeshUI from 'three-mesh-ui';
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
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Interface, button} from "./interface.js";
import trad_intro from "./data/intro_interface.json";
// Example of hard link to official repo for data, if needed
// const MODEL_PATH = 'https://raw.githubusercontent.com/mrdoob/js/r148/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb';


// INSERT CODE HERE

const scene = new Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new PerspectiveCamera(75, aspect, 0.1, 1000);

const rectLight1 = new RectAreaLight(0xffffff, 5, 5, 5);
rectLight1.position.set(0, 5, 0); // Au-dessus de l'objet
rectLight1.lookAt(0, 0, 0);
scene.add(rectLight1);

const rectLight2 = new RectAreaLight(0xffffff, 5, 5, 5);
rectLight2.position.set(0, -5, 0); // En dessous de l'objet
rectLight2.lookAt(0, 0, 0);
scene.add(rectLight2);

const rectLight3 = new RectAreaLight(0xffffff, 5, 5, 5);
rectLight3.position.set(5, 0, 0); // À droite de l'objet
rectLight3.lookAt(0, 0, 0);
scene.add(rectLight3);

const rectLight4 = new RectAreaLight(0xffffff, 5, 5, 5);
rectLight4.position.set(-5, 0, 0); // À gauche de l'objet
rectLight4.lookAt(0, 0, 0);
scene.add(rectLight4);


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

function brain_loader() {
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
}


//renderer.physicallyCorrectLights = true //deprecated
renderer.useLegacyLights = false //use this instead of setting physicallyCorrectLights=true property
renderer.shadowMap.enabled = false
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

controls.enableDamping = true

renderer.domElement.addEventListener('click', onDoubleClick, false)

renderer.domElement.addEventListener('mousemove', onMouseMove, false)

renderer.domElement.addEventListener('mousedown', () => {
    let intersect;

    if (mouse.x !== null && mouse.y !== null) {

        raycaster.setFromCamera(mouse, camera);

        intersect = raycast();
    }

    if (intersect && intersect.object.isUI) {
        selectState = true;  // Mark as selected (or clicked)
        intersect.object.setState('selected');  // Change state to selected
    }

});

renderer.domElement.addEventListener('mouseup', () => {
    selectState = false;  // Reset the select state when the mouse button is released
});


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
        console.log(n)
    }
}


//extracted().forEach((element) => {
//    scene.add(element)
//r})


function getColor(intersect, texture, sampleSize = 5) {
    // Créer un tableau pour stocker les couleurs échantillonnées
    const uv = intersect.uv;

    // Créer un canvas pour échantillonner la texture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    context.drawImage(texture.image, 0, 0);

    // Échantillonner la texture autour de l'intersection
    const x = Math.floor(uv.x * canvas.width);
    const y = Math.floor((1 - uv.y) * canvas.height); // Inverser l'axe Y
    const imageData = context.getImageData(x, y, sampleSize, sampleSize);

    // get the pixel data
    const data = imageData.data;
    console.log(data[0], data[1], data[2]);
    // get the color for this pixel
    return new color(data[0], data[1], data[2]);
}

const textureLoader = new TextureLoader();
const texture = textureLoader.load(
    'assets/Brain_Texture.jpeg',
    () => {
        console.log('Texture loaded successfully:', texture);
    },
    undefined,  // Optional: onProgress function (can be left as undefined)
    (error) => {
        console.error('Error loading texture:', error); // Log any loading error
    }
);

let animation_camera;

// Utilisation dans votre événement de clic
function onDoubleClick(event) {
    mouse.set(
        (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(sceneMeshes, false);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        const object = intersect.object;

        if (object.material.map) {
            const dominantColor = getColor(intersect, texture);
            console.log("camera position: ", camera.position);
            animation_camera = new move_camera_with_color(dominantColor, camera).move_to();
            console.log(`Couleur dominante à l'intersection : ${dominantColor}`);
        } else {
            console.error('L\'objet n\'a pas de texture');
        }
    }
}

function onClick(event) {
    mouse.set(
        (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    const textExists = intersects.some(intersect => intersect.object === text);

    if (text && !textExists) {
        scene.remove(text);
        text = null; // Clear the reference
        console.log('Texte supprimé');
    }
}

window.addEventListener('dblclick', onDoubleClick); 
window.addEventListener('click', onClick); 

// Renderer color space setting
renderer.outputEncoding = SRGBColorSpace;


new Interface(camera, scene, brain_loader,JSON.parse(JSON.stringify(trad_intro)));


camera.position.z = 3;


const clock = new Clock();

let selectState = false;

function updateButtons() {
    let intersect;

    if (mouse.x !== null && mouse.y !== null) {

        raycaster.setFromCamera(mouse, camera);

        intersect = raycast();

    }


    if (intersect && intersect.object.isUI) {

        if (selectState) {

            // Component.setState internally call component.set with the options you defined in component.setupState
            intersect.object.setState('selected');

        } else {

            // Component.setState internally call component.set with the options you defined in component.setupState
            intersect.object.setState('hovered');

        }

    }

    // Update non-targeted buttons state

    button.forEach((obj) => {

        if ((!intersect || obj !== intersect.object) && obj.isUI) {

            // Component.setState internally call component.set with the options you defined in component.setupState
            obj.setState('idle');

        }

    });

}


function raycast() {
    // Perform the raycast
    return button.reduce((closestIntersection, obj) => {

        const intersection = raycaster.intersectObject(obj, true);

        if (!intersection[0]) return closestIntersection;

        if (!closestIntersection || intersection[0].distance < closestIntersection.distance) {

            intersection[0].object = obj;

            return intersection[0];

        }

        return closestIntersection;

    }, null);
}


// Main loop
const animation = () => {

    renderer.setAnimationLoop(animation); // requestAnimationFrame() replacement, compatible with XR
    try {
        ThreeMeshUI.update();
    } catch (e) {
        ThreeMeshUI.update();
    }


    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // can be used in shaders: uniforms.u_time.value = elapsed;


    cube.rotation.x = elapsed / 2;
    cube.rotation.y = elapsed / 1;
    if (animation_camera) animation_camera.update();
    updateButtons();


    renderer.render(scene, camera);
};

animation();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
