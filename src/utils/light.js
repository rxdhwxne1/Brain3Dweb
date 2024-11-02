import {HemisphereLight, RectAreaLight} from "three";

export function addlight(scene) {
    const rectLight1 = new RectAreaLight(0xffffff, 5, 5, 5);
    rectLight1.position.set(0, 5, 0); // Au-dessus de l'objet
    rectLight1.lookAt(0, 0, 0);
    scene.add(rectLight1);

    const rectLight2 = new RectAreaLight(0xffffff, 5, 5, 5);
    rectLight2.position.set(0, -5, 0); // En dessous de l'objet
    rectLight2.lookAt(0, 0, 0);
    scene.add(rectLight2);

    const rectLight3 = new RectAreaLight(0xffffff, 5, 5, 5);
    rectLight3.position.set(5, 0, 0); // À droite de l'objet
    rectLight3.lookAt(0, 0, 0);
    scene.add(rectLight3);

    const rectLight4 = new RectAreaLight(0xffffff, 5, 5, 5);
    rectLight4.position.set(-5, 0, 0); // À gauche de l'objet
    rectLight4.lookAt(0, 0, 0);
    scene.add(rectLight4);

    const rectLight5 = new HemisphereLight(0xffffbb, 0x080820, 3);
    scene.add(rectLight5);
}