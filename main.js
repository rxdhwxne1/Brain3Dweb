"use strict";

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

const light = new THREE.AmbientLight(0xffffff, 1.0); // soft white light
scene.add(light);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window); // optional

const clock = new THREE.Clock();
camera.position.z = 3;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Fonction pour ajouter des points à des positions spécifiques
function addPoint(x, y, z, color) {
  const geometry = new THREE.SphereGeometry(0.05, 32, 32); // Taille du point
  const material = new THREE.MeshBasicMaterial({ color: color }); // Couleur du point
  const point = new THREE.Mesh(geometry, material);

  point.position.set(x, y, z);
  point.userData = { color: color }; // Stocker la couleur dans userData
  scene.add(point);
}

// Fonction pour sélectionner les éléments de la même couleur
function selectElements(color) {
  const selectedMeshes = [];

  scene.traverse((child) => {
    if (child.isMesh && child.material instanceof THREE.MeshBasicMaterial) {
      if (child.material.color.equals(color)) {
        selectedMeshes.push(child);
        child.material.color.set(0x00ff00); // Changer la couleur en vert pour indiquer la sélection
      }
    }
  });

  return selectedMeshes;
}

function loadData() {
  new GLTFLoader()
    .setPath('assets/models/')
    .load('brain_project.glb', gltfReader);
}

function gltfReader(gltf) {
  const brainModel = gltf.scene;

  if (brainModel != null) {
    console.log("Model loaded:  " + brainModel);
    scene.add(brainModel);

    // Ajouter des points à des endroits spécifiques du cerveau
    const pointColor = 0x8b0000; // Exemple de couleur pour le point
    addPoint(0, 0.75, -0.5, pointColor); // Exemple de point
  } else {
    console.log("Load FAILED.");
  }
}

loadData();

// Gestionnaire de clics
window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
  // Convertir les coordonnées de la souris en coordonnées normalisées
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Mettre à jour le raycaster avec la caméra et les coordonnées de la souris
  raycaster.setFromCamera(mouse, camera);

  // Calculer les objets intersectés
  const intersects = raycaster.intersectObjects(scene.children, true);

  // Si quelque chose a été cliqué
  if (intersects.length > 0) {
    // Prendre la couleur du premier point cliqué
    const color = intersects[0].object.userData.color;

    // Sélectionner tous les éléments de la même couleur
    if (color) {
      selectElements(new THREE.Color(color));
    }
  }
}

// Main loop
const animation = () => {
  requestAnimationFrame(animation);
  renderer.render(scene, camera);
};

animation();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}