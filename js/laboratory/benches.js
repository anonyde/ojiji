import { scene } from '../core/setup.js';

export function createLabBenches() {
    // Only create the left bench for test tubes
    const benchMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x505050,
        roughness: 0.3,
        metalness: 0.7
    });

    const bench = new THREE.Group();

    // Top
    const top = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.1, 1.5),
        benchMaterial
    );
    bench.add(top);

    // Legs
    const legPositions = [
        [-1.9, -0.5, -0.7], [-1.9, -0.5, 0.7],
        [1.9, -0.5, -0.7], [1.9, -0.5, 0.7]
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 1, 16),
            benchMaterial
        );
        leg.position.set(...pos);
        bench.add(leg);
    });

    // Add cabinets
    const cabinetMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
        roughness: 0.4,
        metalness: 0.6
    });

    [-1.5, 0, 1.5].forEach(offset => {
        const cabinet = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.8, 1.4),
            cabinetMaterial
        );
        cabinet.position.set(offset, -0.4, 0);
        bench.add(cabinet);

        // Add handle
        const handle = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.02, 0.02),
            new THREE.MeshStandardMaterial({
                color: 0x808080,
                metalness: 0.9,
                roughness: 0.1
            })
        );
        handle.position.set(offset, -0.4, 0.7);
        bench.add(handle);
    });

    // Position bench on the left side
    bench.position.set(-3, 1, 0);
    bench.castShadow = true;
    bench.receiveShadow = true;
    scene.add(bench);
}
