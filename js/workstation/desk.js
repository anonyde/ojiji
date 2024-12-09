import { scene } from '../core/setup.js';

export function createDesk() {
    // Main computer desk
    const deskMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x505050,
        roughness: 0.3,
        metalness: 0.7
    });

    const desk = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.1, 1.2),
        deskMaterial
    );
    desk.position.set(0, 1, 0);
    desk.castShadow = true;
    desk.receiveShadow = true;
    scene.add(desk);

    // Desk legs
    const legPositions = [
        [-0.9, 0.5, -0.5], [-0.9, 0.5, 0.5],
        [0.9, 0.5, -0.5], [0.9, 0.5, 0.5]
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 1, 16),
            deskMaterial
        );
        leg.position.set(...pos);
        leg.castShadow = true;
        scene.add(leg);
    });

    // Keyboard and mouse
    const peripheralMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.5,
        roughness: 0.5
    });

    const keyboard = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.02, 0.2),
        peripheralMaterial
    );
    keyboard.position.set(0, 1.11, 0.4);
    scene.add(keyboard);

    const mouse = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.02, 0.15),
        peripheralMaterial
    );
    mouse.position.set(0.4, 1.11, 0.4);
    scene.add(mouse);
}
