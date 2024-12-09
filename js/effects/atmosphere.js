import { scene } from '../core/setup.js';
import { FlickeringLight, ElectricalSpark } from './lightingEffects.js';

export class AtmosphereManager {
    constructor() {
        // Create grid of flickering lights on ceiling
        this.lights = [];
        const gridSize = 3; // 3x3 grid of lights
        const spacing = 4; // 4 units between lights
        
        for (let x = -1; x <= 1; x++) {
            for (let z = -1; z <= 1; z++) {
                const light = new FlickeringLight(
                    new THREE.Vector3(
                        x * spacing,
                        3.95, // Raised to match new ceiling height (just below 4.0)
                        z * spacing
                    ),
                    0xffeeb1, // Warm light color
                    0.8
                );
                this.lights.push(light);
            }
        }

        // Create electrical sparks system
        this.sparkSystem = new ElectricalSpark();

        // Dim the ambient light
        scene.traverse(object => {
            if (object instanceof THREE.AmbientLight) {
                object.intensity = 0.2;
            }
        });
    }

    update() {
        const time = Date.now();
        this.lights.forEach(light => light.update(time));
        this.sparkSystem.update(time);
    }
}
