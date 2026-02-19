/**
 * TEKROK INC - Main Application JS
 * Handles: Mobile Menu, Navbar Scroll, Dropdown, Smooth Scroll, Reveal Animations, Stats Counter
 */
document.addEventListener('DOMContentLoaded', () => {

    // ===== SELECTORS =====
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('main-nav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');

    // ===== MOBILE MENU =====
    function openMenu() {
        navLinks.classList.add('active');
        menuToggle.classList.add('active');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (navLinks.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMenu);
    }

    // Close menu on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
            // Close all dropdowns
            document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
        }
    });

    // ===== DROPDOWN (Desktop hover + Mobile click) =====
    const isMobile = () => window.innerWidth <= 768;

    dropdownTriggers.forEach(trigger => {
        const dropdown = trigger.closest('.dropdown');

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Close other dropdowns
            document.querySelectorAll('.dropdown').forEach(d => {
                if (d !== dropdown) d.classList.remove('open');
            });

            dropdown.classList.toggle('open');
        });
    });

    // Desktop: close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
        }
    });

    // Desktop: hover open/close (only on desktop)
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.addEventListener('mouseenter', () => {
            if (!isMobile()) dropdown.classList.add('open');
        });
        dropdown.addEventListener('mouseleave', () => {
            if (!isMobile()) dropdown.classList.remove('open');
        });
    });

    // ===== NAVBAR SCROLL EFFECT =====
    function handleNavScroll() {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    if (navbar) {
        window.addEventListener('scroll', handleNavScroll, { passive: true });
        handleNavScroll(); // Run on load
    }

    // ===== SMOOTH SCROLLING =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId.startsWith('#')) return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                closeMenu();

                const navHeight = navbar ? navbar.offsetHeight : 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== SCROLL REVEAL ANIMATION =====
    const revealElements = document.querySelectorAll('.reveal, .reveal-up');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback: show everything if IntersectionObserver is not supported
        revealElements.forEach(el => el.classList.add('active'));
    }

    // ===== STATS COUNTER ANIMATION =====
    const statsSection = document.querySelector('.stats-section');
    let statsCounted = false;

    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !statsCounted) {
                statsCounted = true;
                const statValues = statsSection.querySelectorAll('.stat-item h3');

                statValues.forEach(item => {
                    const finalText = item.innerText;
                    const numericValue = parseInt(finalText.replace(/\D/g, ''));
                    const suffix = finalText.replace(/[0-9]/g, '');

                    if (isNaN(numericValue)) return;

                    let currentValue = 0;
                    const duration = 2000;
                    const increment = Math.ceil(numericValue / (duration / 16));
                    const startTime = performance.now();

                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        currentValue = Math.round(eased * numericValue);

                        item.innerText = currentValue + suffix;

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            item.innerText = finalText;
                        }
                    }

                    requestAnimationFrame(updateCounter);
                });
            }
        }, { threshold: 0.3 });

        statsObserver.observe(statsSection);
    }
});
