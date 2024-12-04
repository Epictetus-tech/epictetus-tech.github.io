const CURSOR_BASE_POSITION = 175;
const CHAR_WIDTH = 9.6;
const COLORS = {
    SUCCESS: '#ffff00',
    WARNING: '#ff0000',
    WELCOME: '#00ff00',
    MELTDOWN: '#b366ff',
    HACK: '#ff0000'
};

const DELAYS = {
    BOOT_MIN: 100,
    BOOT_MAX: 500,
    BOOT_COMPLETE: 1000,
    MELTDOWN_START: 1500,
    MELTDOWN_WARNING: 2000,
    MELTDOWN_COMPLETE: 2000,
    HACK_STEP: 1000
};

const STYLES = {
    SUCCESS: (text) => `<span style="color: ${COLORS.SUCCESS}; text-shadow: 0 0 5px ${COLORS.SUCCESS}">${text}</span>`,
    WELCOME: (text) => `<span style="color: ${COLORS.WELCOME}">${text}</span>`,
    WARNING: (text) => `<span style="color: ${COLORS.WARNING}; opacity: 0.3;">${text}</span>`,
    MELTDOWN: (text) => `<span style="color: ${COLORS.MELTDOWN}; text-shadow: 0 0 8px ${COLORS.MELTDOWN}">${text}</span>`,
    SECTION: (title) => `\n<span style="color: #4CAF50; font-weight: bold; font-size: 1.2em; text-shadow: 0 0 5px rgba(76, 175, 80, 0.5);">╭─── ${title} ───╮</span>`,
    SUBSECTION: (title) => `<span style="color: #87CEEB; font-weight: bold; margin-left: 2px;">┌─ ${title}</span>`,
    LIST_ITEM: (text) => `<span style="color: #DDD; margin-left: 4px;">│  • ${text}</span>`,
    PROJECT_TITLE: (text) => `<span style="color: #FFA500; font-weight: bold; font-size: 1.1em; text-shadow: 0 0 5px rgba(255, 165, 0, 0.5);">╭──── ${text} ────╮</span>`,
    PROJECT_DESC: (text) => `<span style="color: #87CEEB; font-style: italic; margin-left: 4px;">│  ${text}</span>`,
    CATEGORY: (text) => `<span style="color: #FF69B4; font-weight: bold; text-shadow: 0 0 5px rgba(255, 105, 180, 0.3);">┌─── ${text} ───┐</span>`,
    SEPARATOR: () => `<span style="color: #666;">╰${'─'.repeat(30)}╯</span>`,
    HACK: (text) => `<span style="color: ${COLORS.HACK}; text-shadow: 0 0 8px ${COLORS.HACK}; font-weight: bold;">${text}</span>`,
    MELTDOWN_WARNING: (text) => `<span style="color: ${COLORS.WARNING}; animation: warningFlash 0.5s linear infinite;">${text}</span>`
};

class Terminal {
    constructor() {
        try {
            this.terminal = document.querySelector('.terminal-content');
            this.output = document.querySelector('.terminal-output');
            this.input = document.querySelector('.terminal-input');
            this.cursor = document.querySelector('.cursor');
            this.inputLine = document.querySelector('.terminal-input-line');
            
            if (!this.terminal || !this.output || !this.input || !this.cursor || !this.inputLine) {
                throw new Error('Required DOM elements not found');
            }
            
            this.prompt = 'user@portfolio:~$ ';
            this.CURSOR_BASE_POSITION = this.prompt.length * CHAR_WIDTH;

            this.commands = {
                help: this.showHelp.bind(this),
                clear: this.clear.bind(this),
                about: this.about.bind(this),
                skills: this.skills.bind(this),
                projects: this.projects.bind(this),
                contact: this.contact.bind(this),
                pwd: this.pwd.bind(this)
            };
            
            this.easterEggs = {
                'sudo rm -rf /': this.systemMeltdown.bind(this),
                'hack': this.fakeHack.bind(this)
            };
            
            this.commandHistory = [];
            this.historyIndex = -1;
            this.currentPath = '/home/user';
            
            this.initializeTerminal();
        } catch (error) {
            console.error('Terminal initialization failed:', error);
        }
    }

    initializeTerminal() {
        this.inputLine.style.opacity = '0';

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim().toLowerCase();
                this.executeCommand(command);
                this.input.value = '';
                this.resetCursor();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory('down');
            }
        });

        this.input.addEventListener('input', () => {
            this.updateCursorPosition();
        });

        this.showBootSequence();
    }

    async showBootSequence() {
        const bootMessages = this.getBootMessages();
        const minDelay = 50;
        const maxDelay = 200;
        
        for (const msg of bootMessages) {
            this.appendOutput(msg);
            await new Promise(resolve => setTimeout(resolve, Math.random() * (maxDelay - minDelay) + minDelay));
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.clear();
        this.showWelcomeMessage();
    }

    getBootMessages() {
        const ok = () => STYLES.SUCCESS('[  OK  ]');
        return [
            'BIOS Version 1.0.4',
            'Running system diagnostics...',
            `CPU: JavaScript V8 ${STYLES.SUCCESS('[SUCCESS]')}`,
            `Memory Test: OK ${STYLES.SUCCESS('[PASS]')}`,
            'Checking storage devices...',
            `SSD Status: Healthy ${STYLES.SUCCESS('[VERIFIED]')}`,
            'Loading kernel...',
            'Loading initial ramdisk...',
            `Starting system logger ${STYLES.SUCCESS('[DONE]')}`,
            `Starting system message bus ${STYLES.SUCCESS('[DONE]')}`,
            `Starting network manager ${STYLES.SUCCESS('[DONE]')}`,
            'Mounting filesystems...',
            `${ok()} Started Network File System`,
            `${ok()} Reached target Network`,
            `${ok()} Reached target Basic System`,
            `${ok()} Started D-Bus System Message Bus`,
            `${ok()} Started System Logging Service`,
            `${ok()} Reached target System Initialization`,
            `${ok()} Started Portfolio Service`,
            'Portfolio Terminal 1.0.0 Loading...',
            'Initializing user interface...',
            'Starting session manager...',
            `Boot sequence complete. ${STYLES.SUCCESS('[SUCCESS]')}`
        ];
    }

    showWelcomeMessage() {
        const systemInfo = this.getSystemInfo();
        const asciiArt = this.getAsciiArt(systemInfo);
        const welcomeText = this.getWelcomeText();
        
        this.appendOutput(asciiArt + '\n\n' + welcomeText);
        this.inputLine.style.opacity = '1';
        this.input.focus();
    }

    getSystemInfo() {
        return {
            uptime: Math.floor(Math.random() * 100),
            memory: {
                total: 1024,
                used: Math.floor(Math.random() * 512),
            },
            disk: {
                total: 512,
                used: Math.floor(Math.random() * 300),
            },
            cpu: navigator.hardwareConcurrency ? 
                `JavaScript V8 (${navigator.hardwareConcurrency} cores)` : 
                'JavaScript V8',
            browser: this.getBrowserInfo(),
            resolution: `${window.screen.width}x${window.screen.height}`
        };
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown Browser';
    }

    getAsciiArt(systemInfo) {
        return `<span class="banner-text">
███╗   ███╗    ██╗  ██████╗      user@portfolio
████╗ ████║    ██║ ██╔═══██╗     OS: Portfolio Linux x86_64
██╔████╔██║    ██║ ██║   ██║     Kernel: 6.1.0-portfolio
██║╚██╔╝██║██  ██║ ██║   ██║     Uptime: ${systemInfo.uptime} days
██║ ╚═╝ ██║╚████╔╝ ╚██████╔╝     Shell: bash 5.1.16
╚═╝     ╚═╝ ╚═══╝   ╚════██╗     Terminal: ${systemInfo.browser}
                         ╚═╝     CPU: ${systemInfo.cpu}
                                 Memory: ${systemInfo.memory.used}MB / ${systemInfo.memory.total}MB
                                 Disk: ${systemInfo.disk.used}GB / ${systemInfo.disk.total}GB
                                 Resolution: ${systemInfo.resolution}</span>`;
    }

    getWelcomeText() {
        return `${STYLES.WELCOME('Welcome to my portfolio terminal!')}
Type ${STYLES.SUCCESS('help')} to see available commands.
${STYLES.WARNING('NOTICE: System administrators have detected unauthorized access attempts. Any attempts to remove the root directory or hack into the mainframe will be logged.')}`;
    }

    executeCommand(command) {
        if (command) {
            this.commandHistory.unshift(command);
            this.historyIndex = -1;
        }

        const outputLine = document.createElement('div');
        outputLine.innerHTML = `<span class="prompt">${this.prompt}</span>${command}`;
        this.output.appendChild(outputLine);

        if (command === '') {
            return;
        }

        if (this.easterEggs[command]) {
            this.easterEggs[command]();
            return;
        }

        const [cmd, ...args] = command.split(' ');
        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.appendOutput(`Command not found: ${cmd}. Type 'help' for available commands.`);
        }
    }

    appendOutput(text) {
        const outputLine = document.createElement('div');
        if (!text.includes('<span')) {
            const sanitized = text.replace(/[<>]/g, char => ({
                '<': '&lt;',
                '>': '&gt;'
            }[char]));
            outputLine.innerHTML = sanitized;
        } else {
            outputLine.innerHTML = text;  // Allow HTML for styled content
        }
        this.output.appendChild(outputLine);
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    updateCursorPosition() {
        const inputWidth = this.input.value.length * CHAR_WIDTH;
        this.cursor.style.left = `${CURSOR_BASE_POSITION + inputWidth}px`;
    }

    resetCursor() {
        this.cursor.style.left = `${CURSOR_BASE_POSITION}px`;
    }

    navigateHistory(direction) {
        if (direction === 'up' && this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
        } else if (direction === 'down' && this.historyIndex > -1) {
            this.historyIndex--;
        } else {
            return;
        }

        this.input.value = this.historyIndex >= 0 ? 
            this.commandHistory[this.historyIndex] : '';
        this.updateCursorPosition();
    }

    contact() {
        const contactInfo = {
            LinkedIn: 'linkedin.com/in/michael-quintero-835b3752'
        };

        let output = `${STYLES.SECTION('Contact Information')}\n`;
        for (const [platform, info] of Object.entries(contactInfo)) {
            output += `${STYLES.LIST_ITEM(`${platform}: ${info}`)}\n`;
        }
        this.appendOutput(output);
    }

    showHelp() {
        const commands = {
            'about': 'Display information about me',
            'skills': 'List my technical skills',
            'projects': 'View my projects',
            'contact': 'Display contact information',
            'clear': 'Clear the terminal screen',
            'help': 'Show this help message'
        };

        let output = `${STYLES.SECTION('Available Commands')}\n`;
        for (const [cmd, desc] of Object.entries(commands)) {
            output += `${STYLES.LIST_ITEM(`${STYLES.SUCCESS(cmd.padEnd(10))} - ${desc}`)}\n`;
        }
        this.appendOutput(output);
    }

    clear() {
        this.output.innerHTML = '';
    }

    about() {
        this.appendOutput(`${STYLES.SECTION('About Me')}
${STYLES.LIST_ITEM('Supply Chain Professional with a passion for Linux and system administration')}
${STYLES.LIST_ITEM('Combining operational experience with growing technical expertise')}

${STYLES.SUBSECTION('Background')}
${STYLES.LIST_ITEM('6+ years of hands-on Linux experience through personal projects and self-study')}
${STYLES.LIST_ITEM('Experience in process optimization and system implementation')}
${STYLES.LIST_ITEM('Strong foundation in data analysis and problem-solving')}
${STYLES.LIST_ITEM('Proven ability to learn and implement new technologies')}

${STYLES.SUBSECTION('Current Focus')}
${STYLES.LIST_ITEM('Building practical experience with Linux system administration')}
${STYLES.LIST_ITEM('Learning infrastructure automation and containerization')}
${STYLES.LIST_ITEM('Applying analytical skills to technical challenges')}
${STYLES.LIST_ITEM('Bridging operational and technical knowledge')}`);
    }

    skills() {
        const skills = {
            'Technical Skills': [
                'Linux System Administration (Personal Projects)',
                'Docker Container Management',
                'Basic Shell Scripting',
                'System Configuration',
                'Hardware Integration',
                'Virtualization'
            ],
            'Professional Experience': [
                'Data Analysis',
                'Process Optimization',
                'System Implementation',
                'Project Management',
                'Technical Documentation',
                'Team Collaboration'
            ]
        };

        let output = '';
        for (const [category, skillList] of Object.entries(skills)) {
            output += `${STYLES.CATEGORY(category)}\n`;
            skillList.forEach(skill => {
                output += `${STYLES.LIST_ITEM(skill)}\n`;
            });
            output += '\n';
        }
        this.appendOutput(output);
    }

    projects() {
        const projects = [
            {
                name: 'Personal Linux Projects',
                description: 'Hands-on experience with Linux system administration',
                details: [
                    'Built and maintained personal Arch Linux systems',
                    'Created Docker-based media server environment',
                    'Developed custom gaming systems with Linux',
                    'Implemented backup solutions for personal infrastructure'
                ]
            },
            {
                name: 'Professional System Integration',
                description: 'Experience from current role in warehouse operations',
                details: [
                    'Streamlined warehouse processes through system optimization',
                    'Implemented data management solutions',
                    'Created documentation for operational procedures',
                    'Provided technical support for warehouse systems'
                ]
            }
        ];

        let output = '';
        projects.forEach(project => {
            output += `${STYLES.PROJECT_TITLE(project.name)}\n`;
            output += `${STYLES.PROJECT_DESC(project.description)}\n`;
            project.details.forEach(detail => {
                output += `${STYLES.LIST_ITEM(detail)}\n`;
            });
            output += `${STYLES.SEPARATOR()}\n\n`;
        });
        this.appendOutput(output);
    }

    pwd() {
        this.appendOutput(this.currentPath);
    }

    systemMeltdown() {
        try {
            const messages = [
                { text: 'Permission denied: Nice try! 😈', delay: 0 },
                { text: 'Wait... what\'s happening?', delay: DELAYS.MELTDOWN_START },
                { text: 'SYSTEM FAILURE IMMINENT', delay: DELAYS.MELTDOWN_WARNING, style: STYLES.MELTDOWN_WARNING }
            ];

            messages.forEach(({ text, delay, style = STYLES.MELTDOWN }) => {
                setTimeout(() => {
                    this.appendOutput(style(text));
                }, delay);
            });

            setTimeout(() => {
                // Hide the terminal content first
                this.output.style.opacity = '0';
                this.inputLine.style.opacity = '0';
                
                // Add the meltdown effect to the entire terminal
                document.querySelector('.terminal').classList.add('terminal-meltdown');
                
                setTimeout(() => {
                    this.clear();
                    // Remove the meltdown effect
                    document.querySelector('.terminal').classList.remove('terminal-meltdown');
                    // Show the content again
                    this.output.style.opacity = '1';
                    this.inputLine.style.opacity = '1';
                    this.appendOutput('Just kidding! 😉');
                    this.resetCursor();
                    this.input.value = '';
                }, DELAYS.MELTDOWN_COMPLETE);
            }, DELAYS.MELTDOWN_WARNING + DELAYS.MELTDOWN_START);
        } catch (error) {
            console.error('Meltdown effect failed:', error);
            this.clear();
            this.appendOutput('System restored from backup.');
        }
    }

    fakeHack() {
        const steps = [
            'Initializing hack sequence...',
            'Bypassing firewall...',
            'Accessing mainframe...',
            'Downloading sensitive data...',
            'Covering tracks...',
            'HACK COMPLETE! Just kidding 😎'
        ];
        
        steps.forEach((step, index) => {
            setTimeout(() => {
                this.appendOutput(STYLES.HACK(step));
            }, index * DELAYS.HACK_STEP);
        });
    }

    destroy() {
        // Clean up event listeners when terminal is destroyed
        this.input.removeEventListener('keydown', this.handleKeydown);
        this.input.removeEventListener('input', this.handleInput);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Terminal();
});

