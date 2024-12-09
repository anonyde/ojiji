import { scene, camera } from '../core/setup.js';
import { startCameraAnimation } from '../animation/camera.js';

let screenContext, screen;
let monitorGroup;
const computerPosition = new THREE.Vector3(0, 1.1, 0);

export function createComputer() {
    monitorGroup = new THREE.Group();

    // Monitor base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 0.05, 32),
        new THREE.MeshStandardMaterial({
            color: 0x202020,
            metalness: 0.9,
            roughness: 0.1
        })
    );
    monitorGroup.add(base);

    // Monitor stand
    const stand = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.4, 0.05),
        new THREE.MeshStandardMaterial({
            color: 0x202020,
            metalness: 0.9,
            roughness: 0.1
        })
    );
    stand.position.y = 0.2;
    monitorGroup.add(stand);

    // Monitor frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 1.2, 0.1),
        new THREE.MeshStandardMaterial({
            color: 0x202020,
            metalness: 0.9,
            roughness: 0.1
        })
    );
    frame.position.y = 0.6;
    monitorGroup.add(frame);

    // Screen
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    screenContext = canvas.getContext('2d');

    const screenTexture = new THREE.CanvasTexture(canvas);
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;

    screen = new THREE.Mesh(
        new THREE.PlaneGeometry(1.9, 1.1),
        new THREE.MeshStandardMaterial({
            map: screenTexture,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5
        })
    );
    screen.position.y = 0.6;
    screen.position.z = 0.051;
    
    // Make screen clickable
    screen.userData.clickable = true;
    screen.userData.isComputerScreen = true; // Add this property to identify computer screen
    screen.userData.onClick = () => {
        // Position camera extremely close to screen for maximum immersion
        const targetPosition = new THREE.Vector3(0, 1.7, 0.06);
        const targetLookAt = new THREE.Vector3(0, 1.7, 0);
        startCameraAnimation(targetPosition, targetLookAt);
    };
    
    monitorGroup.add(screen);

    monitorGroup.position.copy(computerPosition);
    scene.add(monitorGroup);

    return { screenContext, screen, position: computerPosition };
}

export function updateComputer() {
    // Add any computer-specific animations here
}

export function getScreen() {
    return screen;
}

export { screenContext, screen, computerPosition };
