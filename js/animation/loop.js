import { renderer, scene, camera } from '../core/setup.js';
import { updateControls } from '../core/controls.js';
import { updateScreen } from './screen.js';
import { updateCameraAnimation, isAnimating } from './camera.js';
import { updateComputer } from '../workstation/computer.js';
import { atmosphereManager, synthesisChamber, dockingStation } from '../main.js';

let lastTime = performance.now();

export function animate() {
    requestAnimationFrame(animate);
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    // Update components
    if (!isAnimating) {
        updateControls();
    }
    updateScreen();
    updateCameraAnimation(deltaTime);
    updateComputer();
    
    // Update atmosphere effects
    if (atmosphereManager) {
        atmosphereManager.update();
    }

    // Update synthesis chamber
    if (synthesisChamber) {
        synthesisChamber.animate();
    }

    // Update docking station
    if (dockingStation) {
        dockingStation.animate();
    }
    
    // Render scene
    renderer.render(scene, camera);
}
