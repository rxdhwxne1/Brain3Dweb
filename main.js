"use strict";

import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AmbientLight,
  Clock,
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  Vector2,
  Color,
  Vector3
} from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new PerspectiveCamera(75, aspect, 0.1, 1000);

const light = new AmbientLight(0xffffff, 1.0); // soft white light
scene.add(light);

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window); // optional

const clock = new Clock();
camera.position.z = 3;

const raycaster = new Raycaster();
const mouse = new Vector2();

// Fonction pour ajouter des points à des positions spécifiques
function addPoint(x, y, z, color) {
  const geometry = new SphereGeometry(0.05, 32, 32);
  const material = new MeshBasicMaterial({ color: color });
  const point = new Mesh(geometry, material);

  point.position.set(x, y, z);
  point.userData.color = new Color(color); // Associe la couleur au userData
  scene.add(point);
}

// Fonction pour sélectionner les éléments de la même couleur
function selectElements(color) {
  const selectedMeshes = [];

  scene.traverse((child) => {
    if (child.isMesh && child.material instanceof MeshBasicMaterial) {
      if (child.userData.color && child.userData.color.equals(new Color(color))) {
        selectedMeshes.push(child);
        child.material.color.set(0x00ff00); // Change la couleur en vert
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
    console.log("Model loaded: " + brainModel);
    scene.add(brainModel);

    const pointColor = 0xFFFFFF;
    addPoint(0, .95, .5, pointColor); // lobe frontal
    addPoint(0, .95, -.45, pointColor); // lobe pariétal
    addPoint(.45, .5, .25, pointColor); // lobe temporal
    addPoint(0, .5, -.63, pointColor); // lobe occipital
    addPoint(0, .15, -.35, pointColor); // cervelet
  } else {
    console.log("Load FAILED.");
  }
}

loadData();

window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const pointPosition = intersects[0].point;
    lookAtPoint(pointPosition);
  }
}

function lookAtPoint(point) {
  const cameraDistance = .5; // Distance désirée par rapport au point

  // Calculer la direction entre la caméra et le point sélectionné
  const direction = new Vector3();
  direction.subVectors(point, camera.position).normalize();

  // Ajuster la position de la caméra pour qu'elle se rapproche du point sélectionné -> fonctionne pas encore bien
  const newCameraPosition = new Vector3();
  newCameraPosition.copy(point).add(direction.multiplyScalar(-cameraDistance));

  // Déplacer la caméra progressivement vers la nouvelle position
  camera.position.lerp(newCameraPosition, 0.1); // Interpolation pour un mouvement fluide -> fonctionne pas du tout

  // Faire en sorte que la caméra regarde toujours le point sélectionné
  camera.lookAt(point);
}

// Main loop
const animation = () => {
  renderer.setAnimationLoop(animation);
  renderer.render(scene, camera);
};

animation();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
