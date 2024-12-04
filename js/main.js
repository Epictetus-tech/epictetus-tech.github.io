class Terminal {
    constructor() {
        this.terminal = document.querySelector('.terminal-content');
        this.output = document.querySelector('.terminal-output');
        this.input = document.querySelector('.terminal-input');
        this.prompt = 'user@portfolio:~$ ';
        this.commands = {
            help: this.showHelp.bind(this),
            clear: this.clear.bind(this),
            about: this.about.bind(this),
            skills: this.skills.bind(this),
            projects: this.projects.bind(this),
            contact: this.contact.bind(this),
            theme: this.changeTheme.bind(this),
            pwd: this.pwd.bind(this)
        };
        
        this.easterEggs = {
            'sudo rm -rf /': this.systemMeltdown.bind(this),
            'hack': this.fakeHack.bind(this)
        };
        
        this.themes = {
            default: 'terminal-theme-default',
            matrix: 'terminal-theme-matrix',
            ubuntu: 'terminal-theme-ubuntu',
            light: 'terminal-theme-light'
        };
        
        this.commandHistory = [];
        this.historyIndex = -1;
        
        this.currentPath = '/home/user';
        
        this.initializeTerminal();
    }

    initializeTerminal() {
        const terminalContainer = document.querySelector('.terminal');
        
        // Hide input line initially but keep it accessible
        const inputLine = document.querySelector('.terminal-input-line');
        inputLine.style.opacity = '0';  // Change from visibility to opacity
        
        // Listen for the startup animation to complete
        terminalContainer.addEventListener('animationend', () => {
            this.showBootSequence();
        }, { once: true });

        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim().toLowerCase();
                this.executeCommand(command);
                this.input.value = '';
                // Reset cursor position
                const cursor = document.querySelector('.cursor');
                cursor.style.left = '175px';
            }
        });

        // Update cursor position while typing
        this.input.addEventListener('input', () => {
            const cursor = document.querySelector('.cursor');
            const inputWidth = this.input.value.length * 9.6;
            cursor.style.left = `${175 + inputWidth}px`;
            cursor.style.top = '50%';  // Ensure vertical alignment stays consistent
        });

        // Add command history navigation
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex++;
                    this.input.value = this.commandHistory[this.historyIndex];
                    // Update cursor position
                    const cursor = document.querySelector('.cursor');
                    const inputWidth = this.input.value.length * 9.6;
                    cursor.style.left = `${175 + inputWidth}px`;
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex > -1) {
                    this.historyIndex--;
                    this.input.value = this.historyIndex >= 0 ? 
                        this.commandHistory[this.historyIndex] : '';
                    // Update cursor position
                    const cursor = document.querySelector('.cursor');
                    const inputWidth = this.input.value.length * 9.6;
                    cursor.style.left = `${175 + inputWidth}px`;
                }
            }
        });
    }

    async showBootSequence() {
        const bootMessages = [
            'BIOS Version 1.0.4',
            'Running system diagnostics...',
            'CPU: JavaScript V8 <span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[SUCCESS]</span>',
            'Memory Test: OK <span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[PASS]</span>',
            'Checking storage devices...',
            'SSD Status: Healthy <span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[VERIFIED]</span>',
            'Loading kernel...',
            'Loading initial ramdisk...',
            'Starting system logger <span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[DONE]</span>',
            'Starting system message bus <span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[DONE]</span>',
            'Starting network manager <span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[DONE]</span>',
            'Mounting filesystems...',
            '<span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[  OK  ]</span> Started Network File System',
            '<span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[  OK  ]</span> Reached target Network',
            '<span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[  OK  ]</span> Reached target Basic System',
            '<span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[  OK  ]</span> Started D-Bus System Message Bus',
            '<span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[  OK  ]</span> Started System Logging Service',
            '<span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[  OK  ]</span> Reached target System Initialization',
            '<span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[  OK  ]</span> Started Portfolio Service',
            'Portfolio Terminal 1.0.0 Loading...',
            'Initializing user interface...',
            'Starting session manager...',
            'Boot sequence complete. <span style="color: #ffff00; text-shadow: 0 0 5px #ffff00">[SUCCESS]</span>'
        ];

        for (const msg of bootMessages) {
            this.appendOutput(`${msg}`);
            // Random delay between 100ms and 500ms
            await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100));
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.clear();
        this.showWelcomeMessage();
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browserName;
        
        if (ua.includes('Firefox/')) {
            browserName = 'Firefox';
        } else if (ua.includes('Chrome/')) {
            browserName = 'Chrome';
        } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
            browserName = 'Safari';
        } else {
            browserName = 'Unknown Browser';
        }
        
        return browserName;
    }

    showWelcomeMessage() {
        const systemInfo = {
            uptime: Math.floor(Math.random() * 100),
            memory: {
                total: 1024,
                used: Math.floor(Math.random() * 512),
            },
            disk: {
                total: 512,
                used: Math.floor(Math.random() * 300),
            },
            cpu: navigator.hardwareConcurrency ? `JavaScript V8 (${navigator.hardwareConcurrency} cores)` : 'JavaScript V8',
            browser: this.getBrowserInfo(),
            resolution: `${window.screen.width}x${window.screen.height}`
        };

        const asciiArt = `<span class="banner-text">

███╗   ███╗    ██╗  ██████╗      user@portfolio
████╗ ████║    ██║ ██╔═══██╗     OS: Portfolio Linux x86_64
██╔████╔██║    ██║ ██║   ██║     Kernel: 6.1.0-portfolio
██║╚██╔╝██║██  ██║ ██║   ██║     Uptime: ${systemInfo.uptime} days
██║ ╚═╝ ██║╚████╔╝ ╚██████╔╝     Shell: bash 5.1.16
╚═╝     ╚═╝ ╚═══╝   ╚════██╗     Terminal: ${systemInfo.browser}
                         ╚═╝     CPU: ${systemInfo.cpu}
                                Memory: ${systemInfo.memory.used}MB / ${systemInfo.memory.total}MB
                                Disk: ${systemInfo.disk.used}GB / ${systemInfo.disk.total}GB
                                Resolution: ${systemInfo.resolution}</span>

<span style="color: #00ff00">Welcome to my interactive terminal portfolio!</span>
Type '<span class="command">help</span>' to see available commands.
<span style="color: #ff0000; opacity: 0.1;">WARNING: Unauthorized use of 'sudo rm -rf /' will result in system meltdown</span>`;

        this.appendOutput(asciiArt);
        const inputLine = document.querySelector('.terminal-input-line');
        inputLine.style.opacity = '1';
        this.input.focus();
    }

    executeCommand(command) {
        // Add command to history if not empty
        if (command) {
            this.commandHistory.unshift(command);
            this.historyIndex = -1;
        }
        
        const [cmd, ...args] = command.split(' ');
        this.appendOutput(`${this.prompt}${command}`);
        
        if (command === '') {
            this.appendOutput('');
            return;
        }

        // Check for easter eggs first using the full command
        if (this.easterEggs[command]) {
            this.easterEggs[command]();
            return;
        }

        // Then check for regular commands
        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.appendOutput(`Command not found: ${cmd}. Type 'help' for available commands.`);
        }
    }

    appendOutput(text) {
        const fragment = document.createDocumentFragment();
        const div = document.createElement('div');
        div.innerHTML = `${text}\n`;
        fragment.appendChild(div);
        this.output.appendChild(fragment);
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    showHelp() {
        const helpText = `
Available commands:
    <span class="command">help</span>     - Show this help message
    <span class="command">clear</span>    - Clear the terminal
    <span class="command">about</span>    - About me
    <span class="command">skills</span>   - My technical skills
    <span class="command">projects</span> - View my projects
    <span class="command">contact</span>  - Contact information
    <span class="command">theme</span>    - Change terminal theme (usage: theme [default|matrix|ubuntu|light])
    <span class="command">pwd</span>      - Print working directory
        `;
        this.appendOutput(helpText);
    }

    clear() {
        this.output.innerHTML = '';
    }

    about() {
        const aboutText = `
About Me:
I am a Linux System Administrator with a passion for automation and system optimization.
[Add your personal description here]
        `;
        this.appendOutput(aboutText);
    }

    skills() {
        const skillsText = `
Technical Skills:
• Linux System Administration
• Shell Scripting (Bash)
• Configuration Management (Ansible, Puppet)
• Cloud Services (AWS, GCP)
• Containerization (Docker, Kubernetes)
• Monitoring & Logging
• Network Administration
[Add/modify skills as needed]
        `;
        this.appendOutput(skillsText);
    }

    projects() {
        const projectsText = `
Featured Projects:
1. Automated Deployment Pipeline
   - Description: [Add project description]
   - Technologies: [Add technologies used]

2. Infrastructure Monitoring Solution
   - Description: [Add project description]
   - Technologies: [Add technologies used]

[Add more projects as needed]
        `;
        this.appendOutput(projectsText);
    }

    contact() {
        const contactText = `
Contact Information:
• Email: [Your Email]
• LinkedIn: [Your LinkedIn]
• GitHub: [Your GitHub]
• Phone: [Your Phone Number]
        `;
        this.appendOutput(contactText);
    }

    changeTheme(args) {
        const themeName = args ? args[0] : null;
        const terminal = document.querySelector('.terminal');
        
        if (!themeName) {
            const availableThemes = Object.keys(this.themes).join(', ');
            this.appendOutput(`Available themes: ${availableThemes}`);
            return;
        }

        if (this.themes[themeName]) {
            // Remove all theme classes
            Object.values(this.themes).forEach(theme => {
                terminal.classList.remove(theme);
            });
            
            // Add new theme class
            terminal.classList.add(this.themes[themeName]);
            this.appendOutput(`Theme changed to ${themeName}`);
        } else {
            this.appendOutput(`Theme "${themeName}" not found. Available themes: ${Object.keys(this.themes).join(', ')}`);
        }
    }

    systemMeltdown() {
        const terminal = document.querySelector('.terminal');
        const cursor = document.querySelector('.cursor');
        
        this.appendOutput('<span style="color: #b366ff; text-shadow: 0 0 8px #b366ff">Permission denied: Nice try! 😈</span>');
        setTimeout(() => {
            this.appendOutput('<span style="color: #b366ff; text-shadow: 0 0 8px #b366ff">Wait... what\'s happening?</span>');
            setTimeout(() => {
                this.appendOutput('<span style="color: #b366ff; text-shadow: 0 0 8px #b366ff">SYSTEM FAILURE IMMINENT</span>');
                terminal.style.animation = 'none';
                terminal.offsetHeight; // Trigger reflow
                terminal.style.animation = null;
                terminal.classList.add('terminal-meltdown');
                setTimeout(() => {
                    this.clear();
                    this.appendOutput('Just kidding! 😉');  // No purple glow after reset
                    terminal.classList.remove('terminal-meltdown');
                    // Reset cursor position
                    cursor.style.left = '170px';
                    this.input.value = '';
                }, 3000);
            }, 2000);  // Increased from 1000 to 2000
        }, 1500);  // Increased from 500 to 1500
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
        
        let i = 0;
        const interval = setInterval(() => {
            if (i < steps.length) {
                this.appendOutput(steps[i]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 1000);
    }

    pwd() {
        this.appendOutput(this.currentPath);
    }
}
// Initialize the terminal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Terminal();
});

// Add this after Terminal class initialization
function createStarField() {
    const starField = document.createElement('div');
    starField.className = 'star-field';
    document.body.appendChild(starField);

    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Keep the larger size
        const size = Math.random() * 4 + 4;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random position
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        
        // Much slower animation (30-45 seconds)
        const duration = Math.random() * 15 + 30;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.animationName = `starMove${Math.floor(Math.random() * 3) + 1}`;
        
        starField.appendChild(star);
    }
}

function addRandomGlitch() {
    const terminal = document.querySelector('.terminal');
    
    setInterval(() => {
        // Random chance to trigger glitch
        if (Math.random() < 0.1) { // 10% chance every check
            terminal.classList.add('screen-glitch');
            
            // Remove class after animation completes
            setTimeout(() => {
                terminal.classList.remove('screen-glitch');
            }, 3000);
        }
    }, 10000); // Check every 10 seconds
}

function createCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    // Track if mouse has moved
    let hasMouseMoved = false;

    document.addEventListener('mousemove', (e) => {
        if (!hasMouseMoved) {
            hasMouseMoved = true;
            cursor.style.opacity = '1';
        }
        
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        
        const isOverInput = e.target.classList.contains('terminal-input');
        cursor.classList.toggle('text', isOverInput);
    });
}

createStarField();
addRandomGlitch();
createCustomCursor();

