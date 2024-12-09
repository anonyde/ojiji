import { initScene } from './core/setup.js';
import { initControls } from './core/controls.js';
import { addLights } from './environment/lights.js';
import { addFloorAndWalls } from './environment/structure.js';
import { createDesk } from './workstation/desk.js';
import { createComputer, computerPosition } from './workstation/computer.js';
import { createLabBenches } from './laboratory/benches.js';
import { setupLabEquipment } from './laboratory/equipment.js';
import { addSafetyEquipment } from './laboratory/safety.js';
import { animate } from './animation/loop.js';
import { setupEventListeners } from './utils/events.js';
import { AtmosphereManager } from './effects/atmosphere.js';
import { createSynthesisChamber } from './laboratory/synthesisChamber.js';
import { createDockingStation } from './laboratory/dockingStation.js';
import { initScreen } from './animation/screen.js';

let atmosphereManager;
let synthesisChamber;
let dockingStation;
let isLabInitialized = false;

function initLab() {
    try {
        // Initialize core components
        initScene();
        initControls();

        // Create scene elements
        addLights();
        addFloorAndWalls();
        createDesk();
        createComputer();
        createLabBenches();
        setupLabEquipment();
        addSafetyEquipment();

        // Create synthesis chamber using the computer's position
        synthesisChamber = createSynthesisChamber(computerPosition);

        // Create docking station
        dockingStation = createDockingStation(computerPosition);

        // Initialize atmosphere effects
        atmosphereManager = new AtmosphereManager();

        // Initialize screen and UI elements
        initScreen();

        // Setup event handlers
        setupEventListeners();

        // Start animation loop
        animate();

        isLabInitialized = true;
    } catch (error) {
        console.error('Error initializing scene:', error);
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            const warning = document.createElement('div');
            warning.className = 'warning';
            warning.textContent = 'Error initializing laboratory systems';
            loadingScreen.appendChild(warning);
        }
    }
}

function enterLab() {
    const loadingScreen = document.getElementById('loading-screen');
    const returnButton = document.getElementById('return-button');

    if (!isLabInitialized) {
        initLab();
    }

    // Add fade-out effect
    loadingScreen.style.transition = 'opacity 1s ease-out';
    loadingScreen.style.opacity = '0';

    // Show return button with fade-in
    returnButton.style.display = 'block';
    returnButton.style.opacity = '0';
    returnButton.style.transition = 'opacity 0.5s ease-in';
    
    // Slight delay before showing return button
    setTimeout(() => {
        returnButton.style.opacity = '1';
    }, 1000);

    // Remove loading screen after fade
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 1000);
}

// Setup enter button handler
function init() {
    const enterButton = document.getElementById('enter-button');
    if (enterButton) {
        enterButton.addEventListener('click', enterLab);
    }

    // Setup return button handler
    const returnButton = document.getElementById('return-button');
    if (returnButton) {
        returnButton.addEventListener('click', () => {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.style.display = 'flex';
            loadingScreen.style.opacity = '1';
            returnButton.style.opacity = '0';
            setTimeout(() => {
                returnButton.style.display = 'none';
            }, 500);
        });
    }
}

// Wait for DOM to be fully loaded
window.addEventListener('load', init);

export { atmosphereManager, synthesisChamber, dockingStation };
