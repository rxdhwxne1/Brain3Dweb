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

export function getColor(intersect, texture, sampleSize = 5) {
    // Créer un tableau pour stocker les couleurs échantillonnées
    const uv = intersect.uv;

    // Créer un canvas pour échantillonner la texture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    context.drawImage(texture.image, 0, 0);

    // Échantillonner la texture autour de l'intersection
    const x = Math.floor(uv.x * canvas.width);
    const y = Math.floor((1 - uv.y) * canvas.height); // Inverser l'axe Y
    const imageData = context.getImageData(x, y, sampleSize, sampleSize);

    // get the pixel data
    const data = imageData.data;
    console.log(data[0], data[1], data[2]);
    // get the color for this pixel
    return new color(data[0], data[1], data[2]);
}