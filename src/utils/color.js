"use strict";

export class color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    get_color() {
        if (this.r === 52 && this.g === 182 && this.b === 56) {
            return "green";
        } else if (this.r === 52 && this.g === 166 && this.b === 158) {
            return "blue";
        } else if (this.r === 117 && this.g === 48 && this.b === 19) {
            return "brown";
        } else if (this.r === 224 && this.g === 221 && this.b === 64) {
            return "yellow";
        }
        else if (this.r === 195 && this.g === 43 && this.b === 42) {
            return "red";
        } else {
            return "color not found";
        }
    }

}
