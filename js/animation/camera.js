import { camera } from '../core/setup.js';
import { controls } from '../core/controls.js';

let isAnimating = false;
let targetPosition = null;
let targetLookAt = null;
let animationProgress = 0;
const ANIMATION_DURATION = 2.0; // seconds

export function startCameraAnimation(targetPos, lookAt) {
    isAnimating = true;
    targetPosition = targetPos;
    targetLookAt = lookAt;
    animationProgress = 0;
    
    // Store initial camera position and target
    initialPosition = camera.position.clone();
    initialLookAt = controls.target.clone();
}

export function updateCameraAnimation(deltaTime) {
    if (!isAnimating) return;

    animationProgress += deltaTime / ANIMATION_DURATION;
    if (animationProgress >= 1) {
        animationProgress = 1;
        isAnimating = false;
    }

    // Smooth easing function
    const t = 1 - Math.pow(1 - animationProgress, 3);

    // Interpolate camera position
    camera.position.lerpVectors(initialPosition, targetPosition, t);
    
    // Interpolate look-at target
    controls.target.lerpVectors(initialLookAt, targetLookAt, t);
    
    // Update camera
    camera.lookAt(controls.target);
    controls.update();
}

let initialPosition = null;
let initialLookAt = null;

export function resetCamera() {
    if (initialPosition && initialLookAt) {
        startCameraAnimation(initialPosition, initialLookAt);
    }
}

export { isAnimating };
