"use strict";
import {
    ArrowHelper,
    AudioListener,
    BoxGeometry,
    BufferGeometry,
    Clock,
    CustomBlending,
    Group,
    Line,
    Mesh,
    MeshBasicMaterial,
    MeshNormalMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    Quaternion,
    Raycaster,
    RingGeometry,
    Scene,
    ShadowMaterial,
    SRGBColorSpace,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer
} from 'three';

import {DevUI} from '@iwer/devui';
import {metaQuest3, XRDevice} from 'iwer';

// XR
import {XRButton} from 'three/addons/webxr/XRButton.js';

import {color, getColor} from "./utils/color.js";
import {move_camera_with_color} from "./utils/move_camera.js";
import ThreeMeshUI from 'three-mesh-ui';

import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {button, click_begin, Interface, sceneMeshes} from "./interface.js";
import trad_intro from "./data/intro_interface.json" with {type: "json"};
import {addlight} from "./utils/light.js";
import {brain_loader, mixer_1, mixer_2, model_loader, texture} from "./utils/load_model_texture.js";
import VRControl from "./utils/VRControl.js";

const env = import.meta.env.MODE; // 'development', 'production', 'test'
if (env === 'production') {
    console.log = function () {
    }
}

async function setupXR(xrMode) {

    if (xrMode !== 'immersive-vr') return;

    // iwer setup: emulate vr session
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
}

async function init() {
    await setupXR('immersive-ar');
}


init().then(() => {
    console.log('ar setup done')
});


export const scene = new Scene();
const aspect = window.innerWidth / window.innerHeight;
export const listener = new AudioListener();
export const camera = new PerspectiveCamera(75, aspect, 0.1, 1000);
const intersected = [];
camera.add(listener);

export let group = new Group();
scene.add(group);

addlight(scene);

const floorGeometry = new PlaneGeometry(6, 6);
const floorMaterial = new ShadowMaterial({opacity: 0.25, blending: CustomBlending, transparent: false});
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);



const raycaster = new Raycaster();
const mouse = new Vector2();

export const renderer = new WebGLRenderer({antialias: true, alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.xr.enabled = true;

renderer.xr.addEventListener('sessionstart', () => {
    scene.background = null; // Supprime l'arrière-plan
});

renderer.xr.addEventListener('sessionend', () => {
    const loader2 = new TextureLoader();
    loader2.load('assets/ml-reseau-neurones.png', (texture) => {
        scene.background = texture;
    });
    begin = false;
    model_loader["brain"].position.set(0, 0, 0);
    if (click_begin) {
        animation_camera.push(new move_camera_with_color(new color(0, 0, 0), camera, scene).move_with_position({
            x: 0,
            y: 0,
            z: 3
        }, 0));
        model_loader["brain"].scale.set(1, 1, 1);
    } else {
        scene.remove(interface_intro.container);
        interface_intro = new Interface({
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z + 1.6
        }, scene, JSON.parse(JSON.stringify(trad_intro)), brain_loader);


    }
});


document.body.appendChild(renderer.domElement);

const xrButton = XRButton.createButton(renderer, {requiredFeatures: ['hit-test']});
xrButton.style.backgroundColor = 'skyblue';
document.body.appendChild(xrButton);


let vrControl = VRControl(renderer, camera, scene);

scene.add(vrControl.controllerGrips[0], vrControl.controllers[0]);

export let lastCirclePosition = new Vector3();
let begin = false;

function onSelect() {
    if (reticle.visible && !begin) {

        if (!click_begin) {

            reticle.matrix.decompose(lastCirclePosition, interface_intro.container.quaternion, interface_intro.container.scale);
            interface_intro.container.position.set(lastCirclePosition.x, lastCirclePosition.y, lastCirclePosition.z);
        } else {
            reticle.matrix.decompose(lastCirclePosition, new Quaternion(), new Vector3());
        }

        for (const [key, value] of Object.entries(model_loader)) {
            if (key === "brain") {
                value.position.set(lastCirclePosition.x, lastCirclePosition.y, lastCirclePosition.z);
                value.scale.set(0.5, 0.5, 0.5);
            } else if (key === "animation_dying") {
                value.position.set(lastCirclePosition.x, lastCirclePosition.y, lastCirclePosition.z);
                value.scale.set(0.1, 0.1, 0.1);
            } else {
                let cameraDirection = new Vector3();
                renderer.xr.getCamera().getWorldDirection(cameraDirection);
                let rightVector = new Vector3();
                rightVector.crossVectors(cameraDirection, new Vector3(0, 1, 0)).normalize();

                let distanceFromCamera = 0.9;
                let leftOffset = 0.7;
                let interfacePosition = {
                    x: lastCirclePosition.x + cameraDirection.x * distanceFromCamera - rightVector.x * leftOffset,
                    y: lastCirclePosition.y + cameraDirection.y * distanceFromCamera - rightVector.y * leftOffset,
                    z: lastCirclePosition.z + cameraDirection.z * distanceFromCamera - rightVector.z * leftOffset
                };

                value.position.set(interfacePosition.x, interfacePosition.y, interfacePosition.z);
                value.lookAt(renderer.xr.getCamera().position);
            }
        }
        begin = true;
        reticle.visible = false;

    }

}

vrControl.controllers[0].addEventListener('select', onSelect);

vrControl.controllers[0].addEventListener('selectstart', (event) => {
    onSelectStart(event);
    Click(event);
    selectState = true;

});
vrControl.controllers[0].addEventListener('selectend', (event) => {
    onSelectEnd(event);
    selectState = false;

});

let reticle = new Mesh(
    new RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    new MeshBasicMaterial()
);
reticle.matrixAutoUpdate = false;
reticle.visible = false;
scene.add(reticle);

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);

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
    let intersects;

    if (renderer.xr.isPresenting) {
        console.log("click vr");
        vrControl.setFromController(0, raycaster.ray);

        intersects = raycast(sceneMeshes);

        // Position the little white dot at the end of the controller pointing ray
        if (intersects) vrControl.setPointerAt(0, intersects.point);

    } else if (mouse.x !== null && mouse.y !== null) {
        console.log("click mouse");
        mouse.set((event.clientX / renderer.domElement.clientWidth) * 2 - 1, -(event.clientY / renderer.domElement.clientHeight) * 2 + 1);
        raycaster.setFromCamera(mouse, camera);
        intersects = raycast(sceneMeshes);
    }


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


export let interface_intro = new Interface({
    x: camera.position.x, y: camera.position.y, z: camera.position.z + 1.6
}, scene, JSON.parse(JSON.stringify(trad_intro)), brain_loader);

function onSelectStart(event) {
    console.log(scene.children);
    const controller = event.target;

    const intersections = getIntersections(controller);
    console.log(intersections);
    if (intersections.length > 0) {

        const intersection = intersections[0];
        let object = intersection.object


        if (object.name.includes("Brain")) {
            object = model_loader["brain"];
        } else {
            while (object.parent && object.parent.type !== "Group") {
                object = object.parent;
            }
        }


        // Vérifie si l'objet a une propriété emissive pour pouvoir le modifier
        if (object.material && object.material.emissive) {
            object.material.emissive.b = 1;
        }
        controller.attach(object);

        controller.userData.selected = object;

    }

    controller.userData.targetRayMode = event.data.targetRayMode;

}

function onSelectEnd(event) {

    const controller = event.target;

    if (controller.userData.selected !== undefined) {

        const object = controller.userData.selected;
        if (object.material && object.material.emissive) {
            object.material.emissive.b = 0;
        }


        group.attach(object);

        controller.userData.selected = undefined;

    }

}

function getIntersections(controller) {

    controller.updateMatrixWorld();

    raycaster.setFromXRController(controller);

    return raycaster.intersectObjects(group.children, true);

}

function intersectObjects(controller) {

    // Do not highlight in mobile-ar

    if (controller.userData.targetRayMode === 'screen') return;

    // Do not highlight when already selected

    if (controller.userData.selected !== undefined) return;

    const line = controller.getObjectByName('line');
    const intersections = getIntersections(controller);

    if (intersections.length > 0) {

        const intersection = intersections[0];

        const object = intersection.object;
        if (object.material.emissive)
            object.material.emissive.r = 1;
        intersected.push(object);

        line.scale.z = intersection.distance;

    } else {

        line.scale.z = 5;

    }

}

function cleanIntersected() {

    while (intersected.length) {

        const object = intersected.pop();
        if (object.material && object.material.emissive)
            object.material.emissive.r = 0;

    }

}


camera.position.z = 3;


const clock = new Clock();

let selectState = false;

function updateButtons() {
    let intersect;

    if (renderer.xr.isPresenting) {

        vrControl.setFromController(0, raycaster.ray);

        intersect = raycast();

        // Position the little white dot at the end of the controller pointing ray
        if (intersect) vrControl.setPointerAt(0, intersect.point);

    } else if (mouse.x !== null && mouse.y !== null) {

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
let hitTestSource = null;
let hitTestSourceRequested = false;

function animate(timestamp, frame) {
    if (begin) {
        return;
    }
    if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (hitTestSourceRequested === false) {

            session.requestReferenceSpace('viewer').then(function (referenceSpace) {

                session.requestHitTestSource({space: referenceSpace}).then(function (source) {

                    hitTestSource = source;

                });

            });

            session.addEventListener('end', function () {

                hitTestSourceRequested = false;
                hitTestSource = null;

            });

            hitTestSourceRequested = true;

        }

        if (hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length) {

                const hit = hitTestResults[0];

                reticle.visible = true;
                reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);

            } else {

                reticle.visible = false;

            }

        }

    }
}

const geometry_2 = new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(0, 0, -1)]);

const line_2 = new Line(geometry_2);
line_2.name = 'line';
line_2.scale.z = 5;

vrControl.controllers[0].add(line_2.clone());


const animation = (timestamp, frame) => {
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
    // if (renderer.xr.isPresenting) {
    //     updateInterfacePosition();
    // }

    updateButtons();


    if (mixer_1) {
        mixer_1.update(deltaTime)
    }
    if (mixer_2) {
        mixer_2.update(deltaTime)
    }
    animate(timestamp, frame);
    cleanIntersected();

    intersectObjects(vrControl.controllers[0]);
    renderer.render(scene, camera);
};

renderer.setAnimationLoop(animation);
renderer.render(scene, camera);
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
