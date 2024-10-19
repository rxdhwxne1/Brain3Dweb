"use strict";

import { Color } from "three";
import brainInfo from "../data/brain_lobes_info.json";

let infoPanel = null;

// Fonction pour afficher un panneau d'information
function displayInfo(color) {
    if (infoPanel) {
        scene.remove(infoPanel);
        infoPanel = null;
    }

    infoPanel = new ThreeMeshUI.Block({
        ref: "infoPanel",
        padding: 0.025,
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontColor: new Color(0xffffff),
        backgroundOpacity: 0,
    });

    // TODO : Positionner le panneau à la position correspondante à la couleur
    infoPanel.position.set(camera.position.x, camera.position.y, camera.position.z + 2);
    infoPanel.rotation.x = -0.55;
    scene.add(infoPanel);

    // Titre du panneau
    const title = new ThreeMeshUI.Block({
        height: 0.2,
        width: 1.5,
        margin: 0.01,
        justifyContent: "center",
        fontSize: 0.09,
    });

    title.add(
        new ThreeMeshUI.Text({
            content: "Information sur la partie du cerveau sélectionnée",
        })
    );
    infoPanel.add(title);

    // Contenu du panneau (affichage d'info sur la couleur)
    const contentContainer = new ThreeMeshUI.Block({
        height: 0.5,
        width: 0.5,
        margin: 0.01,
        justifyContent: "center",
        alignContent: "center",
        backgroundOpacity: 0.5,
        flexDirection: "column",  // Disposition verticale
    });

    const brainColorInfo = brainInfo[color.get_color()]; // Obtient les informations en fonction de la couleur

    const content = new ThreeMeshUI.Text({
        content: brainColorInfo ? `${brainColorInfo.name}: ${brainColorInfo.description}` : "Aucune information disponible.",
        fontSize: 0.05,
    });

    contentContainer.add(content);
    infoPanel.add(contentContainer);
}

export { displayInfo };