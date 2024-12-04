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
            theme: this.changeTheme.bind(this)
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
        
        this.initializeTerminal();
    }

    initializeTerminal() {
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim().toLowerCase();
                this.executeCommand(command);
                this.input.value = '';
            }
        });

        this.input.addEventListener('focusin', () => {
            setTimeout(() => {
                this.terminal.scrollTop = this.terminal.scrollHeight;
            }, 100);
        });

        this.terminal.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (e.target === this.input) {
                this.input.focus();
            }
        });

        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        const isMobile = window.innerWidth <= 600;
        
        const desktopBanner = `<span class="banner-text">

███╗   ███╗    ██╗  ██████╗      user@portfolio
████╗ ████║    ██║ ██╔═══██╗     OS: Portfolio Linux x86_64
██╔████╔██║    ██║ ██║   ██║     Kernel: 6.1.0-portfolio
██║╚██╔╝██║██  ██║ ██║   ██║     Uptime: ${Math.floor(Math.random() * 100)} days
██║ ╚═╝ ██║╚████╔╝ ╚██████╔╝     Shell: bash 5.1.16
╚═╝     ╚═╝ ╚═══╝   ╚════██╗     Terminal: web-term
                         ╚═╝     CPU: JavaScript V8
                                 Memory: 512MB / 1024MB
                                 Disk: 121GB / 512GB
                                 Theme: Dark</span>`;

        const mobileBanner = `<span class="banner-text">
███╗   ███╗    ██╗  ██████╗
████╗ ████║    ██║ ██╔═══██╗    OS: Portfolio Linux
██╔████╔██║    ██║ ██║   ██║    Shell: bash 5.1.16
██║╚██╔╝██║██  ██║ ██║   ██║    Memory: 512MB
██║ ╚═╝ ██║╚████╔╝ ╚██████╔╝    CPU: JS V8
╚═╝     ╚═╝ ╚═══╝   ╚════██╗    Uptime: ${Math.floor(Math.random() * 100)}d
                         ╚═╝</span>`;

        const banner = isMobile ? mobileBanner : desktopBanner;
        const message = `${banner}
Welcome to my Terminal Portfolio!
Type '<span class="command">help</span>' to see available commands.
    `;
        this.appendOutput(message);
    }

    executeCommand(command) {
        const [cmd, ...args] = command.split(' ');
        this.appendOutput(`${this.prompt}${command}`);
        
        if (command === '') {
            this.appendOutput('');
            return;
        }

        if (this.easterEggs[command]) {
            this.easterEggs[command]();
            return;
        }

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
        this.appendOutput('Permission denied: Nice try! 😈');
        setTimeout(() => {
            this.appendOutput('Wait... what\'s happening?');
            setTimeout(() => {
                this.appendOutput('SYSTEM FAILURE IMMINENT');
                document.querySelector('.terminal').classList.add('terminal-meltdown');
                setTimeout(() => {
                    this.clear();
                    this.appendOutput('Just kidding! 😉');
                    document.querySelector('.terminal').classList.remove('terminal-meltdown');
                }, 3000);
            }, 1000);
        }, 500);
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
}

// Initialize the terminal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Terminal();
});
