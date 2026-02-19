document.addEventListener('DOMContentLoaded', () => {

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');

    function toggleMenu() {
        navLinks.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';

        // Change icon based on state
        const icon = menuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) toggleMenu();
        });
    }

    // Mobile Dropdown Accordion
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                // Prevent anchor jump for dropdown triggers on mobile
                e.preventDefault();
                e.stopPropagation();

                const container = trigger.closest('.dropdown-container');
                container.classList.toggle('active');
            }
        });
    });

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Skip for mobile dropdown triggers as they are handled above
            if (window.innerWidth <= 768 && this.classList.contains('dropdown-trigger')) return;

            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === 'javascript:void(0)') {
                e.preventDefault();
                return;
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                // Close menu if open
                if (navLinks.classList.contains('active')) toggleMenu();

                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll Reveal Animation (Slide Up)
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: "0px"
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Stats Counter Animation
    const statsSection = document.querySelector('.stats-section');
    const statsItems = document.querySelectorAll('.stat-item h3');
    let counted = false;

    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !counted) {
                statsItems.forEach(item => {
                    const targetText = item.innerText;
                    const targetValue = parseInt(targetText.replace(/\D/g, ''));
                    const suffix = targetText.replace(/[0-9]/g, '');

                    let startValue = 0;
                    let duration = 2000;
                    let counter = setInterval(() => {
                        startValue += Math.ceil(targetValue / (duration / 20));
                        if (startValue >= targetValue) {
                            item.innerText = targetValue + suffix;
                            clearInterval(counter);
                        } else {
                            item.innerText = startValue + suffix;
                        }
                    }, 20);
                });
                counted = true;
            }
        });
        statsObserver.observe(statsSection);
    }
});
