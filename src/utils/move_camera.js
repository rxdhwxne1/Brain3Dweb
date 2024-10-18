"use strict";


import {Easing, Tween} from "@tweenjs/tween.js";
import json_file from "../data/color_position.json";

class move_camera_with_color {
    constructor(color_brain, camera) {
        this.color = color_brain;
        this.camera = camera
    }

    move_to() {
        let data = JSON.parse(JSON.stringify(json_file));
        let vector;
        switch (this.color.get_color()) {
            case "yellow":
                vector = {x: data.yellow.x, y: data.yellow.y, z: data.yellow.z};
                break;
            case "green":
                vector = {x: data.green.x, y: data.green.y, z: data.green.z};
                break;
            case "blue":
                vector = {x: data.blue.x, y: data.blue.y, z: data.blue.z};
                break;
            case "brown":
                vector = {x: data.brown.x, y: data.brown.y, z: data.brown.z};
                break;
            case "red":
                vector = {x: data.red.x, y: data.red.y, z: data.red.z};
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
            .start();

    }


}

export {move_camera_with_color};