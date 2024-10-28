"use strict";

export class color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    isInRange(value, target, tolerance = 10) {
        return Math.abs(value - target) <= tolerance;
    }

    get_color() {
        if (this.isInRange(this.r, 52) && this.isInRange(this.g, 182) && this.isInRange(this.b, 56)) {
            return "green";
        } else if (this.isInRange(this.r, 52) && this.isInRange(this.g, 166) && this.isInRange(this.b, 158)) {
            return "blue";
        } else if (this.isInRange(this.r, 117) && this.isInRange(this.g, 47) && this.isInRange(this.b, 19)) {
            return "brown";
        } else if (this.isInRange(this.r, 224) && this.isInRange(this.g, 221) && this.isInRange(this.b, 64)) {
            return "yellow";
        } else if (this.isInRange(this.r, 195) && this.isInRange(this.g, 43) && this.isInRange(this.b, 42)) {
            return "red";
        } else {
            return "color not found";
        }
    }

}