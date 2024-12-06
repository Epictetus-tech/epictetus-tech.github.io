function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add animations to various elements
    document.querySelectorAll('.achievement-card').forEach((element, index) => {
        if (index % 2 === 0) {
            element.classList.add('fade-in-left');
        } else {
            element.classList.add('fade-in-right');
        }
        observer.observe(element);
    });

    document.querySelectorAll('.section-title, .section-subtitle').forEach(element => {
        element.classList.add('fade-in-up');
        observer.observe(element);
    });

    document.querySelectorAll('.skill-card').forEach((element, index) => {
        element.style.transitionDelay = `${index * 0.1}s`;
        element.classList.add('fade-in-up');
        observer.observe(element);
    });

    document.querySelectorAll('.contact-card').forEach((element, index) => {
        element.style.transitionDelay = `${index * 0.1}s`;
        element.classList.add('fade-in-up');
        observer.observe(element);
    });
}

function handleResize() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Configuration
const CONFIG = {
    // Unused
    // scrollOffset: 70,
    // animationDuration: 300
};

// DOM Elements
const DOM = {
    navbar: document.querySelector('.main-nav'),
    heroSection: document.querySelector('.hero'),
    // Unused
    // projectCards: document.querySelectorAll('.project-card'),
    // toolCards: document.querySelectorAll('.tool-card')
};

// Event Handlers
function initializeEventListeners() {
    // Handle email errors gracefully
    document.querySelector('a[href^="mailto"]').addEventListener('click', (e) => {
        try {
            if (!navigator.onLine) {
                e.preventDefault();
                alert('Please check your internet connection');
            }
        } catch (error) {
            console.error('Email link error:', error);
        }
    });

    window.addEventListener('load', () => {
        window.scrollTo(0, 0);
        initializeSmoothScrolling();
        initializeScrollAnimations();
        createParticles();
    });

    window.addEventListener('resize', debounce(handleResize, 250));

    // Back to top button functionality
    const backToTopButton = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function createParticles() {
    const container = document.createElement('div');
    container.className = 'particle-background';
    
    const hero = document.querySelector('.hero');
    if (!hero) {
        console.error('Hero section not found');
        return;
    }
    
    hero.appendChild(container);

    const particleCount = 35;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        particle.style.left = `${Math.random() * 100}%`;
        const delay = Math.random() * 20;
        particle.style.animationDelay = `-${delay}s`;
        
        const duration = 15 + Math.random() * 10;
        const size = 2 + Math.random() * 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDuration = `${duration}s`;
        
        container.appendChild(particle);
    }
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

function updateScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress-bar');
    const scrollPx = document.documentElement.scrollTop;
    const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = `${(scrollPx / winHeightPx) * 100}%`;
    scrollProgress.style.width = scrolled;
}

window.addEventListener('scroll', updateScrollProgress);

// Initialize everything
initializeEventListeners(); 