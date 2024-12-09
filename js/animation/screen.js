import { screenContext, screen } from '../workstation/computer.js';
import { Terminal } from '../terminal/terminal.js';
import { isAnimating } from '../animation/camera.js';
import { resetCamera } from '../animation/camera.js';
import { createHologram } from '../laboratory/hologram.js';

let terminal = new Terminal();
let isZoomedIn = false;
let returnButton = null;

function createReturnButton() {
    const button = document.createElement('button');
    button.textContent = 'RETURN';
    button.style.position = 'fixed';
    button.style.top = '20px';
    button.style.left = '20px';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#003300';
    button.style.border = '2px solid #00ff00';
    button.style.color = '#00ff00';
    button.style.fontFamily = 'monospace';
    button.style.fontSize = '16px';
    button.style.cursor = 'pointer';
    button.style.zIndex = '1000';
    button.style.transition = 'background-color 0.3s';
    button.style.pointerEvents = 'auto';

    button.addEventListener('click', () => {
        if (!isAnimating) {
            resetCamera();
            setZoomedIn(false);
            button.remove();
            returnButton = null;
        }
    });

    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#004400';
    });

    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#003300';
    });

    document.body.appendChild(button);
    return button;
}

export function initScreen() {}

export function updateScreen() {
    if (screenContext && screen) {
        // Clear screen
        screenContext.fillStyle = '#000000';
        screenContext.fillRect(0, 0, 1024, 640);
        
        if (isZoomedIn) {
            // When zoomed in, render terminal
            terminal.render(screenContext, 1024, 640);
        } else {
            // When zoomed out, render default monitoring display
            // Draw grid pattern
            screenContext.strokeStyle = '#00ff00';
            screenContext.lineWidth = 1;
            const gridSize = 32;
            const offset = (Date.now() * 0.05) % gridSize;
            
            for (let x = -offset; x < 1024; x += gridSize) {
                screenContext.beginPath();
                screenContext.moveTo(x, 0);
                screenContext.lineTo(x, 640);
                screenContext.stroke();
            }
            
            for (let y = -offset; y < 640; y += gridSize) {
                screenContext.beginPath();
                screenContext.moveTo(0, y);
                screenContext.lineTo(1024, y);
                screenContext.stroke();
            }
            
            // Display text
            screenContext.font = '32px monospace';
            screenContext.fillStyle = '#00ff00';
            screenContext.fillText('LABORATORY CONTROL SYSTEM', 20, 40);
            screenContext.fillText('STATUS: OPERATIONAL', 20, 80);
            screenContext.fillText(`TEMPERATURE: ${(22.5 + Math.sin(Date.now() * 0.001) * 0.5).toFixed(1)}°C`, 20, 120);
            screenContext.fillText(`PRESSURE: ${(1013 + Math.sin(Date.now() * 0.0005) * 5).toFixed(0)} hPa`, 20, 160);
            screenContext.fillText('EQUIPMENT STATUS:', 20, 240);
            screenContext.fillText(`CENTRIFUGE: ${Math.sin(Date.now() * 0.002) > 0 ? 'ACTIVE' : 'STANDBY'}`, 20, 280);
            screenContext.fillText(`MICROSCOPE: ${Math.sin(Date.now() * 0.003) > 0 ? 'IN USE' : 'READY'}`, 20, 320);
            screenContext.fillText(`TIME: ${new Date().toLocaleTimeString()}`, 20, 360);
        }
        
        screen.material.map.needsUpdate = true;
    }
}

export function handleKeyInput(key) {
    if (isZoomedIn && !isAnimating) {
        terminal.handleInput(key);
    }
}

export function handleScreenClick(x, y) {
    if (returnButton) {
        const rect = returnButton.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            if (!isAnimating) {
                resetCamera();
                setZoomedIn(false);
                returnButton.remove();
                returnButton = null;
            }
            return true;
        }
    }
    return false;
}

export function handleScreenMouseMove(x, y) {
    if (returnButton) {
        const rect = returnButton.getBoundingClientRect();
        returnButton.style.backgroundColor = 
            (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) 
            ? '#004400' 
            : '#003300';
    }
}

export function setZoomedIn(zoomed, isComputer = false) {
    isZoomedIn = zoomed;
    
    if (zoomed && isComputer) {
        // Create return button when zooming into computer screen
        if (!returnButton) {
            returnButton = createReturnButton();
        }
        terminal.clear();
    } else if (!zoomed && returnButton) {
        // Remove button when zooming out
        returnButton.remove();
        returnButton = null;
    }
}

export { terminal };
