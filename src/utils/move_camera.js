"use strict";


import {Easing, Tween} from "@tweenjs/tween.js";
import json_file from "../data/color_position.json";
import {Interface} from "../interface.js";
import brain_info from "../data/brain_lobes_info.json";
import {Vector3} from "three";


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
                return;
        }
        return new Tween(this.camera.position)
            .to({x: vector.x, y: vector.y, z: vector.z})
            .easing(Easing.Quadratic.Out)
            .onUpdate(() => {
                this.camera.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
                this.camera.lookAt(0, 0, 0);
            })
            .onComplete(() => {
                //displayInfo(this.color, this.camera, this.scene);
                console.log("camera moved", this.camera.position);
                let cameraDirection = new Vector3();
                this.camera.getWorldDirection(cameraDirection);


                let distanceFromCamera = 1;

                let interfacePosition = {
                    x: this.camera.position.x + cameraDirection.x * distanceFromCamera,
                    y: this.camera.position.y + cameraDirection.y * distanceFromCamera,
                    z: this.camera.position.z + cameraDirection.z * distanceFromCamera
                };
                console.log(infoPanel);
                if (infoPanel) {
                    console.log("remove info panel");
                    this.scene.remove(infoPanel.container);
                    infoPanel = null;
                }
                infoPanel = new Interface(interfacePosition, this.scene, JSON.parse(JSON.stringify(trad)));
                infoPanel.container.lookAt(this.camera.position);


            })
            .start();

    }


}

export {move_camera_with_color};