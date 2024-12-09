import { camera, renderer } from './setup.js';
const THREE = window.THREE;
const OrbitControls = THREE.OrbitControls;

let controls;

export function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 1.0;
    // Restrict vertical rotation to prevent seeing above ceiling or below floor
    controls.minPolarAngle = Math.PI / 4; // Prevent looking up too high
    controls.maxPolarAngle = Math.PI / 1.8; // Prevent looking down too low
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set(0, 1.5, 0);
    
    // Enable right-click drag for panning
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
    };

    // Add pan limits to keep focus on the lab
    controls.minPan = new THREE.Vector3(-5, -2, -5);
    controls.maxPan = new THREE.Vector3(5, 3, 5);

    // Override the pan method to implement limits
    const originalPan = controls.pan;
    controls.pan = function(...args) {
        originalPan.apply(this, args);
        this.target.clamp(this.minPan, this.maxPan);
    };

    return controls;
}

export function updateControls() {
    if (controls) {
        controls.update();
    }
}

export { controls };
