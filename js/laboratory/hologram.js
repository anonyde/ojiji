import { scene } from '../core/setup.js';
const THREE = window.THREE;

// Get camera reference from setup
import { camera } from '../core/setup.js';

class HologramDroid {
    constructor(position, colors) {
        this.group = new THREE.Group();
        this.colors = colors;
        this.spawnTime = Date.now();
        this.isGenerating = true;
        this.isSending = false;
        this.sendStartTime = 0;
        this.sendButton = null;
        this.sendText = null;
        
        // Base platform with glow - made fully transparent
        const platform = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.7, 0.1, 32),
            new THREE.MeshStandardMaterial({
                color: 0x88ff88,
                metalness: 0.3,
                roughness: 0.5,
                transparent: true,
                opacity: 0.1,
                emissive: 0x88ff88,
                emissiveIntensity: 0.05
            })
        );
        platform.position.y = 0.05; // Half height of platform
        this.group.add(platform);

        // Random geometry selection for body
        const bodyGeometries = [
            new THREE.CylinderGeometry(0.25, 0.2, 1.0, 8),
            new THREE.BoxGeometry(0.5, 1.0, 0.5),
            new THREE.OctahedronGeometry(0.35),
            new THREE.ConeGeometry(0.25, 1.0, 8)
        ];
        const randomBodyGeometry = bodyGeometries[Math.floor(Math.random() * bodyGeometries.length)];
        
        this.bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.colors[0],
            transparent: true,
            opacity: 0,
            emissive: this.colors[0],
            emissiveIntensity: 0.5,
            wireframe: true
        });
        this.body = new THREE.Mesh(randomBodyGeometry, this.bodyMaterial);
        this.body.position.y = 0.6; // Adjusted to be centered
        this.group.add(this.body);

        // Random geometry for head
        const headGeometries = [
            new THREE.SphereGeometry(0.2, 8, 8),
            new THREE.DodecahedronGeometry(0.2),
            new THREE.TetrahedronGeometry(0.2),
            new THREE.IcosahedronGeometry(0.2)
        ];
        const randomHeadGeometry = headGeometries[Math.floor(Math.random() * headGeometries.length)];
        
        this.headMaterial = new THREE.MeshStandardMaterial({
            color: this.colors[0],
            transparent: true,
            opacity: 0,
            emissive: this.colors[0],
            emissiveIntensity: 0.5,
            wireframe: true
        });
        this.head = new THREE.Mesh(randomHeadGeometry, this.headMaterial);
        this.head.position.y = 1.1; // Adjusted to be centered
        this.group.add(this.head);

        // Random geometry for arms
        const armGeometries = [
            new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8),
            new THREE.BoxGeometry(0.08, 0.6, 0.08),
            new THREE.ConeGeometry(0.04, 0.6, 8)
        ];
        
        this.armMaterial = new THREE.MeshStandardMaterial({
            color: this.colors[0],
            transparent: true,
            opacity: 0,
            emissive: this.colors[0],
            emissiveIntensity: 0.5,
            wireframe: true
        });

        // Left arm
        const leftArmGeometry = armGeometries[Math.floor(Math.random() * armGeometries.length)];
        this.leftArm = new THREE.Mesh(leftArmGeometry.clone(), this.armMaterial.clone());
        this.leftArm.position.set(-0.35, 0.7, 0); // Adjusted position
        this.leftArm.rotation.z = Math.PI / 4;
        this.group.add(this.leftArm);

        // Right arm - using different random geometry for variety
        const rightArmGeometry = armGeometries[Math.floor(Math.random() * armGeometries.length)];
        this.rightArm = new THREE.Mesh(rightArmGeometry, this.armMaterial.clone());
        this.rightArm.position.set(0.35, 0.7, 0); // Adjusted position
        this.rightArm.rotation.z = -Math.PI / 4;
        this.group.add(this.rightArm);

        // Generation particles
        this.particles = new THREE.Group();
        for (let i = 0; i < 20; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.02, 4, 4),
                new THREE.MeshBasicMaterial({
                    color: this.colors[0],
                    transparent: true,
                    opacity: 0
                })
            );
            particle.position.set(
                (Math.random() - 0.5) * 1.4,
                Math.random() * 1.4,
                (Math.random() - 0.5) * 1.4
            );
            this.particles.add(particle);
        }
        this.group.add(this.particles);

        // Position the hologram
        this.group.position.copy(position);
        this.group.scale.set(1, 1, 1);

        // Add user data for identification
        this.group.userData.isHologram = true;

        scene.add(this.group);

        // Create Send to DEV button after generation is complete
        setTimeout(() => {
            this.createSendButton();
        }, 2000);
    }

    createSendButton() {
        // Create Send to DEV button
        this.sendButton = document.createElement('button');
        this.sendButton.textContent = 'Send to DEV';
        this.sendButton.style.position = 'fixed';
        this.sendButton.style.padding = '10px 20px';
        this.sendButton.style.backgroundColor = '#003300';
        this.sendButton.style.border = '2px solid #00ff00';
        this.sendButton.style.color = '#00ff00';
        this.sendButton.style.fontFamily = 'monospace';
        this.sendButton.style.fontSize = '16px';
        this.sendButton.style.cursor = 'pointer';
        this.sendButton.style.zIndex = '1000';
        this.sendButton.style.transition = 'background-color 0.3s';
        this.sendButton.style.pointerEvents = 'auto';

        // Position the button near the hologram in screen space
        const vector = new THREE.Vector3();
        vector.setFromMatrixPosition(this.group.matrixWorld);
        vector.project(camera);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight - 100;

        this.sendButton.style.left = `${x - 60}px`;
        this.sendButton.style.top = `${y}px`;

        this.sendButton.addEventListener('mouseover', () => {
            this.sendButton.style.backgroundColor = '#004400';
        });

        this.sendButton.addEventListener('mouseout', () => {
            this.sendButton.style.backgroundColor = '#003300';
        });

        this.sendButton.addEventListener('click', () => {
            this.startSending();
        });

        document.body.appendChild(this.sendButton);
    }

    startSending() {
        this.isSending = true;
        this.sendStartTime = Date.now();
        
        // Remove send button
        if (this.sendButton) {
            this.sendButton.remove();
            this.sendButton = null;
        }

        // Create sending text
        this.sendText = document.createElement('div');
        this.sendText.style.position = 'fixed';
        this.sendText.style.color = '#00ff00';
        this.sendText.style.fontFamily = 'monospace';
        this.sendText.style.fontSize = '16px';
        this.sendText.style.zIndex = '1000';
        this.sendText.textContent = 'Sending . . .';

        // Position the text near the hologram
        const vector = new THREE.Vector3();
        vector.setFromMatrixPosition(this.group.matrixWorld);
        vector.project(camera);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight - 100;

        this.sendText.style.left = `${x - 50}px`;
        this.sendText.style.top = `${y}px`;

        document.body.appendChild(this.sendText);

        // After 2 seconds, change text to "Sent!" and remove after 1 more second
        setTimeout(() => {
            if (this.sendText) {
                this.sendText.textContent = 'Sent!';
                setTimeout(() => {
                    if (this.sendText) {
                        this.sendText.remove();
                        this.sendText = null;
                    }
                    this.dispose();
                    // Reset synthesis chamber
                    if (window.synthesisChamber) {
                        window.synthesisChamber.reset();
                    }
                }, 1000);
            }
        }, 2000);
    }

    animate() {
        const now = Date.now();
        const spawnElapsed = (now - this.spawnTime) / 1000;
        
        if (this.isGenerating && spawnElapsed < 2) {
            // Generation animation (2 seconds)
            const genProgress = spawnElapsed / 2;
            
            // Animate particles
            this.particles.children.forEach((particle, i) => {
                const delay = i * 0.1;
                if (spawnElapsed > delay) {
                    const particleProgress = Math.min(1, (spawnElapsed - delay) * 2);
                    particle.material.opacity = Math.sin(particleProgress * Math.PI) * 0.5;
                    particle.position.y += 0.01;
                    particle.rotation.y += 0.1;
                }
            });

            if (genProgress > 0.5) {
                // Start fading in the hologram halfway through generation
                const fadeProgress = (genProgress - 0.5) * 2;
                [this.bodyMaterial, this.headMaterial, this.armMaterial].forEach(material => {
                    material.opacity = fadeProgress * 0.6;
                });
            }

            if (spawnElapsed >= 2) {
                this.isGenerating = false;
                this.particles.children.forEach(particle => {
                    particle.material.opacity = 0;
                });
            }
        } else if (this.isSending) {
            // Sending animation
            const sendElapsed = (now - this.sendStartTime) / 1000;
            if (sendElapsed < 2) {
                // Fade out effect
                const fadeOutProgress = sendElapsed / 2;
                [this.bodyMaterial, this.headMaterial, this.armMaterial].forEach(material => {
                    material.opacity = 0.6 * (1 - fadeOutProgress);
                });
                // Move upward
                this.group.position.y += 0.01;
            }
        } else {
            // Normal animation after generation
            this.group.rotation.y += 0.005;

            const colorIndex = Math.floor((now % (2000 * this.colors.length)) / 2000);
            const nextColorIndex = (colorIndex + 1) % this.colors.length;
            const colorProgress = ((now % 2000) / 2000);
            
            const currentColor = new THREE.Color(this.colors[colorIndex]);
            const nextColor = new THREE.Color(this.colors[nextColorIndex]);
            const lerpedColor = currentColor.lerp(nextColor, colorProgress);

            [this.bodyMaterial, this.headMaterial, this.armMaterial].forEach(material => {
                material.color.copy(lerpedColor);
                material.emissive.copy(lerpedColor);
                material.emissiveIntensity = 1;
                material.opacity = 0.6 + Math.sin(now * 0.002) * 0.1;
            });

            // Subtle arm movement
            this.leftArm.rotation.z = Math.PI / 4 + Math.sin(now * 0.001) * 0.1;
            this.rightArm.rotation.z = -Math.PI / 4 + Math.sin(now * 0.001) * 0.1;

            // Update button position if it exists
            if (this.sendButton) {
                const vector = new THREE.Vector3();
                vector.setFromMatrixPosition(this.group.matrixWorld);
                vector.project(camera);

                const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-vector.y * 0.5 + 0.5) * window.innerHeight - 100;

                this.sendButton.style.left = `${x - 60}px`;
                this.sendButton.style.top = `${y}px`;
            }
        }
    }

    dispose() {
        if (this.sendButton) {
            this.sendButton.remove();
            this.sendButton = null;
        }
        if (this.sendText) {
            this.sendText.remove();
            this.sendText = null;
        }
        scene.remove(this.group);
        this.group.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) object.material.dispose();
        });
    }
}

export function createHologram(position, colors) {
    // Adjust position to center on plate
    const adjustedPosition = position.clone();
    adjustedPosition.y += 0.05; // Half height of platform
    return new HologramDroid(adjustedPosition, colors);
}
