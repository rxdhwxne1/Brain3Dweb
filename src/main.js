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
    WebGLRenderer,
    AmbientLight,
    Color,
    CylinderGeometry,
    HemisphereLight,
    Mesh,
    MeshPhongMaterial,
    MeshBasicMaterial
} from 'three';
import {getColor} from "./utils/color.js";
import {move_camera_with_color} from "./utils/move_camera.js";
import ThreeMeshUI from 'three-mesh-ui';
import { XRButton } from 'three/addons/webxr/XRButton.js';
import { RingGeometry, Matrix4 } from 'three';

import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {button, Interface, sceneMeshes} from "./interface.js";
import trad_intro from "./data/intro_interface.json" with {type: "json"};
import {addlight} from "./utils/light.js";
import {brain_loader, mixer_1, mixer_2, texture} from "./utils/load_model_texture.js";

// XR Emulator
import { DevUI } from '@iwer/devui';
import { XRDevice, metaQuest3 } from 'iwer';

  
import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

export const scene = new Scene();
const aspect = window.innerWidth / window.innerHeight;
export const listener = new AudioListener();
export const camera = new PerspectiveCamera(75, aspect, 0.1, 1000);
camera.add(listener);

addlight(scene);


const raycaster = new Raycaster();
const mouse = new Vector2();

const renderer = new WebGLRenderer();
renderer.xr.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

document.body.appendChild(XRButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

let reticle, hitTestSource = null, hitTestSourceRequested = false;

reticle = new Mesh(
    new RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    new MeshBasicMaterial({ color: 0xffffff })
);
reticle.matrixAutoUpdate = false;
reticle.visible = false;
scene.add(reticle);

async function setupXR(xrMode) {
    if (xrMode === 'immersive-vr' || xrMode === 'immersive-ar') {
        let nativeWebXRSupport = false;
        if (navigator.xr) {
            nativeWebXRSupport = await navigator.xr.isSessionSupported(xrMode);
        }

        if (!nativeWebXRSupport) {
            const xrDevice = new XRDevice(metaQuest3);
            xrDevice.installRuntime();
            xrDevice.fovy = (75 / 180) * Math.PI;
            xrDevice.ipd = 0;
            window.xrdevice = xrDevice;
            xrDevice.controllers.right.position.set(0.15649, 1.43474, -0.38368);
            xrDevice.controllers.right.quaternion.set(
                0.14766305685043335,
                0.02471366710960865,
                -0.0037767395842820406,
                0.9887216687202454,
            );
            xrDevice.controllers.left.position.set(-0.15649, 1.43474, -0.38368);
            xrDevice.controllers.left.quaternion.set(
                0.14766305685043335,
                0.02471366710960865,
                -0.0037767395842820406,
                0.9887216687202454,
            );
            new DevUI(xrDevice);
        }
        if (renderer.xr.isPresenting) {
            camera.position.set(0, 1.6, 0);
        }
    }
}

await setupXR('immersive-vr');

async function setupXRSession(session) {
    const referenceSpace = await session.requestReferenceSpace('viewer');
    hitTestSource = await session.requestHitTestSource({ space: referenceSpace });

    session.addEventListener('end', () => {
        hitTestSourceRequested = false;
        hitTestSource = null;
    });

    hitTestSourceRequested = true;
}

const env = import.meta.env.MODE; // 'development', 'production', 'test'
if (env === 'production') {
    console.log = function () {
    }
}

function animate(timestamp, frame) {
    if (frame && hitTestSource) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const hitTestResults = frame.getHitTestResults(hitTestSource);

        if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            reticle.visible = true;
            reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
        } else {
            reticle.visible = false;
        }
    }

    renderer.render(scene, camera);
}

// Lancer la session XR si elle n'est pas déjà configurée
renderer.xr.addEventListener('sessionstart', async (event) => {
    if (!hitTestSourceRequested) {
        await setupXRSession(event.target.getSession());
    }
});

// Ajouter une interaction de sélection
const controller = renderer.xr.getController(0);
controller.addEventListener('select', () => {
    if (reticle.visible) {
        const geometry = new CylinderGeometry(0.1, 0.1, 0.2, 32).translate(0, 0.1, 0);
        const material = new MeshPhongMaterial({ color: Math.random() * 0xffffff });
        const mesh = new Mesh(geometry, material);
        reticle.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        scene.add(mesh);
    }
});
scene.add(controller);

// Démarrage de la boucle d'animation
renderer.setAnimationLoop(animate);

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window); // optional

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshNormalMaterial();


renderer.useLegacyLights = false
renderer.shadowMap.enabled = false
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

controls.enableDamping = true

renderer.domElement.addEventListener('onEventStart', onEventStart, false)

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


function onEventStart(event) {
    let intersect;

    // En mode XR, utiliser les contrôleurs si disponibles
    if (renderer.xr.isPresenting) {
        const session = renderer.xr.getSession();
        const inputSources = session.inputSources;

        // Parcourir les sources d'entrée pour détecter les contrôleurs
        inputSources.forEach((inputSource) => {
            if (inputSource.targetRaySpace) {
                const controller = renderer.xr.getController(inputSource.handedness === 'right' ? 0 : 1);

                // Utiliser la position du contrôleur pour le raycast
                raycaster.set(controller.position, controller.getWorldDirection(new Vector3()));

                intersect = raycast(sceneMeshes);
                if (intersect) handleCameraMovement(intersect);
            }
        });
    } else {
        // En mode non-XR, utiliser la position de la souris
        mouse.set(
            (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
            -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouse, camera);

        intersect = raycast(sceneMeshes);
        if (intersect) handleCameraMovement(intersect);
    }
}

// Fonction pour gérer le mouvement de la caméra en fonction de l'objet sélectionné
function handleCameraMovement(intersect) {
    const object = intersect.object;

    // Si l'objet a une texture, commencer le mouvement de la caméra
    if (object.material.map) {
        animation_camera = [];
        const dominantColor = getColor(intersect, texture);
        console.log("Couleur dominante : ", dominantColor);
        console.log("Position de la caméra : ", camera.position);

        interface_text = new move_camera_with_color(dominantColor, camera, scene);

        let move;
        try {
            move = interface_text.move_to();
        } catch (e) {
            console.error("Erreur dans l'animation");
            return;
        }

        animation_camera.push(move);
        console.log(`Couleur dominante à l'intersection : ${dominantColor}`);
    }
}

renderer.domElement.addEventListener('pointerdown', onEventStart, false);

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
