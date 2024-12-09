import { scene } from '../core/setup.js';
const THREE = window.THREE;

export function addFloorAndWalls() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xeeeeee,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling - raised to 4 units height
    const ceilingGeometry = new THREE.PlaneGeometry(20, 20);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xdddddd,
        roughness: 0.8,
        metalness: 0.2
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4;
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    // Add ceiling tiles for more detail
    const tileSize = 1;
    const tilesPerSide = 20;
    for (let x = -tilesPerSide/2; x < tilesPerSide/2; x++) {
        for (let z = -tilesPerSide/2; z < tilesPerSide/2; z++) {
            const tileGeometry = new THREE.BoxGeometry(tileSize - 0.05, 0.05, tileSize - 0.05);
            const tileMaterial = new THREE.MeshStandardMaterial({
                color: 0xcacaca,
                roughness: 0.9,
                metalness: 0.1
            });
            const tile = new THREE.Mesh(tileGeometry, tileMaterial);
            tile.position.set(x * tileSize + tileSize/2, 3.97, z * tileSize + tileSize/2);
            tile.receiveShadow = true;
            scene.add(tile);
        }
    }

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe8e8e8,
        roughness: 0.5,
        metalness: 0.1
    });

    const walls = [
        { position: [0, 2, -10], rotation: [0, 0, 0] },
        { position: [-10, 2, 0], rotation: [0, Math.PI / 2, 0] },
        { position: [10, 2, 0], rotation: [0, -Math.PI / 2, 0] }
    ];

    walls.forEach(wall => {
        const wallMesh = new THREE.Mesh(new THREE.PlaneGeometry(20, 4), wallMaterial);
        wallMesh.position.set(...wall.position);
        wallMesh.rotation.set(...wall.rotation);
        wallMesh.receiveShadow = true;
        scene.add(wallMesh);
    });
}
