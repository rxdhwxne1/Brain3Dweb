"use strict";

import * as tween from "@tweenjs/tween.js";
//import {Easing, Tween} from "@tweenjs/tween.js";
import json_file from "../data/color_position.json" with {type: "json"};
import {Interface} from "../interface.js";
import brain_info from "../data/brain_lobes_info.json" with {type: "json"};
import {Vector3} from "three";
import sound_info from "../sounds/info.mp3";
import {animation_camera} from "../main.js";

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
        const sound = new Audio(sound_info);
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

        sound.play();

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
                this.camera.getWorldDirection(cameraDirection);

                let rightVector = new Vector3();
                rightVector.crossVectors(cameraDirection, new Vector3(0, 1, 0)).normalize();

                let distanceFromCamera = 0.9;
                let leftOffset = 0.5;

                let interfacePosition = {
                    x: this.camera.position.x + cameraDirection.x * distanceFromCamera - rightVector.x * leftOffset,
                    y: this.camera.position.y + cameraDirection.y * distanceFromCamera - rightVector.y * leftOffset,
                    z: this.camera.position.z + cameraDirection.z * distanceFromCamera - rightVector.z * leftOffset
                };

                if (infoPanel) {
                    console.log("remove info panel");
                    this.scene.remove(infoPanel.container);
                    infoPanel = null;
                }
                infoPanel = new Interface(interfacePosition, this.scene, JSON.parse(JSON.stringify(trad)));
                infoPanel.container.lookAt(this.camera.position);
                animation_camera.push(this.move_with_position(infoPanel.container.rotation));


            })
            .start();

    }

    move_with_position(position) {
        return new tween.Tween(this.camera.rotation)
            .delay(1200)
            .to({y: position.y, x: position.x, z: position.z})
            .easing(tween.Easing.Quadratic.Out)
            .onUpdate(() => {
                this.camera.rotation.set(this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z);
                //this.camera.lookAt(this.camera.position);
            })
            .onComplete(() => {
                console.log("Rotation animation completed");
            })
            .start();
    }
}

export {move_camera_with_color};