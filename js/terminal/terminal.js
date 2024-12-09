import commands from './commands.js';

export class Terminal {
    constructor() {
        this.lines = ['LABORATORY CONTROL SYSTEM v2.1.4'];
        this.currentLine = '';
        this.cursorVisible = true;
        this.cursorBlinkTime = 0;
        this.history = [];
        this.historyIndex = -1;
        this.matrixMode = false;
        this.matrixChars = '0123456789ABCDEF';
        this.prompt = '> ';
        this.cursorPosition = 0;  // Track cursor position within currentLine
        
        this.println('Type "help" for available commands.');
        this.println('');
    }

    handleInput(key) {
        // Handle special keys
        switch(key) {
            case 'Enter':
                const command = this.currentLine;
                this.lines.push(this.prompt + command);
                this.executeCommand(command);
                this.history.push(command);
                this.historyIndex = this.history.length;
                this.currentLine = '';
                this.cursorPosition = 0;
                break;

            case 'Backspace':
                if (this.cursorPosition > 0) {
                    this.currentLine = 
                        this.currentLine.slice(0, this.cursorPosition - 1) + 
                        this.currentLine.slice(this.cursorPosition);
                    this.cursorPosition--;
                }
                break;

            case 'Delete':
                if (this.cursorPosition < this.currentLine.length) {
                    this.currentLine = 
                        this.currentLine.slice(0, this.cursorPosition) + 
                        this.currentLine.slice(this.cursorPosition + 1);
                }
                break;

            case 'ArrowLeft':
                if (this.cursorPosition > 0) {
                    this.cursorPosition--;
                }
                break;

            case 'ArrowRight':
                if (this.cursorPosition < this.currentLine.length) {
                    this.cursorPosition++;
                }
                break;

            case 'ArrowUp':
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.currentLine = this.history[this.historyIndex];
                    this.cursorPosition = this.currentLine.length;
                }
                break;

            case 'ArrowDown':
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.currentLine = this.history[this.historyIndex];
                } else {
                    this.historyIndex = this.history.length;
                    this.currentLine = '';
                }
                this.cursorPosition = this.currentLine.length;
                break;

            case 'Home':
                this.cursorPosition = 0;
                break;

            case 'End':
                this.cursorPosition = this.currentLine.length;
                break;

            case 'Tab':
                // Simple tab completion
                if (this.currentLine.length > 0) {
                    const partial = this.currentLine.toLowerCase();
                    const matches = Object.keys(commands).filter(cmd => 
                        cmd.startsWith(partial)
                    );
                    if (matches.length === 1) {
                        this.currentLine = matches[0];
                        this.cursorPosition = this.currentLine.length;
                    } else if (matches.length > 1) {
                        this.println('');
                        this.println('Possible commands:');
                        matches.forEach(match => this.println(`  ${match}`));
                        this.println('');
                        this.println(this.prompt + this.currentLine);
                    }
                }
                break;

            default:
                // Only add printable characters
                if (key.length === 1) {
                    this.currentLine = 
                        this.currentLine.slice(0, this.cursorPosition) + 
                        key + 
                        this.currentLine.slice(this.cursorPosition);
                    this.cursorPosition++;
                }
                break;
        }
    }

    executeCommand(input) {
        const trimmedInput = input.trim().toLowerCase();
        
        if (trimmedInput === '') {
            this.println('');
            return;
        }

        const command = commands[trimmedInput];
        if (command) {
            command.execute(this);
        } else {
            this.println(`Command not found: ${trimmedInput}`);
            this.println('Type "help" for available commands.');
        }
        this.println('');
    }

    println(text) {
        this.lines.push(text);
        // Keep a reasonable buffer of lines
        if (this.lines.length > 100) {
            this.lines = this.lines.slice(-100);
        }
    }

    clear() {
        this.lines = ['LABORATORY CONTROL SYSTEM v2.1.4'];
        this.println('Type "help" for available commands.');
        this.println('');
        this.currentLine = '';
        this.cursorPosition = 0;
    }

    setMatrixMode(enabled) {
        this.matrixMode = enabled;
        if (!enabled) {
            this.clear();
        }
    }

    render(context, width, height) {
        context.fillStyle = '#000000';
        context.fillRect(0, 0, width, height);

        if (this.matrixMode) {
            this.renderMatrix(context, width, height);
            return;
        }

        const lineHeight = 32;
        const padding = 20;
        const maxLines = Math.floor((height - 2 * padding) / lineHeight) - 1;
        
        context.font = '24px monospace';
        context.fillStyle = '#00ff00';
        
        // Calculate which lines to show
        const startLine = Math.max(0, this.lines.length - maxLines);
        const visibleLines = this.lines.slice(startLine);
        
        // Render previous lines
        visibleLines.forEach((line, index) => {
            context.fillText(line, padding, padding + index * lineHeight);
        });

        // Render current line
        const inputY = padding + visibleLines.length * lineHeight;
        const inputText = this.prompt + this.currentLine;
        context.fillText(inputText, padding, inputY);
        
        // Calculate cursor position based on text measurement
        const textBeforeCursor = this.prompt + this.currentLine.slice(0, this.cursorPosition);
        const cursorX = padding + context.measureText(textBeforeCursor).width;
        
        // Render cursor
        this.cursorBlinkTime = (this.cursorBlinkTime + 1) % 60;
        if (this.cursorBlinkTime < 30) {
            context.fillRect(cursorX, inputY - 20, 12, 2);
        }
    }

    renderMatrix(context, width, height) {
        const fontSize = 28;
        const columns = Math.floor(width / fontSize);
        const rows = Math.floor(height / fontSize);

        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                if (Math.random() < 0.1) {
                    const char = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
                    context.fillStyle = `rgba(0, 255, 0, ${Math.random()})`;
                    context.font = `${fontSize}px monospace`;
                    context.fillText(char, i * fontSize, j * fontSize);
                }
            }
        }
    }
}
