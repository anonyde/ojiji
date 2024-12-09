import { scene } from '../core/setup.js';

export function addLights() {
    // Dim ambient light for atmospheric effect
    const ambientLight = new THREE.AmbientLight(0x6b7c8e, 0.2); // Reduced intensity from 0.4 to 0.2
    scene.add(ambientLight);

    // Dim hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.2); // Reduced intensity from 0.4 to 0.2
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Remove ceiling spotlights as they're replaced by flickering lights in atmosphere.js
    // The flickering lights will provide the main illumination now
}

export function updateLights() {
    // Add any dynamic lighting updates here if needed
}
