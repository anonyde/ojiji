import { scene } from '../core/setup.js';

export class FlickeringLight {
    constructor(position, color = 0xffffff, intensity = 1) {
        this.light = new THREE.SpotLight(color, intensity);
        this.light.position.copy(position);
        this.light.angle = Math.PI / 3;
        this.light.penumbra = 0.5;
        this.light.decay = 2;
        this.light.distance = 6;
        this.light.castShadow = true;
        this.light.shadow.bias = -0.001;
        this.light.shadow.mapSize.width = 1024;
        this.light.shadow.mapSize.height = 1024;

        // Point light downward
        this.light.target.position.set(position.x, 0, position.z);

        // Add visible light fixture to ceiling
        const fixtureGroup = new THREE.Group();

        // Main fixture housing
        const fixture = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.1, 0.4),
            new THREE.MeshStandardMaterial({
                color: 0x404040,
                metalness: 0.8,
                roughness: 0.2
            })
        );
        fixtureGroup.add(fixture);

        // Light panel
        const panel = new THREE.Mesh(
            new THREE.PlaneGeometry(0.35, 0.35),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.9
            })
        );
        panel.rotation.x = Math.PI / 2;
        panel.position.y = -0.05;
        fixtureGroup.add(panel);

        fixtureGroup.position.copy(position);
        this.panel = panel;

        scene.add(this.light);
        scene.add(this.light.target);
        scene.add(fixtureGroup);

        this.originalIntensity = intensity;
        this.nextFlicker = Math.random() * 2000;
        this.flickerDuration = 0;
    }

    update(time) {
        if (time > this.nextFlicker) {
            if (this.flickerDuration === 0) {
                // Start new flicker
                this.flickerDuration = 50 + Math.random() * 200;
                this.flickerIntensity = Math.random() * 0.8;
            }
            
            this.flickerDuration--;
            
            if (this.flickerDuration <= 0) {
                // End flicker
                this.light.intensity = this.originalIntensity;
                this.panel.material.emissiveIntensity = 0.5;
                this.nextFlicker = time + 1000 + Math.random() * 3000;
            } else {
                // During flicker
                const intensity = this.originalIntensity * (0.2 + this.flickerIntensity * Math.random());
                this.light.intensity = intensity;
                this.panel.material.emissiveIntensity = intensity * 0.5;
            }
        }
    }
}

export class ElectricalSpark {
    constructor() {
        this.sparks = [];
        this.nextSparkTime = Math.random() * 2000;
    }

    createSpark(position) {
        const points = [];
        const segments = 10;
        let prevPoint = position.clone();
        
        for (let i = 0; i < segments; i++) {
            const point = prevPoint.clone().add(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    -0.1 + (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.2
                )
            );
            points.push(prevPoint.clone());
            prevPoint = point;
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 1
        });

        const spark = new THREE.Line(geometry, material);
        scene.add(spark);

        return {
            mesh: spark,
            duration: 10 + Math.random() * 10,
            maxDuration: 20
        };
    }

    update(time) {
        // Remove finished sparks
        this.sparks = this.sparks.filter(spark => {
            if (spark.duration <= 0) {
                scene.remove(spark.mesh);
                return false;
            }
            spark.duration--;
            spark.mesh.material.opacity = spark.duration / spark.maxDuration;
            return true;
        });

        // Create new sparks
        if (time > this.nextSparkTime) {
            // Random positions near ceiling corners
            const sparkPositions = [
                new THREE.Vector3(-3, 2.9, -3), // Near ceiling corner
                new THREE.Vector3(3, 2.9, -3),  // Other ceiling corner
                new THREE.Vector3(0, 2.9, -2),  // Above computer
            ];
            
            const position = sparkPositions[Math.floor(Math.random() * sparkPositions.length)];
            this.sparks.push(this.createSpark(position));
            this.nextSparkTime = time + 2000 + Math.random() * 5000;
        }
    }
}
