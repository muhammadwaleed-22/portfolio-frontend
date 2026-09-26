// navigation.js - Navbar and mobile menu behavior

export function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navbarNav = document.getElementById('navbar-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Navbar on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // Mobile Menu Toggle
    const toggleMenu = () => {
        const isOpen = navbarNav.classList.contains('is-open');
        
        if (isOpen) {
            navbarNav.classList.remove('is-open');
            mobileToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = ''; // Restore scrolling
            
            // Swap icon to menu
            mobileToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        } else {
            navbarNav.classList.add('is-open');
            mobileToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            
            // Swap icon to close
            mobileToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="close-icon"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        }
    };

    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMenu);
    }

    // Close menu when a navigation item is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            e.currentTarget.classList.add('active');
            
            if (navbarNav.classList.contains('is-open')) {
                toggleMenu();
            }
        });
    });

    // ScrollSpy to update active link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveLink() {
        if (sections.length === 0) return;
        
        let current = '';
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Adjust offset to trigger slightly earlier
            if (scrollY >= (sectionTop - 300)) {
                current = section.getAttribute('id');
            }
        });

        if (current) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }
    }

    // Run on scroll
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    
    // Run on page load (in case user loads a deep link like /#experience)
    setTimeout(updateActiveLink, 100);

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navbarNav.classList.contains('is-open')) {
            toggleMenu();
            mobileToggle.focus(); // Return focus to button for accessibility
        }
    });

    // Handle window resize properly (prevent broken states if resized while menu is open)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navbarNav.classList.contains('is-open')) {
            toggleMenu();
        }
    });
}
