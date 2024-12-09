import { scene } from '../core/setup.js';
import { createHologram } from './hologram.js';
const THREE = window.THREE;

// Make synthesisChamber accessible to hologram.js
window.synthesisChamber = null;

class ChamberWire {
    constructor(startPoint, endPoint, color = 0x00ff00, thickness = 0.015, filled = true) {
        const points = [];
        for (let i = 0; i <= 40; i++) {
            const t = i / 40;
            const startToEnd = new THREE.Vector3().subVectors(endPoint, startPoint);
            let x = startPoint.x + startToEnd.x * t;
            let y = 0.05;
            let z = startPoint.z;

            if (t > 0.8) {
                y = 0.05 + (endPoint.y - 0.05) * ((t - 0.8) / 0.2);
                z = startPoint.z + ((endPoint.z - startPoint.z) * ((t - 0.8) / 0.2));
            }

            points.push(new THREE.Vector3(x, y, z));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 40, thickness, 8, false);
        const material = new THREE.MeshStandardMaterial({
            color: filled ? color : 0x303030,
            metalness: 0.8,
            roughness: 0.2,
            emissive: filled ? color : 0x000000,
            emissiveIntensity: filled ? 0.2 : 0
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.filled = filled;
        scene.add(this.mesh);
    }

    pulse() {
        if (this.filled) {
            const intensity = (Math.sin(Date.now() * 0.003) + 1) * 0.3;
            this.mesh.material.emissiveIntensity = intensity;
        }
    }
}

let tubeCount = 0;
let screenDisplay;
let glassSegment;
let chamberGroup;
let sparkles = [];
let hologram = null;
let tubeColors = [];

function createSparkle(color, position) {
    const sparkle = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 8, 8),
        new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 1
        })
    );
    sparkle.position.copy(position);
    sparkle.userData = {
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            Math.random() * 0.2,
            (Math.random() - 0.5) * 0.1
        ),
        age: 0
    };
    scene.add(sparkle);
    sparkles.push(sparkle);
}

function updateSparkles() {
    for (let i = sparkles.length - 1; i >= 0; i--) {
        const sparkle = sparkles[i];
        sparkle.userData.age += 0.016;
        
        sparkle.position.add(sparkle.userData.velocity);
        sparkle.userData.velocity.y -= 0.01; // gravity
        
        sparkle.material.opacity = 1 - (sparkle.userData.age * 2);
        
        if (sparkle.userData.age >= 0.5) {
            scene.remove(sparkle);
            sparkles.splice(i, 1);
        }
    }
}

function reset() {
    tubeCount = 0;
    tubeColors = [];
    if (hologram) {
        hologram = null;
    }
    updateDisplay();
}

export function createSynthesisChamber(computerPosition) {
    chamberGroup = new THREE.Group();
    const wires = [];

    // Main chamber body with segments
    const segments = [
        { height: 0.3, radius: 0.4, y: 0.15, color: 0x303030 },
        { height: 0.6, radius: 0.35, y: 0.6, color: 0x404040, glass: true },
        { height: 0.4, radius: 0.3, y: 1.1, color: 0x303030 },
        { height: 0.2, radius: 0.25, y: 1.4, color: 0x202020 }
    ];

    segments.forEach(seg => {
        const segment = new THREE.Mesh(
            new THREE.CylinderGeometry(seg.radius, seg.radius, seg.height, 32),
            new THREE.MeshStandardMaterial({
                color: seg.color,
                metalness: 0.8,
                roughness: 0.2
            })
        );
        segment.position.y = seg.y;
        segment.userData.isChamber = true;
        chamberGroup.add(segment);

        if (seg.glass) {
            const glass = new THREE.Mesh(
                new THREE.CylinderGeometry(seg.radius - 0.02, seg.radius - 0.02, seg.height - 0.05, 32),
                new THREE.MeshStandardMaterial({
                    color: 0x88ccff,
                    metalness: 0.9,
                    roughness: 0.1,
                    transparent: true,
                    opacity: 0.3
                })
            );
            glass.position.y = seg.y;
            glass.userData.isChamber = true;
            glassSegment = glass;
            chamberGroup.add(glass);

            const internalParts = new THREE.Group();
            const column = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, seg.height - 0.1, 16),
                new THREE.MeshStandardMaterial({ color: 0x505050, metalness: 0.8 })
            );
            column.userData.isChamber = true;
            internalParts.add(column);

            for (let i = 0; i < 3; i++) {
                const ring = new THREE.Mesh(
                    new THREE.TorusGeometry(0.15, 0.02, 16, 32),
                    new THREE.MeshStandardMaterial({ color: 0x606060, metalness: 0.9 })
                );
                ring.position.y = (i - 1) * 0.2;
                ring.rotation.x = Math.PI / 2;
                ring.userData.isChamber = true;
                internalParts.add(ring);
            }

            internalParts.position.y = seg.y;
            chamberGroup.add(internalParts);
        }
    });

    // Add large input funnels
    const funnelPositions = [
        { x: 0.35, y: 1.3, angle: -Math.PI / 6 },
        { x: -0.35, y: 1.3, angle: Math.PI / 6 }
    ];

    funnelPositions.forEach(pos => {
        const funnelGroup = new THREE.Group();

        const funnel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.06, 0.4, 32, 1, true),
            new THREE.MeshStandardMaterial({
                color: 0x404040,
                metalness: 0.8,
                roughness: 0.2
            })
        );
        funnel.userData.isChamber = true;
        funnelGroup.add(funnel);

        const rim = new THREE.Mesh(
            new THREE.TorusGeometry(0.2, 0.03, 16, 32),
            new THREE.MeshStandardMaterial({
                color: 0x505050,
                metalness: 0.9,
                roughness: 0.1
            })
        );
        rim.position.y = 0.2;
        rim.userData.isChamber = true;
        funnelGroup.add(rim);

        for (let i = 0; i < 2; i++) {
            const decorRing = new THREE.Mesh(
                new THREE.TorusGeometry(0.18 - (i * 0.03), 0.01, 16, 32),
                new THREE.MeshStandardMaterial({
                    color: 0x606060,
                    metalness: 0.9,
                    roughness: 0.1
                })
            );
            decorRing.position.y = 0.15 - (i * 0.05);
            decorRing.userData.isChamber = true;
            funnelGroup.add(decorRing);
        }

        const tube = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16),
            new THREE.MeshStandardMaterial({
                color: 0x303030,
                metalness: 0.9,
                roughness: 0.1
            })
        );
        tube.position.y = -0.2;
        tube.userData.isChamber = true;
        funnelGroup.add(tube);

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.08, 0.015, 16, 32),
            new THREE.MeshStandardMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 0.5
            })
        );
        ring.position.y = -0.1;
        ring.userData.isChamber = true;
        funnelGroup.add(ring);

        funnelGroup.position.set(pos.x, pos.y, 0);
        funnelGroup.rotation.z = pos.angle;
        chamberGroup.add(funnelGroup);
    });

    // Add control panel with screen
    const panel = createControlPanel();
    panel.position.set(0, 0.6, 0.35);
    panel.rotation.x = -Math.PI / 6;
    chamberGroup.add(panel);

    chamberGroup.position.set(
        computerPosition.x + 2,
        0,
        computerPosition.z
    );
    scene.add(chamberGroup);

    // Create wires
    const wireColors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff0000, 0x0000ff, 0xff8800, 0x8800ff];
    const wireStarts = [
        new THREE.Vector3(-0.3, 0.1, -0.2),
        new THREE.Vector3(-0.1, 0.1, -0.2),
        new THREE.Vector3(0.1, 0.1, -0.2),
        new THREE.Vector3(0.3, 0.1, -0.2),
        new THREE.Vector3(-0.3, 0.1, 0.2),
        new THREE.Vector3(-0.1, 0.1, 0.2),
        new THREE.Vector3(0.1, 0.1, 0.2),
        new THREE.Vector3(0.3, 0.1, 0.2)
    ];

    wireStarts.forEach((start, i) => {
        const wireStart = start.clone().add(chamberGroup.position);
        const wireEnd = new THREE.Vector3(
            computerPosition.x + 0.2,
            computerPosition.y + 0.3 + (i * 0.1),
            computerPosition.z - 0.4
        );

        const wire = new ChamberWire(wireStart, wireEnd, wireColors[i], 0.015, i < 4);
        wires.push(wire);
    });

    const chamber = {
        group: chamberGroup,
        wires,
        animate,
        addTestTube,
        reset
    };

    // Make chamber accessible to hologram.js
    window.synthesisChamber = chamber;

    return chamber;

    function animate() {
        wires.forEach(wire => wire.pulse());
        if (screenDisplay) {
            screenDisplay.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.003) * 0.2;
        }
        updateSparkles();
        if (hologram) {
            hologram.animate();
        }
    }

    function addTestTube(color) {
        if (tubeCount < 2) {
            tubeCount++;
            tubeColors.push(color);
            updateDisplay();
            
            if (glassSegment) {
                const originalColor = glassSegment.material.color.clone();
                const originalOpacity = glassSegment.material.opacity;
                
                glassSegment.material.color.setHex(color);
                glassSegment.material.opacity = 0.6;
                
                // Create sparkles
                for (let i = 0; i < 20; i++) {
                    const sparklePos = new THREE.Vector3(
                        chamberGroup.position.x + (Math.random() - 0.5) * 0.5,
                        chamberGroup.position.y + 0.6 + Math.random() * 0.6,
                        chamberGroup.position.z + (Math.random() - 0.5) * 0.5
                    );
                    createSparkle(color, sparklePos);
                }
                
                setTimeout(() => {
                    glassSegment.material.color.copy(originalColor);
                    glassSegment.material.opacity = originalOpacity;
                }, 500);

                // Create hologram when second tube is added
                if (tubeCount === 2) {
                    const hologramPosition = new THREE.Vector3(
                        chamberGroup.position.x + 2, // Position to the right of chamber
                        chamberGroup.position.y,
                        chamberGroup.position.z
                    );
                    hologram = createHologram(hologramPosition, tubeColors);
                }
            }
        }
    }
}

function createControlPanel() {
    const panel = new THREE.Group();
    
    const panelBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.3, 0.1),
        new THREE.MeshStandardMaterial({
            color: 0x202020,
            metalness: 0.8,
            roughness: 0.2
        })
    );
    panelBase.userData.isChamber = true;
    panel.add(panelBase);

    // Screen display (bigger size)
    screenDisplay = new THREE.Mesh(
        new THREE.PlaneGeometry(0.35, 0.25),
        new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5
        })
    );
    screenDisplay.position.z = 0.051;
    screenDisplay.position.y = 0.05;
    screenDisplay.userData.isChamber = true;

    // Create initial texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    context.fillStyle = '#001100';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'bold 144px Arial';
    context.fillStyle = '#00ff00';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('0/2', canvas.width / 2, canvas.height / 2);
    
    screenDisplay.material.map = new THREE.CanvasTexture(canvas);
    screenDisplay.material.map.needsUpdate = true;

    panel.add(screenDisplay);

    // Add buttons
    const buttonPositions = [
        { x: -0.12, y: -0.08 },
        { x: 0, y: -0.08 },
        { x: 0.12, y: -0.08 }
    ];

    buttonPositions.forEach(pos => {
        const button = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.01, 16),
            new THREE.MeshStandardMaterial({
                color: 0x666666,
                metalness: 0.7,
                roughness: 0.3
            })
        );
        button.rotation.x = Math.PI / 2;
        button.position.set(pos.x, pos.y, 0.051);
        button.userData.isChamber = true;
        panel.add(button);
    });

    return panel;
}

function updateDisplay() {
    if (screenDisplay) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        context.fillStyle = '#001100';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.font = 'bold 144px Arial';
        context.fillStyle = '#00ff00';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        if (tubeCount === 2) {
            context.fillText('✓', canvas.width / 2, canvas.height / 2);
        } else {
            context.fillText(`${tubeCount}/2`, canvas.width / 2, canvas.height / 2);
        }
        
        screenDisplay.material.map = new THREE.CanvasTexture(canvas);
        screenDisplay.material.map.needsUpdate = true;
    }
}

export function isChamberPart(object) {
    while (object) {
        if (object.userData && object.userData.isChamber) {
            return true;
        }
        object = object.parent;
    }
    return false;
}
