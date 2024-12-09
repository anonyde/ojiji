import { scene } from '../core/setup.js';

export function addSafetyEquipment() {
    // Add eye wash station
    const eyeWash = new THREE.Group();
    const basin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.3,
            roughness: 0.7
        })
    );
    eyeWash.add(basin);

    const spout = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.3, 16),
        new THREE.MeshStandardMaterial({
            color: 0x808080,
            metalness: 0.9,
            roughness: 0.1
        })
    );
    spout.position.set(0, 0.2, 0);
    eyeWash.add(spout);

    eyeWash.position.set(-9, 1.5, -5);
    scene.add(eyeWash);

    // Add safety shower
    const shower = new THREE.Group();
    const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 2, 16),
        new THREE.MeshStandardMaterial({
            color: 0x808080,
            metalness: 0.9,
            roughness: 0.1
        })
    );
    shower.add(pipe);

    const head = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32),
        new THREE.MeshStandardMaterial({
            color: 0x808080,
            metalness: 0.9,
            roughness: 0.1
        })
    );
    head.position.y = 1;
    shower.add(head);

    shower.position.set(-9, 1, -8);
    scene.add(shower);
}
