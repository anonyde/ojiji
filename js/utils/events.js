import { updateOnResize } from '../core/setup.js';
import { camera, renderer } from '../core/setup.js';
import { resetCamera } from '../animation/camera.js';
import { handleKeyInput, setZoomedIn, handleScreenClick, handleScreenMouseMove } from '../animation/screen.js';
import { selectTestTube, getTestTubes } from '../laboratory/equipment.js';
import { isChamberPart } from '../laboratory/synthesisChamber.js';

const THREE = window.THREE;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isAtComputer = false;

function onClick(event) {
    // Only handle left clicks for test tube selection
    if (event.button !== 0) return;

    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Check for screen click when zoomed in
    if (camera.position.z < 0.1) {
        const canvasX = (mouse.x + 1) * window.innerWidth / 2;
        const canvasY = (-mouse.y + 1) * window.innerHeight / 2;
        if (handleScreenClick(canvasX, canvasY)) {
            return;
        }
    }

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Get all test tubes
    const testTubes = getTestTubes();

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(renderer.scene.children, true);

    for (const intersect of intersects) {
        const object = intersect.object;

        // Check if we hit a chamber part
        if (isChamberPart(object)) {
            selectTestTube(null); // This will trigger addTestTube if a tube is selected
            return;
        }

        // Check if we hit a test tube
        let testTube = object;
        while (testTube.parent && !testTube.userData.isTestTube) {
            testTube = testTube.parent;
        }

        if (testTube.userData.isTestTube) {
            selectTestTube(testTube);
            return;
        }

        // Check other clickable objects
        if (object.userData.clickable && object.userData.onClick) {
            object.userData.onClick();
            isAtComputer = object.userData.isComputerScreen;
            setZoomedIn(true, isAtComputer);
            return;
        }
    }
}

function onMouseMove(event) {
    // Handle screen hover effects when zoomed in
    if (camera.position.z < 0.1) {
        const canvasX = (event.clientX / window.innerWidth) * window.innerWidth;
        const canvasY = (event.clientY / window.innerHeight) * window.innerHeight;
        handleScreenMouseMove(canvasX, canvasY);
    }
}

function onKeyDown(event) {
    // Handle terminal input when at computer screen
    if (isAtComputer) {
        // Always prevent default for special keys we handle
        if (event.key === 'Backspace' || 
            event.key === 'ArrowUp' || 
            event.key === 'ArrowDown' || 
            event.key === 'Enter' ||
            event.key === 'Tab' ||
            event.key === 'Delete' ||
            event.key === 'Home' ||
            event.key === 'End' ||
            (!event.metaKey && !event.ctrlKey && !event.altKey && event.key.length === 1)) {
            event.preventDefault();
            handleKeyInput(event.key);
            return;
        }
    }

    // Press 'Escape' to reset camera view
    if (event.key === 'Escape') {
        resetCamera();
        setZoomedIn(false);
        isAtComputer = false;
    }
}

export function setupEventListeners() {
    window.addEventListener('resize', () => {
        updateOnResize();
    });

    window.addEventListener('mousedown', onClick);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
}
