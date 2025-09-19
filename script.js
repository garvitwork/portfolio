// script.js file

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Remove active class from all nav links and sections
            navLinks.forEach(nl => nl.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked nav link and target section
            this.classList.add('active');
            document.getElementById(targetId).classList.add('active');
            
            // Initialize enhanced projects section if navigating to projects
            if (targetId === 'projects') {
                initializeEnhancedProjects();
            }
        });
    });

    // Form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            
            // Show success message
            showNotification('Thank you for your message! I\'ll get back to you within 24 hours.', 'success');
            
            // Reset form
            this.reset();
        });
    }

    // Smooth scrolling for anchor links (exclude external links)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards for animations
    document.querySelectorAll('.metric-card, .project-card, .skill-card, .contact-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add hover effects to skill items
    document.querySelectorAll('.skill-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click effects to tech tags
    document.querySelectorAll('.tech-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Dynamic typing effect for hero title
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Apply typing effect to hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 150);
    }

    // Updated button loading animation - exclude external links
    document.querySelectorAll('.btn-primary, .enhanced-btn-primary').forEach(button => {
        button.addEventListener('click', function(e) {
            // Check if this is an external link (GitHub link)
            const href = this.getAttribute('href');
            
            // If it's an external link, allow default behavior (open link)
            if (href && (href.startsWith('http') || href.startsWith('https'))) {
                // Add visual feedback for external links
                const originalText = this.textContent;
                this.textContent = 'Opening...';
                
                setTimeout(() => {
                    this.textContent = originalText;
                }, 1000);
                
                return; // Allow the link to open normally
            }
            
            // For form submissions or other buttons
            if (this.type !== 'submit') {
                e.preventDefault();
                
                const originalText = this.textContent;
                this.textContent = 'Loading...';
                this.disabled = true;
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                }, 2000);
            }
        });
    });

    // Counter animation for metrics
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start) + '+';
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + '+';
            }
        }
        updateCounter();
    }

    // Animate metric counters when they come into view
    const metricObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const valueElement = entry.target.querySelector('.metric-value');
                const value = parseInt(valueElement.textContent);
                
                if (!isNaN(value)) {
                    animateCounter(valueElement, value);
                }
                
                metricObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.metric-card').forEach(card => {
        metricObserver.observe(card);
    });

    // Add parallax effect to hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        const rate = scrolled * -0.5;
        
        if (heroSection) {
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });

    // Add search functionality for skills
    function createSkillSearch() {
        const skillsSection = document.getElementById('skills');
        if (skillsSection) {
            const searchContainer = document.createElement('div');
            searchContainer.innerHTML = `
                <div class="search-container" style="text-align: center; margin-bottom: 2rem;">
                    <input type="text" id="skill-search" placeholder="Search skills..." 
                           style="padding: 0.75rem; border: 2px solid var(--border-color); border-radius: var(--radius-md); width: 300px; max-width: 100%;">
                </div>
            `;
            
            const sectionHeader = skillsSection.querySelector('.section-header');
            sectionHeader.appendChild(searchContainer);
            
            const searchInput = document.getElementById('skill-search');
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const skillItems = document.querySelectorAll('.skill-item');
                
                skillItems.forEach(item => {
                    if (item.textContent.toLowerCase().includes(searchTerm)) {
                        item.style.display = 'inline-block';
                        item.style.opacity = '1';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
    }

    // Initialize skill search
    createSkillSearch();

    // Enhanced Projects Section Functionality
    function initializeEnhancedProjects() {
        // Initialize loading animations for enhanced project cards
        const enhancedProjectCards = document.querySelectorAll('.enhanced-project-card');
        enhancedProjectCards.forEach((card, index) => {
            // Reset animation state
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });

        // Project filtering functionality
        const filterButtons = document.querySelectorAll('.filter-btn');
        const enhancedProjects = document.querySelectorAll('.enhanced-project-card');

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter projects with animation
                enhancedProjects.forEach((project, index) => {
                    const category = project.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        project.style.display = 'flex';
                        setTimeout(() => {
                            project.style.opacity = '1';
                            project.style.transform = 'translateY(0)';
                        }, index * 100);
                    } else {
                        project.style.opacity = '0';
                        project.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            project.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });

        // Enhanced tech tag hover effects
        document.querySelectorAll('.enhanced-tech-tag').forEach(tag => {
            tag.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px) scale(1.05)';
            });
            
            tag.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Enhanced project highlights hover effects
        document.querySelectorAll('.enhanced-project-highlights li').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(5px)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0)';
            });
        });
    }

    // Initialize enhanced projects if projects section is already active
    if (document.getElementById('projects').classList.contains('active')) {
        initializeEnhancedProjects();
    }
});

// Utility function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--success-color)' : 'var(--primary-color)'};
        color: white;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Slide out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Add some easter eggs
document.addEventListener('keydown', function(e) {
    // Konami code: up, up, down, down, left, right, left, right, b, a
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    window.konamiProgress = window.konamiProgress || 0;
    
    if (e.keyCode === konamiCode[window.konamiProgress]) {
        window.konamiProgress++;
        if (window.konamiProgress === konamiCode.length) {
            showNotification('🚀 Easter egg activated! You found the secret!', 'success');
            document.body.style.transform = 'rotate(360deg)';
            document.body.style.transition = 'transform 1s ease';
            setTimeout(() => {
                document.body.style.transform = 'rotate(0deg)';
            }, 1000);
            window.konamiProgress = 0;
        }
    } else {
        window.konamiProgress = 0;
    }
});

// Performance optimization: Lazy load images if you add them later
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
lazyLoadImages();