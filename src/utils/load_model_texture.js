import {sceneMeshes} from "../interface.js";
import {
    AnimationMixer,
    Audio,
    AudioLoader,
    LoopOnce,
    Mesh,
    MeshBasicMaterial,
    SphereGeometry,
    TextureLoader
} from "three";
import {move_camera_with_color} from "./move_camera.js";
import {color} from "./color.js";
import sound_info from "../sounds/info.mp3";
import Death from "../sounds/Death.mp3";
import Chute from "../sounds/Chute.mp3";
import Damage from "../sounds/Damage.mp3";
import Dead_body_hitting from "../sounds/Dead_body_hitting.mp3";
import {animation_camera, camera, group, lastCirclePosition, listener, renderer, scene} from "../main.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";


const loader = new GLTFLoader();
export let mixer_1;
export let mixer_2
export let model_loader = {};

let loadingIndicator;
const bounceSpeed = 0.1;
const colorChangeSpeed = 0.5;
let colorHue = 0;

function createLoadingIndicator() {
    const geometry = new SphereGeometry(0.5, 32, 32);
    const material = new MeshBasicMaterial({color: 0xffffff});
    loadingIndicator = new Mesh(geometry, material);
    loadingIndicator.position.set(0, 0, 4);
    scene.add(loadingIndicator);

    animateLoadingIndicator();
}

function animateLoadingIndicator() {
    let bounceOffset = 0;

    function animate() {
        bounceOffset += bounceSpeed;
        loadingIndicator.position.y = 15 + Math.abs(Math.sin(bounceOffset)) * 0.5;

        colorHue = (colorHue + colorChangeSpeed) % 360;
        loadingIndicator.material.color.setHSL(colorHue / 360, 1, 0.5);

        requestAnimationFrame(animate);
    }

    animate();
}


function load_model_texture() {
    const sound = new Audio(listener);
    const sound2 = new Audio(listener);
    const sound3 = new Audio(listener);
    createLoadingIndicator();
    return new Promise((resolve, reject) => {
        const modelPromise = new Promise((resolveModel, rejectModel) => {
            loader.load('assets/models/animation_dying_6.glb', function (gltf) {
                const model = gltf.scene;
                const animations = gltf.animations;

                mixer_1 = new AnimationMixer(model);
                mixer_2 = new AnimationMixer(model);
                if (lastCirclePosition && renderer.xr.isPresenting) {
                    model.position.set(lastCirclePosition.x, lastCirclePosition.y, lastCirclePosition.z);
                    model.scale.set(0.08, 0.08, 0.08);

                }
                model_loader["animation_dying"] = model;

                scene.add(model);
                resolveModel({model, animations});
            }, function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            }, function (error) {
                console.error('An error happened', error);
            });
        });

        const cameraPromise = new Promise((resolveCamera, rejectCamera) => {
            animation_camera.push(new move_camera_with_color(new color(0, 0, 0), camera, scene).move_with_position({
                x: 0,
                y: 10,
                z: 20
            }, 0));
            resolveCamera();
        });
        Promise.all([modelPromise, cameraPromise]).then(([{model, animations}]) => {
            setTimeout(() => {
                const audioLoader = new AudioLoader();
                audioLoader.load(Death, function (buffer) {
                    sound.setBuffer(buffer);
                    sound.setLoop(false);
                    sound.setVolume(0.5);
                    sound.play();
                });

                mixer_1.addEventListener('finished', () => {
                        sound2.pause();
                        scene.remove(model);
                        return resolve();
                    }
                );


                const action = mixer_1.clipAction(animations[0]);
                let soundPlayed = false;

                // Start checking if the animation has started
                const checkAnimationStart = setInterval(() => {
                    if (!soundPlayed && action.time > 2.3) {
                        audioLoader.load(Chute, function (buffer) {
                            sound2.setBuffer(buffer);
                            sound2.setLoop(false);
                            sound2.setVolume(0.5);
                            sound2.play();
                        });
                        soundPlayed = true;
                    } else if (soundPlayed && action.time > 3.3) {
                        const sound = new Audio(listener);
                        audioLoader.load(Damage, function (buffer) {
                            sound.setBuffer(buffer);
                            sound.setLoop(false);
                            sound.setVolume(0.5);
                            sound.play();
                        });
                        clearInterval(checkAnimationStart);
                    }
                }, 10);
                action.play();

                const action2 = mixer_2.clipAction(animations[1]);
                setTimeout(() => action2.play(), 900);

                let soundPlayed2 = false;
                let delete_done = false;

                const checkAnimationStart2 = setInterval(() => {
                    if (!delete_done) {
                        scene.remove(loadingIndicator);
                        delete_done = true;
                    }

                    if (!soundPlayed2 && action2.time > 0.5) {
                        audioLoader.load(Dead_body_hitting, function (buffer) {
                            sound3.setBuffer(buffer);
                            sound3.setLoop(false);
                            sound3.setVolume(0.5);
                            sound3.play();
                        });
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
            }, 250);
        });


    });
}

export function brain_loader() {

    load_model_texture(scene, loader, camera).then(() => {

        loader.load('assets/models/brain_project.glb', function (gltf) {
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    sceneMeshes.push(child);
                }
            });
            if (lastCirclePosition && renderer.xr.isPresenting) {
                gltf.scene.position.set(lastCirclePosition.x, lastCirclePosition.y, lastCirclePosition.z);
                gltf.scene.scale.set(0.5, 0.5, 0.5);
            }
            model_loader["brain"] = gltf.scene;
            group.add(gltf.scene);

            const sound = new Audio(listener);
            const audioLoader = new AudioLoader();
            animation_camera.push(new move_camera_with_color(new color(0, 0, 0), camera, scene).move_with_position({
                x: 0,
                y: 0,
                z: 3
            }, 0));
            audioLoader.load(sound_info, function (buffer) {
                sound.setBuffer(buffer);
                sound.setLoop(false);
                sound.setVolume(0.5);
                sound.play();
            });


        }, function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, function (error) {
            console.error('An error happened', error);
        });
    });


}

const textureLoader = new TextureLoader();
export const texture = textureLoader.load('assets/Brain_Texture.jpeg', () => {
        console.log('Texture loaded successfully:', texture);
    }, undefined,  // Optional: onProgress function (can be left as undefined)
    (error) => {
        console.error('Error loading texture:', error); // Log any loading error
    });


//const loader2 = new TextureLoader();
//loader2.load('assets/ml-reseau-neurones.png', (texture) => {
//    scene.background = texture;
//});
