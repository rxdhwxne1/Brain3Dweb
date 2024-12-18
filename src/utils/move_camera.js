"use strict";

import * as tween from "@tweenjs/tween.js";
//import {Easing, Tween} from "@tweenjs/tween.js";
import json_file from "../data/color_position.json" with {type: "json"};
import {Interface} from "../interface.js";
import brain_info from "../data/brain_lobes_info.json" with {type: "json"};
import {Audio, AudioLoader, Vector3} from "three";
import sound_info from "../sounds/info.mp3";
import {animation_camera, group, listener, renderer} from "../main.js";
import {model_loader} from "./load_model_texture.js";

let infoPanel = null;

class move_camera_with_color {
    constructor(color_brain, camera, scene) {
        this.color = color_brain;
        this.camera = camera;
        this.scene = scene;
    }

    move_to() {
        let data = JSON.parse(JSON.stringify(json_file));
        let vector;
        let trad;

        const sound = new Audio(listener);
        const audioLoader = new AudioLoader();
        switch (this.color.get_color()) {
            case "yellow":
                vector = {x: data.yellow.x, y: data.yellow.y, z: data.yellow.z};
                trad = brain_info.yellow;
                break;
            case "green":
                vector = {x: data.green.x, y: data.green.y, z: data.green.z};
                trad = brain_info.green;
                break;
            case "blue":
                vector = {x: data.blue.x, y: data.blue.y, z: data.blue.z};
                trad = brain_info.blue;

                break;
            case "brown":
                vector = {x: data.brown.x, y: data.brown.y, z: data.brown.z};
                trad = brain_info.brown;
                break;
            case "red":
                vector = {x: data.red.x, y: data.red.y, z: data.red.z};
                trad = brain_info.red;
                break;
            default:
                console.error("Color not found");
                return new Error("Color not found");
        }
        audioLoader.load(sound_info, function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(false);
            sound.setVolume(0.5);
            sound.play();
        });

        return new tween.Tween(this.camera.position)
            .to({x: vector.x, y: vector.y, z: vector.z}, 2000)
            .easing(tween.Easing.Quadratic.Out)
            .onUpdate(() => {
                this.camera.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
                this.camera.lookAt(0, 0, 0);
            })
            .onComplete(() => {
                console.log("camera moved", this.camera.position);
                let cameraDirection = new Vector3();
                if (renderer.xr.isPresenting) {
                    renderer.xr.getCamera().getWorldDirection(cameraDirection);
                    console.log("camera direction", cameraDirection);
                } else {
                    this.camera.getWorldDirection(cameraDirection);
                }


                let rightVector = new Vector3();
                rightVector.crossVectors(cameraDirection, new Vector3(0, 1, 0)).normalize();

                let distanceFromCamera = 0.9;
                let leftOffset = 0.7;
                let interfacePosition;
                if (renderer.xr.isPresenting) {
                    interfacePosition = {
                        x: model_loader["brain"].position.x + cameraDirection.x * distanceFromCamera - rightVector.x * leftOffset,
                        y: model_loader["brain"].position.y + cameraDirection.y * distanceFromCamera - rightVector.y * leftOffset,
                        z: model_loader["brain"].position.z + cameraDirection.z * distanceFromCamera - rightVector.z * leftOffset
                    };
                } else {
                    interfacePosition = {
                        x: this.camera.position.x + cameraDirection.x * distanceFromCamera - rightVector.x * leftOffset,
                        y: this.camera.position.y + cameraDirection.y * distanceFromCamera - rightVector.y * leftOffset,
                        z: this.camera.position.z + cameraDirection.z * distanceFromCamera - rightVector.z * leftOffset
                    };
                }


                if (infoPanel) {
                    console.log("remove info panel");
                    this.scene.remove(infoPanel.container);
                    group.remove(infoPanel.container);
                    infoPanel = null;
                }
                infoPanel = new Interface(interfacePosition, this.scene, JSON.parse(JSON.stringify(trad)));
                if (renderer.xr.isPresenting) {
                    infoPanel.container.lookAt(renderer.xr.getCamera().position);
                } else {
                    infoPanel.container.lookAt(this.camera.position);
                }
                animation_camera.push(this.move_with_rotation(infoPanel.container.rotation));
                model_loader["infoPanel"] = infoPanel.container;
                this.camera.getWorldDirection(cameraDirection);
                distanceFromCamera = -0.2;
                animation_camera.push(this.move_with_position({
                    x: this.camera.position.x + cameraDirection.x * distanceFromCamera,
                    y: this.camera.position.y + cameraDirection.y * distanceFromCamera,
                    z: this.camera.position.z + cameraDirection.z * distanceFromCamera
                }));


            })
            .start();

    }

    move_with_rotation(rotation) {
        return new tween.Tween(this.camera.rotation)
            .delay(900)
            .to({y: rotation.y, x: rotation.x, z: rotation.z})
            .easing(tween.Easing.Quadratic.Out)
            .onUpdate(() => {
                this.camera.rotation.set(this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z);
                //this.camera.lookAt(this.camera.rotation);
            })
            .onComplete(() => {
                console.log("Rotation animation completed");
            })
            .start();
    }

    move_with_position(position, delay = 1200) {
        return new tween.Tween(this.camera.position)
            .delay(delay)
            .to({x: position.x, y: position.y, z: position.z}, 2000)
            .easing(tween.Easing.Quadratic.Out)
            .onUpdate(() => {
                this.camera.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
                //this.camera.lookAt(0, 0, 0);
            })
            .onComplete(() => {
                console.log("camera moved", this.camera.position);
            })
            .start();

    }
}

export {move_camera_with_color};