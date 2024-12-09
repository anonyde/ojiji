import { scene } from '../core/setup.js';

class Wire {
    constructor(startPoint, endPoint) {
        const points = [];
        for (let i = 0; i <= 30; i++) {
            const t = i / 30;
            
            // Create a natural curve path
            let x = startPoint.x + (endPoint.x - startPoint.x) * t;
            let y = startPoint.y;
            let z = startPoint.z + (endPoint.z - startPoint.z) * t;

            // Add a slight arc
            if (t > 0.1 && t < 0.9) {
                const curveY = Math.sin((t - 0.1) * Math.PI / 0.8) * 0.05;
                y += curveY;
            }

            points.push(new THREE.Vector3(x, y, z));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 30, 0.02, 8, false);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5
        });

        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);
    }

    pulse() {
        const intensity = (Math.sin(Date.now() * 0.003) + 1) * 0.3;
        this.mesh.material.emissiveIntensity = intensity + 0.2;
    }
}

export function createDockingStation(computerPosition) {
    // Create main circular plate
    const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 0.02, 32),
        new THREE.MeshStandardMaterial({
            color: 0x303030,
            metalness: 0.9,
            roughness: 0.1
        })
    );
    
    // Position on ground to right of chamber
    plate.position.set(
        computerPosition.x + 3.5, // Further right of chamber
        0.01, // Just above ground
        computerPosition.z + 0.3 // Slightly forward for visibility
    );
    
    // Add glowing outer ring
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.6, 0.04, 16, 32),
        new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.7,
            metalness: 0.9,
            roughness: 0.1
        })
    );
    ring.position.copy(plate.position);
    ring.rotation.x = Math.PI / 2; // Lay flat
    
    // Add inner ring
    const innerRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.4, 0.02, 16, 32),
        new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5,
            metalness: 0.9,
            roughness: 0.1
        })
    );
    innerRing.position.copy(plate.position);
    innerRing.rotation.x = Math.PI / 2;

    // Add center circle
    const centerCircle = new THREE.Mesh(
        new THREE.CircleGeometry(0.25, 32),
        new THREE.MeshStandardMaterial({
            color: 0x202020,
            metalness: 0.9,
            roughness: 0.1
        })
    );
    centerCircle.position.copy(plate.position);
    centerCircle.position.y = 0.011;
    centerCircle.rotation.x = -Math.PI / 2;
    
    // Add connection ports in a circle
    const ports = [];
    const portCount = 8;
    for (let i = 0; i < portCount; i++) {
        const angle = (i / portCount) * Math.PI * 2;
        const radius = 0.45;
        
        // Port base
        const port = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8),
            new THREE.MeshStandardMaterial({
                color: 0x202020,
                metalness: 0.9,
                roughness: 0.1
            })
        );
        
        port.position.set(
            plate.position.x + Math.cos(angle) * radius,
            0.025,
            plate.position.z + Math.sin(angle) * radius
        );

        // Add glowing ring around each port
        const portRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.03, 0.006, 8, 16),
            new THREE.MeshStandardMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 0.5,
                metalness: 0.9,
                roughness: 0.1
            })
        );
        portRing.position.copy(port.position);
        portRing.position.y = 0.04;
        portRing.rotation.x = Math.PI / 2;
        
        ports.push({ base: port, ring: portRing });
    }

    // Create wire connecting to chamber
    const wireStart = new THREE.Vector3(
        plate.position.x - 0.4, // Start from left side of dock
        0.05, // Just above ground
        plate.position.z
    );
    
    const wireEnd = new THREE.Vector3(
        computerPosition.x + 2.3, // Connect to right side of chamber
        0.05, // Keep at same height
        computerPosition.z
    );

    const wire = new Wire(wireStart, wireEnd);
    
    // Add to scene
    scene.add(plate);
    scene.add(ring);
    scene.add(innerRing);
    scene.add(centerCircle);
    ports.forEach(port => {
        scene.add(port.base);
        scene.add(port.ring);
    });
    
    function animate() {
        // Pulse the rings
        const intensity = (Math.sin(Date.now() * 0.003) + 1) * 0.4;
        ring.material.emissiveIntensity = intensity + 0.3;
        innerRing.material.emissiveIntensity = intensity + 0.1;
        ports.forEach(port => {
            port.ring.material.emissiveIntensity = intensity;
        });
        wire.pulse();
    }
    
    return { plate, ring, innerRing, ports, wire, animate };
}
