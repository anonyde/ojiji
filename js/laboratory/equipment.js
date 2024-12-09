import { scene } from '../core/setup.js';
import { synthesisChamber } from '../main.js';

const THREE = window.THREE;
let selectedTube = null;
const tubes = [];
let tubeArrow = null;
let chamberArrow = null;
let waitText = null;
let usedTubeCount = 0;

function createArrow(color = 0x00ff00) {
    const arrowGroup = new THREE.Group();

    // Arrow shaft (made smaller)
    const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.2, 8),
        new THREE.MeshBasicMaterial({ color: color })
    );
    arrowGroup.add(shaft);

    // Arrow head (made smaller)
    const head = new THREE.Mesh(
        new THREE.ConeGeometry(0.03, 0.1, 8),
        new THREE.MeshBasicMaterial({ color: color })
    );
    head.position.y = 0.15; // Move to top of shaft
    arrowGroup.add(head);

    // Rotate entire arrow to point downward
    arrowGroup.rotation.z = Math.PI;

    return arrowGroup;
}

function createWaitText() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    
    // Create gradient
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0)');
    gradient.addColorStop(0.1, 'rgba(0, 255, 0, 0.8)');
    gradient.addColorStop(0.9, 'rgba(0, 255, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = '28px monospace';
    context.fillStyle = '#000000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('AWAITING NEXT OBJECTIVE', canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.position.set(-3, 1.7, 0); // Positioned closer to test tubes
    sprite.scale.set(1.2, 0.15, 1);
    return sprite;
}

export function setupLabEquipment() {
    // Keep the lab environment simple and clean
    addTestTubeRack(-3, 0);
    
    // Add arrow pointing to first tube
    tubeArrow = createArrow();
    tubeArrow.position.set(-3.5, 1.8, 0); // Position above first tube
    scene.add(tubeArrow);

    // Animate the arrow
    function animateArrow() {
        if (tubeArrow) {
            tubeArrow.position.y = 1.8 + Math.sin(Date.now() * 0.003) * 0.1;
            requestAnimationFrame(animateArrow);
        }
    }
    animateArrow();
}

function addTestTubeRack(x, z) {
    const group = new THREE.Group();
    
    // Rack base - extended to fit all 8 tubes
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.1, 0.2),
        new THREE.MeshStandardMaterial({
            color: 0x303030,
            metalness: 0.9,
            roughness: 0.1
        })
    );
    group.add(base);

    // Test tubes with glowing liquids
    const colors = [
        0xff4444, // Red
        0x44ff44, // Green
        0x4444ff, // Blue
        0xff44ff, // Purple
        0xff8800, // Orange
        0x00ffff, // Cyan
        0xffff00, // Yellow
        0xff00ff  // Magenta
    ];

    for (let i = 0; i < 8; i++) {
        const tubeGroup = new THREE.Group();
        tubeGroup.userData.isTestTube = true;
        tubeGroup.userData.baseY = 0.2;
        tubeGroup.userData.index = i;
        tubeGroup.userData.inChamber = false;
        tubeGroup.userData.hasLiquid = true; // All tubes are now active

        const tube = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.3, 16),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3,
                roughness: 0,
                metalness: 0
            })
        );
        
        // Add liquid to all tubes with different colors
        const liquid = new THREE.Mesh(
            new THREE.CylinderGeometry(0.028, 0.028, 0.2, 16),
            new THREE.MeshStandardMaterial({
                color: colors[i],
                transparent: true,
                opacity: 0.8,
                roughness: 0.1,
                metalness: 0.1,
                emissive: colors[i],
                emissiveIntensity: 0.2
            })
        );
        liquid.position.y = -0.05;
        tubeGroup.userData.color = colors[i];
        tube.add(liquid);

        // Add connection port to all tubes
        const port = new THREE.Mesh(
            new THREE.CylinderGeometry(0.01, 0.01, 0.05, 16),
            new THREE.MeshStandardMaterial({
                color: 0x404040,
                metalness: 0.8,
                roughness: 0.2
            })
        );
        port.rotation.z = Math.PI / 2;
        port.position.set(0.04, 0, 0);
        tube.add(port);

        tubeGroup.add(tube);
        tubeGroup.position.set(-0.64 + i * 0.16, 0.2, 0);
        
        tubes.push(tubeGroup);
        group.add(tubeGroup);
    }

    group.position.set(x, 1.1, z);
    scene.add(group);
}

export function selectTestTube(tube) {
    // Check if chamber is at max capacity
    if (window.synthesisChamber && window.synthesisChamber.tubeCount === 2) {
        return;
    }

    // If null is passed, it means the chamber was clicked
    if (tube === null) {
        if (selectedTube && !selectedTube.userData.inChamber) {
            selectedTube.userData.inChamber = true;
            selectedTube.visible = false;
            if (synthesisChamber) {
                synthesisChamber.addTestTube(selectedTube.userData.color || 0x00ff00);
            }
            selectedTube = null;
            usedTubeCount++;

            // Remove chamber arrow if it exists
            if (chamberArrow) {
                scene.remove(chamberArrow);
                chamberArrow = null;
            }

            // Show wait text if all tubes are used
            if (usedTubeCount === 8 && !waitText) {
                waitText = createWaitText();
                scene.add(waitText);

                // Animate wait text opacity
                function animateWaitText() {
                    if (waitText) {
                        waitText.material.opacity = 0.4 + Math.sin(Date.now() * 0.002) * 0.2;
                        requestAnimationFrame(animateWaitText);
                    }
                }
                animateWaitText();
            }
        }
        return;
    }

    // Only allow selecting tubes with liquid and not in chamber
    if (!tube.userData.hasLiquid || tube.userData.inChamber) {
        return;
    }

    // If a tube is clicked
    if (selectedTube === tube) {
        // Deselect if clicking the same tube
        selectedTube.position.y = selectedTube.userData.baseY;
        selectedTube = null;
    } else if (!tube.userData.inChamber) {
        // Reset previous selection
        if (selectedTube && !selectedTube.userData.inChamber) {
            selectedTube.position.y = selectedTube.userData.baseY;
        }
        // Select new tube
        selectedTube = tube;
        selectedTube.position.y = selectedTube.userData.baseY + 0.1;

        // Remove tube arrow
        if (tubeArrow) {
            scene.remove(tubeArrow);
            tubeArrow = null;
        }

        // Add arrow pointing to chamber if not already present
        if (!chamberArrow) {
            chamberArrow = createArrow(0x00ff00);
            // Position at the synthesis chamber's position
            chamberArrow.position.set(2, 1.8, 0); // Adjusted position for chamber
            scene.add(chamberArrow);

            // Animate the chamber arrow
            function animateChamberArrow() {
                if (chamberArrow) {
                    chamberArrow.position.y = 1.8 + Math.sin(Date.now() * 0.003) * 0.1;
                    requestAnimationFrame(animateChamberArrow);
                }
            }
            animateChamberArrow();
        }
    }
}

export function getTestTubes() {
    return tubes;
}
