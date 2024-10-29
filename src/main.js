"use strict";

// Import only what you need, to help your bundler optimize final code size using tree shaking
// see https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)

import {
    AnimationMixer,
    ArrowHelper,
    BoxGeometry,
    Clock,
    HemisphereLight,
    Line,
    LoopOnce,
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
import {button, Interface, sceneMeshes} from "./interface.js";

import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import trad_intro from "./data/intro_interface.json" with {type: "json"};
import Death from "./sounds/Death.mp3";
import sound_info from "./sounds/info.mp3";
import Damage from "./sounds/Damage.mp3";
import Chute from "./sounds/Chute.mp3";
import Dead_body_hitting from "./sounds/Dead_body_hitting.mp3";

// Example of hard link to official repo for data, if needed
// const MODEL_PATH = 'https://raw.githubusercontent.com/mrdoob/js/r148/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb';
// get env mode
const env = import.meta.env.MODE; // 'development', 'production', 'test'
if (env === 'production') {
    console.log = function () {
    }
}

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

const rectLight5 = new HemisphereLight(0xffffbb, 0x080820, 3);
scene.add(rectLight5);


const raycaster = new Raycaster();
const mouse = new Vector2();

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window); // optional

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshNormalMaterial();

const loader2 = new TextureLoader();
loader2.load('assets/ml-reseau-neurones.png', (texture) => {
    scene.background = texture;
});

const loader = new GLTFLoader();


let mixer_1;
let mixer_2

function esteban_loader() {
    return new Promise((resolve, reject) => {
        loader.load('assets/models/animation_dying_5.glb', function (gltf) {
            animation_camera.push(new move_camera_with_color(new color(0, 0, 0), camera, scene).move_with_position({
                x: 0,
                y: 10,
                z: 15
            }, 0));
            const sound = new Audio(Death);
            sound.play();
            const model = gltf.scene;
            const animations = gltf.animations;
            mixer_1 = new AnimationMixer(model);
            mixer_2 = new AnimationMixer(model);
            const sound2 = new Audio(Chute);
            const sound3 = new Audio(Dead_body_hitting);
            mixer_1.addEventListener('finished', () => {
                    sound2.pause();
                    scene.remove(model);
                    return resolve();
                }
            );
            // wait 1 second before playing the animation
            const action = mixer_1.clipAction(animations[0]);
            let soundPlayed = false;

            // Start checking if the animation has started
            const checkAnimationStart = setInterval(() => {
                if (!soundPlayed && action.time > 2.3) {
                    sound2.play();
                    soundPlayed = true;
                } else if (soundPlayed && action.time > 3.3) {
                    const sound = new Audio(Damage);
                    sound.play();
                    clearInterval(checkAnimationStart);
                }
            }, 10);
            action.play();

            const action2 = mixer_2.clipAction(animations[1]);
            setTimeout(() => action2.play(), 900);

            let soundPlayed2 = false;

            const checkAnimationStart2 = setInterval(() => {
                if (!soundPlayed2 && action2.time > 0.5) {
                    sound3.play();
                    soundPlayed2 = true;
                    clearInterval(checkAnimationStart2);
                }
            }, 10);


            // Add event listener for the end of the animation
            action.clampWhenFinished = true;
            action.loop = LoopOnce;
            action.timeScale = 1;

            action2.clampWhenFinished = true;
            action2.loop = LoopOnce
            action2.timeScale = 1.5;


            scene.add(model);


        }, function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, function (error) {
            console.error('An error happened', error);
        });

    });
}

function brain_loader() {
    esteban_loader().then(() => {

        loader.load('assets/models/brain_project.glb', function (gltf) {
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    sceneMeshes.push(child);
                }
            });
            scene.add(gltf.scene);
            const sound = new Audio(sound_info);
            animation_camera.push(new move_camera_with_color(new color(0, 0, 0), camera, scene).move_with_position({
                x: 0,
                y: 0,
                z: 3
            }, 0));
            sound.volume = 0.1;
            sound.play();

        }, function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, function (error) {
            console.error('An error happened', error);
        });
    });


}

//renderer.physicallyCorrectLights = true //deprecated
renderer.useLegacyLights = false //use this instead of setting physicallyCorrectLights=true property
renderer.shadowMap.enabled = false
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

controls.enableDamping = true

renderer.domElement.addEventListener('click', Click, false)

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


const arrowHelper = new ArrowHelper(new Vector3(), new Vector3(), .25, 0xffff00)
scene.add(arrowHelper)
const line = new Line(geometry, material)

function onMouseMove(event) {
    mouse.set((event.clientX / renderer.domElement.clientWidth) * 2 - 1, -(event.clientY / renderer.domElement.clientHeight) * 2 + 1)


    raycaster.setFromCamera(mouse, camera)

    const intersects = raycast(sceneMeshes)

    if (intersects) {
        line.position.set(0, 0, 0)
        line.lookAt((intersects.face).normal)
        line.position.copy(intersects.point)

        const n = new Vector3()
        n.copy((intersects.face).normal)
        n.transformDirection(intersects.object.matrixWorld)

        arrowHelper.setDirection(n)
        arrowHelper.position.copy(intersects.point)
    }
}


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
const texture = textureLoader.load('assets/Brain_Texture.jpeg', () => {
        console.log('Texture loaded successfully:', texture);
    }, undefined,  // Optional: onProgress function (can be left as undefined)
    (error) => {
        console.error('Error loading texture:', error); // Log any loading error
    });

export let animation_camera = []
let interface_text;

// Utilisation dans votre événement de clic
function Click(event) {
    mouse.set((event.clientX / renderer.domElement.clientWidth) * 2 - 1, -(event.clientY / renderer.domElement.clientHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycast(sceneMeshes);

    if (intersects) {
        const intersect = intersects;
        const object = intersect.object;

        if (object.material.map) {
            animation_camera = [];
            const dominantColor = getColor(intersect, texture);
            console.log("couleur dominante: ", dominantColor);
            console.log("camera position: ", camera.position);
            interface_text = new move_camera_with_color(dominantColor, camera, scene);
            let move;
            try {
                move = interface_text.move_to();
            } catch (e) {
                console.error("Error in animation");
                return;
            }
            animation_camera.push(move);
            console.log(`Couleur dominante à l'intersection : ${dominantColor}`);
        } else {
            console.error('L\'objet n\'a pas de texture');
        }
    }
}


// Renderer color space setting
renderer.outputEncoding = SRGBColorSpace;


new Interface({
    x: camera.position.x, y: camera.position.y, z: camera.position.z + 1.6
}, scene, JSON.parse(JSON.stringify(trad_intro)), brain_loader);


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
    if (intersect === null) {
        // Component.setState internally call component.set with the options you defined in component.setupState
        return;
    }

    // Update non-targeted buttons state

    button.forEach((obj) => {

        if ((!intersect || obj !== intersect.object) && obj.isUI) {

            // Component.setState internally call component.set with the options you defined in component.setupState
            obj.setState('idle');

        }

    });

}


function raycast(func = button) {
    // Perform the raycast
    return func.reduce((closestIntersection, obj) => {
        let intersection;
        try {
            intersection = raycaster.intersectObject(obj, true);
        } catch (e) {
            console.log(e);
            return null;
        }

        if (!intersection[0]) return closestIntersection;

        if (!closestIntersection || intersection[0].distance < closestIntersection.distance) {

            intersection[0].object = obj;

            return intersection[0];

        }

        return closestIntersection;

    }, null);
}

let lastElapsedTime = 0
// Main loop
const animation = () => {

    renderer.setAnimationLoop(animation); // requestAnimationFrame() replacement, compatible with XR
    try {
        ThreeMeshUI.update();
    } catch (e) {
        ThreeMeshUI.update();
    }

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    if (animation_camera.length > 0) {
        animation_camera.forEach((anim) => {
            try {
                anim.update();
            } catch (e) {
                animation_camera = animation_camera.filter((a) => a !== anim);
            }
        });
    }
    updateButtons();

    if (mixer_1) {
        mixer_1.update(deltaTime)
    }
    if (mixer_2) {
        mixer_2.update(deltaTime)
    }

    renderer.render(scene, camera);
};

animation();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
