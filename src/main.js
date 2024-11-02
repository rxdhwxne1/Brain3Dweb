"use strict";
import {
    ArrowHelper,
    AudioListener,
    BoxGeometry,
    Clock,
    Line,
    MeshNormalMaterial,
    PerspectiveCamera,
    Raycaster,
    Scene,
    SRGBColorSpace,
    Vector2,
    Vector3,
    WebGLRenderer
} from 'three';
import {getColor} from "./utils/color.js";
import {move_camera_with_color} from "./utils/move_camera.js";
import ThreeMeshUI from 'three-mesh-ui';

import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {button, Interface, sceneMeshes} from "./interface.js";
import trad_intro from "./data/intro_interface.json" with {type: "json"};
import {addlight} from "./utils/light.js";
import {brain_loader, mixer_1, mixer_2, texture} from "./utils/load_model_texture.js";

const env = import.meta.env.MODE; // 'development', 'production', 'test'
if (env === 'production') {
    console.log = function () {
    }
}


export const scene = new Scene();
const aspect = window.innerWidth / window.innerHeight;
export const listener = new AudioListener();
export const camera = new PerspectiveCamera(75, aspect, 0.1, 1000);
camera.add(listener);


addlight(scene);


const raycaster = new Raycaster();
const mouse = new Vector2();

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window); // optional

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshNormalMaterial();


renderer.useLegacyLights = false
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
        controls.enabled = false;
        selectState = true;
        intersect.object.setState('selected');
    } else {

        controls.enabled = true;
    }

});

renderer.domElement.addEventListener('mouseup', () => {
    controls.enabled = true;
    selectState = false;
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


export let animation_camera = []
let interface_text;


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


const animation = () => {

    renderer.setAnimationLoop(animation);
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
