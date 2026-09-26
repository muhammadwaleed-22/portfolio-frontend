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
    const closeMobileNav = () => {
        navbarNav.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.classList.remove('active');
        document.body.classList.remove('nav-open');
        
        // Swap icon to menu
        mobileToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    };

    const openMobileNav = () => {
        navbarNav.classList.add('is-open');
        mobileToggle.setAttribute('aria-expanded', 'true');
        mobileToggle.classList.add('active');
        document.body.classList.add('nav-open');
        
        // Swap icon to close
        mobileToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="close-icon"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    };

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            if (navbarNav.classList.contains('is-open')) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });
    }

    // Close menu when a navigation item is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            e.currentTarget.classList.add('active');
            
            closeMobileNav();
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
            closeMobileNav();
            mobileToggle.focus(); // Return focus to button for accessibility
        }
    });

    // Handle mobile DOM positioning for fixed nav
    // (Bypasses CSS containing block bug caused by backdrop-filter on the navbar)
    const handleNavLocation = () => {
        if (window.innerWidth <= 768) {
            if (navbarNav.parentElement !== document.body) {
                document.body.appendChild(navbarNav);
            }
        } else {
            const container = navbar.querySelector('.container');
            if (navbarNav.parentElement !== container) {
                container.appendChild(navbarNav);
            }
            if (navbarNav.classList.contains('is-open')) {
                closeMobileNav();
            }
        }
    };

    // Run on load and resize
    handleNavLocation();
    window.addEventListener('resize', handleNavLocation);
}
