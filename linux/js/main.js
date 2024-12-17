const CHAR_WIDTH = 9.6;
const CURSOR_OFFSET = 9;

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
    SUCCESS: (text) => `<span class="success-text">${text}</span>`,
    WELCOME: (text) => `<span class="welcome-text">${text}</span>`,
    WARNING: (text) => `<span class="warning-text">${text}</span>`,
    MELTDOWN: (text) => `<span class="meltdown-text">${text}</span>`,
    SECTION: (title) => `<span style="color: #4CAF50; font-weight: bold; font-size: 1.2em; text-shadow: 0 0 5px rgba(76, 175, 80, 0.5);">╭─── ${title} ───╮</span>`,
    SUBSECTION: (title) => `<span style="color: #87CEEB; font-weight: bold; margin-left: 2px;">┌─ ${title}</span>`,
    LIST_ITEM: (text) => `<span style="color: #DDD; margin-left: 4px;">│  • ${text}</span>`,
    PROJECT_TITLE: (text) => `<span style="color: #FFA500; font-weight: bold; font-size: 1.1em; text-shadow: 0 0 5px rgba(255, 165, 0, 0.5);">╭──── ${text} ────╮</span>`,
    PROJECT_DESC: (text) => `<span style="color: #87CEEB; font-style: italic; margin-left: 4px;">│  ${text}</span>`,
    CATEGORY: (text) => `<span class="category-text">┌─── ${text} ───┐</span>`,
    SEPARATOR: () => `<span class="separator">╰${'─'.repeat(30)}╯</span>`,
    HACK: (text) => `<span class="hack-text">${text}</span>`,
    MELTDOWN_WARNING: (text) => `<span class="meltdown-warning">${text}</span>`,
    FORBIDDEN: (text) => `<span class="forbidden-text">${text}</span>`,
    ERROR: (text) => `<span class="error-text">${text}</span>`
};

// Add constants for commonly used strings
const PROMPTS = {
    USER: 'user@portfolio:~$ ',
    ROOT: 'root@portfolio:~# '
};

const DOM_SELECTORS = {
    TERMINAL: '.terminal',
    TERMINAL_CONTENT: '.terminal-content',
    TERMINAL_OUTPUT: '.terminal-output',
    TERMINAL_INPUT: '.terminal-input',
    TERMINAL_TITLE: '.terminal-title',
    CURSOR: '.cursor',
    INPUT_LINE: '.terminal-input-line',
    PROMPT: '.prompt'
};

class Terminal {
    constructor() {
        try {
            // Cache DOM queries
            this.terminal = document.querySelector(DOM_SELECTORS.TERMINAL_CONTENT);
            this.output = document.querySelector(DOM_SELECTORS.TERMINAL_OUTPUT);
            this.input = document.querySelector(DOM_SELECTORS.TERMINAL_INPUT);
            this.cursor = document.querySelector(DOM_SELECTORS.CURSOR);
            this.inputLine = document.querySelector(DOM_SELECTORS.INPUT_LINE);
            
            if (!this.terminal || !this.output || !this.input || !this.cursor || !this.inputLine) {
                throw new Error('Required DOM elements not found');
            }
            
            // Add click handler to terminal to maintain focus
            this.terminal.addEventListener('click', () => this.input.focus());
            
            this.prompt = PROMPTS.USER;
            
            // Restore command bindings
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
                'hack': this.fakeHack.bind(this),
                'exit': this.exitEvilMode.bind(this),
                'matrix': this.matrixMode.bind(this)
            };

            // Bind event handlers
            this.handleKeydown = this.handleKeydown.bind(this);
            this.handleInput = () => this.updateCursorPosition();
            this.handleResize = this.handleResize.bind(this);
            
            // Initialize other properties
            this.commandHistory = [];
            this.historyIndex = -1;
            this.currentPath = '/home/user';
            this.projectsList = null;
            
            // Add global click handler to maintain focus
            document.addEventListener('click', () => {
                if (this.inputLine.style.opacity === '1') {
                    this.input.focus();
                }
            });
            
            this.initializeTerminal();
            
        } catch (error) {
            console.error('Terminal initialization failed:', error);
        }
    }

    initializeTerminal() {
        this.inputLine.style.opacity = '0';
        
        // Add event listeners
        this.input.addEventListener('keydown', this.handleKeydown);
        this.input.addEventListener('input', this.handleInput);
        window.addEventListener('resize', this.handleResize);

        let delay = 0;
        const bootMessages = this.getBootMessages();
        
        bootMessages.forEach(message => {
            delay += Math.random() * 100 + 50;
            setTimeout(() => {
                this.appendOutput(message);
                this.terminal.scrollTop = this.terminal.scrollHeight;
            }, delay);
        });

        setTimeout(() => {
            this.clear();
            this.appendOutput(this.getAsciiArt() + '\n\n' + this.getWelcomeText());
            // Position cursor before making input visible
            this.resetCursor();
            this.inputLine.style.opacity = '1';
            this.input.focus();
        }, delay + 500);
    }

    handleFocusLoss() {
        if (this.inputLine.style.display !== 'none') {
            requestAnimationFrame(() => {
                this.input.focus();
            });
        }
    }

    handleKeydown(e) {
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
        const asciiArt = this.getAsciiArt();
        const welcomeText = this.getWelcomeText();
        this.appendOutput(asciiArt + '\n\n' + welcomeText);
        
        // Force focus after a tiny delay to ensure DOM is ready
        setTimeout(() => {
            this.input.focus();
            this.updateCursorPosition();
        }, 10);
    }

    getAsciiArt() {
        return `<span class="banner-text">
███╗   ███╗    ██╗  ██████╗     
████╗ ████║    ██║ ██╔═══██╗    
██╔████╔██║    ██║ ██║   ██║    
██║╚██╔╝██║██  ██║ ██║   ██║    
██║ ╚═╝ ██║╚████╔╝ ╚██████╔╝    
╚═╝     ╚═╝ ╚═══╝   ╚══██╗    
                       ╚═╝</span>`;
    }

    getWelcomeText() {
        return `${STYLES.WELCOME('Welcome to my Interactive Terminal Portfolio')}

${STYLES.SUCCESS('Quick Start:')}
• Type ${STYLES.SUCCESS('help')} to see all available commands
• Use ${STYLES.SUCCESS('↑/↓')} arrow keys to navigate command history

${STYLES.WARNING('FORBIDDEN COMMANDS - DO NOT USE:')}
${STYLES.FORBIDDEN('• sudo rm -rf /')}     [SYSTEM DESTRUCTION]
${STYLES.FORBIDDEN('• hack')}              [SECURITY BREACH]
${STYLES.FORBIDDEN('• matrix')}            [REALITY DISTORTION]

Begin exploring by entering a command below ⬇️`;
    }

    executeCommand(command) {
        try {
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

            if (this.projectsList) {
                const num = parseInt(command);
                if (!isNaN(num)) {
                    this.showProjectDetails(num);
                    return;
                }
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
        } catch (error) {
            console.error('Command execution failed:', error);
            this.appendOutput(STYLES.ERROR('Command execution failed. Please try again.'));
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
        outputLine.style.marginTop = '8px';  // Add consistent spacing
        this.output.appendChild(outputLine);
        this.terminal.scrollTop = this.terminal.scrollHeight;
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
    }

    contact() {
        this.appendOutput(STYLES.SECTION('Contact Information'));
        this.appendOutput(STYLES.LIST_ITEM('Email: justin@mjquintero.com'));
        this.appendOutput(STYLES.LIST_ITEM('LinkedIn: https://www.linkedin.com/in/justinquintero'));
        this.appendOutput(STYLES.SEPARATOR());
        this.appendOutput('');
        this.appendOutput(STYLES.SUCCESS('Feel free to reach out!'));
    }

    showHelp() {
        const commands = {
            'about': 'Learn about my background and experience',
            'skills': 'View my technical skills and expertise',
            'projects': 'Explore my personal and professional projects',
            'contact': 'Get my LinkedIn profile and contact info',
            'clear': 'Clear the terminal screen',
            'help': 'Show this help message'
        };

        let output = `${STYLES.SECTION('Available Commands')}`;  // Removed \n
        output += `${STYLES.LIST_ITEM('Type any command below and press Enter:')}\n\n`;
        
        for (const [cmd, desc] of Object.entries(commands)) {
            output += `${STYLES.LIST_ITEM(`${STYLES.SUCCESS(cmd.padEnd(10))} - ${desc}`)}\n`;
        }
        
        output += `\n${STYLES.LIST_ITEM('Tip: Use UP/DOWN arrow keys to recall previous commands')}`;
        this.appendOutput(output);
    }

    clear() {
        this.output.innerHTML = '';
    }

    about() {
        this.appendOutput(`${STYLES.SECTION('About Me')}
${STYLES.LIST_ITEM('Technology enthusiast with extensive experience in enterprise systems and streamlining')}
${STYLES.LIST_ITEM('Proven track record of implementing innovative technical solutions in business environments')}

${STYLES.SUBSECTION('Background')}
${STYLES.LIST_ITEM('Experienced in home Linux system administration and infrastructure development')}
${STYLES.LIST_ITEM('Strong foundation in process optimization and system integration')}
${STYLES.LIST_ITEM('Knowledge in containerization and server deployment')}
${STYLES.LIST_ITEM('Focus on scalable and maintainable solutions')}

${STYLES.SUBSECTION('Current Focus')}
${STYLES.LIST_ITEM('Building robust automation solutions')}
${STYLES.LIST_ITEM('Developing efficient system administration tools')}
${STYLES.LIST_ITEM('Learning modern DevOps practices')}
${STYLES.LIST_ITEM('Expanding technical expertise')}`);
    }

    skills() {
        const skills = {
            'Technical Skills': [
                'Linux System Administration',
                'Docker & Containerization',
                'Report Building & Analysis',
                'Version Control (Git)',
                'Shell Scripting (Bash)',
                'Web Development',
                'Network Configuration',
                'System Security & Hardening'
            ],
            'Professional Skills': [
                'ERP Systems',
                'Planning & Analysis',
                'Process Optimization',
                'Project Management',
                'Problem Analysis & Resolution',
                'Cross-functional Collaboration',
                'Team Leadership',
                'Change Management'
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
        const projects = {
            'Current Projects': [
                {
                    name: 'Modular Mini PC Setup',
                    description: 'Advanced dual-purpose computing environment with seamless work/gaming transition',
                    details: [
                        'Implemented dual-boot system with Windows/Arch Linux',
                        'Engineered external GPU integration for gaming capability',
                        'Developed custom scripts for automated environment switching',
                        'Configured Batocera Linux for optimized gaming performance',
                        'Created efficient backup and restore procedures'
                    ]
                },
                {
                    name: 'Terminal Portfolio',
                    description: 'Interactive terminal-based portfolio website',
                    details: [
                        'Built with vanilla JavaScript for optimal performance',
                        'Custom terminal emulation with command history',
                        'Interactive easter eggs and animations',
                        'Deployed via GitHub Pages with custom domain',
                        'DNS and security through Cloudflare'
                    ]
                }
            ],
            'Infrastructure Projects': [
                {
                    name: 'Jellyfin Media Server',
                    description: 'Enterprise-grade self-hosted streaming platform using containerization',
                    details: [
                        'Architected robust Ubuntu Server environment',
                        'Implemented Docker-based service orchestration',
                        'Configured secure remote access protocols',
                        'Developed automated media management system',
                        'Created comprehensive backup strategy',
                        'Optimized system performance and reliability'
                    ]
                },
                {
                    name: 'Home Lab Environment',
                    description: 'Personal development and learning setup',
                    details: [
                        'Linux system administration',
                        'Network configuration and security',
                        'Shell script automation',
                        'Backup solutions implementation',
                        'Docker container management'
                    ]
                }
            ],
            'Hardware Projects': [
                {
                    name: 'Retro Gaming Console (Odroid)',
                    description: 'Custom N64-style emulation system with dynamic display',
                    details: [
                        'Odroid single board computer configuration',
                        'Custom N64-inspired case modification',
                        'Dynamic screen display implementation',
                        'Multiple emulation system support',
                        'Custom cooling and power management',
                        'Performance optimization for different systems'
                    ]
                }
            ],
            'Professional Projects': [
                {
                    name: 'System Integration',
                    description: 'Warehouse operations optimization',
                    details: [
                        'Process optimization and automation',
                        'Data management solutions',
                        'Technical documentation',
                        'Cross-functional system integration',
                        'Staff training and support'
                    ]
                }
            ]
        };

        let output = `${STYLES.SECTION('Projects')}\n`;
        output += `${STYLES.SUCCESS('Interactive Project Browser:')}\n`;
        output += `${STYLES.LIST_ITEM(' Enter a project number (1-6) to view full details')}\n`;
        output += `${STYLES.LIST_ITEM('• Example: Type "1" and press Enter to view first project')}\n\n`;

        let projectNumber = 1;
        for (const [category, categoryProjects] of Object.entries(projects)) {
            output += `${STYLES.CATEGORY(category)}\n`;
            categoryProjects.forEach(project => {
                output += `${STYLES.LIST_ITEM(`${STYLES.SUCCESS(projectNumber.toString())}. ${project.name}`)}\n`;
                output += `${STYLES.PROJECT_DESC(project.description)}\n`;
                projectNumber++;
            });
            output += '\n';
        }

        const lastNum = projectNumber - 1;
        output += STYLES.WARNING(`Enter a number (1-${lastNum}) to view project details`) + '\n';

        this.projectsList = projects;
        this.appendOutput(output);
    }

    showProjectDetails(num) {
        let currentNum = 1;
        for (const categoryProjects of Object.values(this.projectsList)) {
            for (const project of categoryProjects) {
                if (currentNum === num) {
                    let output = `\n${STYLES.PROJECT_TITLE(project.name)}\n`;
                    output += `${STYLES.PROJECT_DESC(project.description)}\n`;
                    project.details.forEach(detail => {
                        output += `${STYLES.LIST_ITEM(detail)}\n`;
                    });
                    output += `${STYLES.SEPARATOR()}\n`;
                    this.appendOutput(output);
                    return;
                }
                currentNum++;
            }
        }
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
                    this.appendOutput(`<span class="spin-text">Just kidding! 😉</span>`);
                    setTimeout(() => {
                        this.appendOutput(`${STYLES.SUCCESS('Type "help" to see available commands')}`);
                    }, 1000);  // Wait for spin animation to complete
                    this.resetCursor();
                    this.input.value = '';
                }, DELAYS.MELTDOWN_COMPLETE);
            }, DELAYS.MELTDOWN_WARNING + DELAYS.MELTDOWN_START);
        } catch (error) {
            console.error('Meltdown effect failed:', error);
            this.clear();
            this.appendOutput('System restored from backup.');
            this.appendOutput(`${STYLES.SUCCESS('Type "help" to see available commands')}`);
        }
    }

    fakeHack() {
        try {
            const terminal = document.querySelector('.terminal');
            const terminalTitle = document.querySelector('.terminal-title');
            
            if (!terminal || !terminalTitle) {
                throw new Error('Required DOM elements not found');
            }
            
            const steps = [
                { text: 'Initializing hack sequence...', delay: 0 },
                { text: 'Bypassing firewall...', delay: 1000 },
                { text: 'Access denied! Deploying advanced algorithms...', delay: 2000 },
                { text: 'Cracking security protocols... [==        ] 20%', delay: 3000 },
                { text: 'Cracking security protocols... [====      ] 40%', delay: 3500 },
                { text: 'Cracking security protocols... [======    ] 60%', delay: 4000 },
                { text: 'Cracking security protocols... [========  ] 80%', delay: 4500 },
                { text: 'Cracking security protocols... [==========] 100%', delay: 5000 },
                { text: 'ACCESS GRANTED! Downloading sensitive data...', delay: 5500 },
                { text: 'WARNING: Intrusion detected!', delay: 6500, style: STYLES.MELTDOWN_WARNING },
                { text: 'SECURITY PROTOCOLS ENGAGED', delay: 7000, style: STYLES.MELTDOWN_WARNING },
                { text: 'System lockdown initiated...', delay: 7500 },
                { text: '...', delay: 8000 },
                { text: 'SECURITY OVERRIDE SUCCESSFUL', delay: 8500, style: STYLES.HACK },
                { text: 'ROOT ACCESS GRANTED', delay: 9000, style: STYLES.HACK },
                { text: 'WELCOME, ADMINISTRATOR 😈', delay: 9500, style: text => `<span class="evil-welcome">${text}</span>` }
            ];

            // Add glitch effect during hack
            setTimeout(() => {
                document.querySelector('.terminal').classList.add('screen-glitch');
            }, 6500);

            // Remove glitch and add evil theme
            setTimeout(() => {
                document.querySelector('.terminal').classList.remove('screen-glitch');
                document.querySelector('.terminal').classList.add('evil-mode');
                document.querySelector('.terminal-title').textContent = 'root@portfolio:~';
                this.prompt = 'root@portfolio:~# ';
                
                // Update all prompt elements
                const prompts = document.querySelectorAll('.prompt');
                prompts.forEach(prompt => {
                    prompt.textContent = 'root@portfolio:~# ';
                    prompt.style.color = '#ff0000';
                    prompt.style.textShadow = '0 0 8px rgba(255, 0, 0, 0.8)';
                });

                // Use the same fixed cursor position
                this.cursorPosition = CURSOR_BASE_POSITION;
                this.resetCursor();
            }, 9000);

            steps.forEach(({ text, delay, style = STYLES.HACK }) => {
                setTimeout(() => {
                    this.appendOutput(style(text));
                }, delay);
            });

        } catch (error) {
            console.error('Hack sequence failed:', error);
            this.appendOutput('System restored to normal operation.');
        }
    }

    exitEvilMode() {
        const terminal = document.querySelector('.terminal');
        if (terminal && terminal.classList.contains('evil-mode')) {
            // Add glitch effect first
            terminal.classList.add('screen-glitch');
            
            // Wait a bit, then remove evil mode
            setTimeout(() => {
                terminal.classList.remove('screen-glitch');
                terminal.classList.remove('evil-mode');
                document.querySelector('.terminal-title').textContent = 'user@portfolio:~';
                this.prompt = 'user@portfolio:~$ ';
                
                // Reset all prompts with transition
                const prompts = document.querySelectorAll('.prompt');
                prompts.forEach(prompt => {
                    prompt.style.transition = 'all 0.3s ease';
                    prompt.textContent = 'user@portfolio:~$ ';
                    prompt.style.color = '';
                    prompt.style.textShadow = '';
                });

                this.cursorPosition = CURSOR_BASE_POSITION;
                this.resetCursor();
                
                // Clear screen and show restored message
                this.clear();
                this.appendOutput(STYLES.SUCCESS('System restored to normal operation.'));
                this.appendOutput(STYLES.SUCCESS('Type "help" to see available commands'));
            }, 1000);
        }
    }

    destroy() {
        // Clean up event listeners when terminal is destroyed
        this.input.removeEventListener('keydown', this.handleKeydown);
        this.input.removeEventListener('input', this.handleInput);
        window.removeEventListener('resize', this.handleResize);
        this.terminal.removeEventListener('click', () => this.input.focus());
    }

    updatePrompt(newPrompt) {
        this.prompt = newPrompt;
        this.cursorPosition = CURSOR_BASE_POSITION;
        
        document.querySelectorAll('.prompt').forEach(prompt => {
            prompt.textContent = newPrompt;
        });
        this.resetCursor();
    }

    matrixMode() {
        try {
            const terminal = document.querySelector('.terminal');
            terminal.classList.add('matrix-mode');
            
            // Create canvas for falling characters
            const canvas = document.createElement('canvas');
            canvas.classList.add('matrix-rain');
            terminal.appendChild(canvas);
            
            // Initialize matrix rain
            this.initMatrixRain(canvas);
            
            // Clear existing content
            this.clear();
            this.inputLine.style.opacity = '0';
            
            // Matrix text effect with green glow
            const messages = [
                { text: 'Wake up, Neo...', delay: 1000 },
                { text: 'The Matrix has you...', delay: 3000 },
                { text: 'Follow the white rabbit.', delay: 5000 },
                { text: 'Knock, knock, Neo.', delay: 7000 }
            ];

            messages.forEach(({ text, delay }) => {
                setTimeout(() => {
                    terminal.classList.add('screen-glitch');
                    setTimeout(() => terminal.classList.remove('screen-glitch'), 200);
                    this.appendOutput(`<span class="matrix-text">${text}</span>`);
                }, delay);
            });

            // Return to normal after sequence
            setTimeout(() => {
                terminal.classList.add('screen-glitch');
                setTimeout(() => {
                    terminal.classList.remove('screen-glitch');
                    terminal.classList.remove('matrix-mode');
                    canvas.remove();  // Remove the rain effect
                    this.clear();
                    this.inputLine.style.opacity = '1';
                    this.appendOutput(STYLES.SUCCESS('Type "help" to see available commands'));
                }, 200);
            }, 8000);

        } catch (error) {
            console.error('Matrix effect failed:', error);
            this.clear();
            this.appendOutput('System restored.');
            this.appendOutput(STYLES.SUCCESS('Type "help" to see available commands'));
            this.inputLine.style.opacity = '1';
        }
    }

    initMatrixRain(canvas) {
        try {
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const fontSize = 14;
            const columns = Math.floor(canvas.width / fontSize);
            const drops = new Array(columns).fill(1);

            function draw() {
                // Create fade effect
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw characters
                for (let i = 0; i < drops.length; i++) {
                    const text = chars[Math.floor(Math.random() * chars.length)];
                    const x = i * fontSize;
                    const y = drops[i] * fontSize;

                    // Bright leading character
                    if (drops[i] * fontSize < canvas.height && Math.random() > 0.975) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    } else {
                        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
                    }

                    ctx.font = `${fontSize}px monospace`;
                    ctx.fillText(text, x, y);

                    // Reset drop
                    if (y > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }

                if (canvas.parentElement) {
                    requestAnimationFrame(draw);
                }
            }

            draw();
        } catch (error) {
            console.error('Matrix rain effect failed:', error);
            if (canvas.parentElement) {
                canvas.remove();
            }
            this.appendOutput(STYLES.ERROR('Matrix effect initialization failed'));
        }
    }

    updateCursorPosition() {
        const promptElement = this.inputLine.querySelector('.prompt');
        const promptWidth = promptElement.offsetWidth;
        const inputWidth = this.input.value.length * CHAR_WIDTH;
        this.cursor.style.left = `${promptWidth + inputWidth + CURSOR_OFFSET}px`;
    }

    resetCursor() {
        const promptElement = this.inputLine.querySelector('.prompt');
        const promptWidth = promptElement.offsetWidth;
        this.cursor.style.left = `${promptWidth + CURSOR_OFFSET}px`;
    }

    handleResize() {
        this.resetCursor();
    }

    // Add method to handle focus loss
    handleFocusLoss = () => {
        requestAnimationFrame(() => {
            this.input.focus();
        });
    };
}

// Use DOMContentLoaded only once
document.addEventListener('DOMContentLoaded', () => {
    new Terminal();
}, { once: true });

