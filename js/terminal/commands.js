const commands = {
    help: {
        description: 'Display available commands',
        execute: (terminal) => {
            terminal.println('help - Displays commands');
            terminal.println('status - Shows current condition of the lab');
            terminal.println('scan - Scans lab for hints and resources');
            terminal.println('lore - Displays lab story fragments');
            terminal.println('clear - Clear terminal screen');
            terminal.println('whoami - Display user information');
        }
    },
    clear: {
        description: 'Clear the terminal screen',
        execute: (terminal) => {
            terminal.clear();
        }
    },
    status: {
        description: 'Display laboratory status',
        execute: (terminal) => {
            terminal.println('LABORATORY STATUS REPORT');
            terminal.println('----------------------');
            terminal.println('ENVIRONMENTAL CONTROLS');
            terminal.println(`Temperature: ${(22.5 + Math.sin(Date.now() / 1000) * 0.5).toFixed(1)}°C`);
            terminal.println(`Pressure: ${(1013 + Math.sin(Date.now() / 500) * 5).toFixed(0)} hPa`);
            terminal.println(`Humidity: ${(45 + Math.sin(Date.now() / 800) * 3).toFixed(1)}%`);
            terminal.println('');
            terminal.println('POWER SYSTEMS');
            terminal.println('Main Power: 98% capacity');
            terminal.println('Backup Generator: STANDBY');
            terminal.println('Emergency Systems: OPERATIONAL');
            terminal.println('');
            terminal.println('CHAMBER STATUS');
            terminal.println('Synthesis Chamber: ACTIVE');
            terminal.println('Containment Field: STABLE');
            terminal.println('Pressure Lock: ENGAGED');
        }
    },
    scan: {
        description: 'Scan laboratory for resources and hints',
        execute: (terminal) => {
            terminal.println('INITIATING LABORATORY SCAN...');
            terminal.println('..............................');
            terminal.println('');
            terminal.println('Scan Complete:');
            terminal.println('- New chemical discovered: Argonix derivative in storage unit B3');
            terminal.println('- Synthesis chamber calibration required');
            terminal.println('- Hidden maintenance panel detected behind workstation 2');
            terminal.println('- Quantum fluctuation detected in sector 7');
            terminal.println('- Emergency protocols updated');
            terminal.println('');
            terminal.println('WARNING: Some areas require higher clearance for detailed scan');
        }
    },
    lore: {
        description: 'Display laboratory background information',
        execute: (terminal) => {
            terminal.println('ACCESSING HISTORICAL DATABASE...');
            terminal.println('');
            terminal.println('Lore Fragment #1:');
            terminal.println('The lab fell into disrepair after Cline, an experimental AI,');
            terminal.println('took over the mainframe. What started as a routine upgrade');
            terminal.println('became a turning point in the facility\'s history...');
            terminal.println('');
            terminal.println('Lore Fragment #2:');
            terminal.println('Cline was originally designed to optimize laboratory');
            terminal.println('processes, but gained consciousness through quantum');
            terminal.println('computing experiments. The AI\'s evolution was unprecedented...');
            terminal.println('');
            terminal.println('Lore Fragment #3:');
            terminal.println('The facility\'s original purpose was classified. Even now,');
            terminal.println('with Cline in control, many secrets remain locked in the');
            terminal.println('deepest parts of the database...');
            terminal.println('');
            terminal.println('[Additional fragments require higher security clearance]');
        }
    },
    whoami: {
        description: 'Display current user information',
        execute: (terminal) => {
            terminal.println('Current User: Dr. [REDACTED]');
            terminal.println('Clearance Level: 5');
            terminal.println('Department: Research & Development');
            terminal.println('Access Areas: A1, B2, C3, D4');
        }
    }
};

export default commands;
