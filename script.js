document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.portal');
    const container = document.querySelector('.portal-container');
    
    // Add parallax effect
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        const moveX = (mouseX - 0.5) * 20;
        const moveY = (mouseY - 0.5) * 20;
        
        container.style.backgroundPosition = `${50 + moveX}% ${50 + moveY}%`;
    });
    
    const handleMouseMove = (e, card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => handleMouseMove(e, card));
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });
    
    // Add loading animation handlers
    document.querySelectorAll('.portal').forEach(portal => {
        portal.addEventListener('click', (e) => {
            e.preventDefault();
            const href = portal.getAttribute('href');
            const overlay = document.querySelector('.loading-overlay');
            
            // Add appropriate transition class
            overlay.classList.add(
                portal.classList.contains('business') 
                    ? 'business-transition' 
                    : 'tech-transition'
            );
            
            // Show overlay
            overlay.classList.add('active');
            
            // Navigate after animation
            setTimeout(() => {
                window.location.href = href;
            }, 800);
        });
    });
}); 