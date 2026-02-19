/**
 * TEKROK INC - Main Application JS
 * Handles: Mobile Menu, Navbar Scroll, Dropdown, Smooth Scroll, Reveal Animations, Stats Counter, Testimonial Carousel
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

    // Desktop: hover open/close
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
        handleNavScroll();
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
                    const startTime = performance.now();

                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
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

    // ===== TESTIMONIALS AUTO-SCROLL CAROUSEL (INFINITE LOOP) =====
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselDots = document.getElementById('carouselDots');

    if (carouselTrack && carouselDots) {
        let cards = Array.from(carouselTrack.children);
        const originalCount = cards.length;
        let cardWidth, cardsPerView;
        let currentIndex = 0;
        let autoPlayInterval;
        let isPaused = false;
        let isTransitioning = false;

        // Clone first few cards for infinite loop effect
        // We clone 3 because that's the max visible (desktop)
        const clonesNeeded = 3;
        for (let i = 0; i < clonesNeeded; i++) {
            const clone = cards[i].cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            carouselTrack.appendChild(clone);
        }

        // Re-query cards to include clones
        let allCards = Array.from(carouselTrack.children);

        function updateDimensions() {
            const gap = 28; // CSS gap
            if (window.innerWidth <= 768) cardsPerView = 1;
            else if (window.innerWidth <= 1024) cardsPerView = 2;
            else cardsPerView = 3;

            // Recalculate card width based on container width to be precise
            // (100% - (visible-1)*gap) / visible
            const containerWidth = carouselTrack.parentElement.offsetWidth;
            const availableWidth = containerWidth - ((cardsPerView - 1) * gap);
            const exactCardWidth = availableWidth / cardsPerView;

            // Apply specific width to all cards so math matches CSS
            allCards.forEach(card => {
                card.style.minWidth = `${exactCardWidth}px`;
                card.style.width = `${exactCardWidth}px`; // ensure no shrinking
            });

            cardWidth = exactCardWidth + gap;

            // Reset position without transition
            carouselTrack.style.transition = 'none';
            carouselTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

            // Build dots (only for original pages)
            buildDots();
        }

        function buildDots() {
            carouselDots.innerHTML = '';
            const totalPages = Math.ceil(originalCount / cardsPerView); // Just simple mapping for now
            // Actually, usually dots map 1:1 to groups or singles? 
            // Let's make dots map to 'starting index' groups? 
            // Simplest: Dot 1 = Index 0. Dot 2 = Index 1... if 1 card view.
            // If 3 card view, Dot 1 = Index 0, Dot 2 = Index 3? 
            // User likely wants "Pages".

            const dotCount = Math.ceil(originalCount / cardsPerView);
            // However, with infinite loop single-slide advance, do we want 1 dot per slide? 
            // Let's do 1 dot per Slide, but limiting count if too many?
            // "Pages" is better for behavior.

            // Let's do: Pagination based on Groups.
            // If 6 items, 3 view -> 2 dots. 
            // If logic advances by 1, active dot logic is tricky.
            // Let's stick to: Advance by 1, Dot matches 'Group' roughly?
            // "Professional" carousels often advance by 1.
            // Let's make dots correspond to n-th item being first. 
            // For 6 items, 6 dots.

            for (let i = 0; i < originalCount; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                if (i === currentIndex) dot.classList.add('active');

                dot.addEventListener('click', () => {
                    if (isTransitioning) return;
                    currentIndex = i;
                    moveToSlide(true);
                    resetAutoPlay();
                });

                carouselDots.appendChild(dot);
            }
        }

        function updateDots() {
            // Update active dot based on real index
            // If currentIndex >= originalCount (showing clone), it means logical index 0
            const logicalIndex = currentIndex >= originalCount ? 0 : currentIndex;

            const dots = carouselDots.querySelectorAll('.carousel-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === logicalIndex);
            });
        }

        function moveToSlide(animate = true) {
            if (!animate) {
                carouselTrack.style.transition = 'none';
                carouselTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
                return;
            }

            carouselTrack.style.transition = 'transform 0.5s ease-in-out';
            carouselTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            isTransitioning = true;

            updateDots();
        }

        carouselTrack.addEventListener('transitionend', () => {
            isTransitioning = false;
            // Infinite Loop Logic:
            // If we scrolled past the last original item (e.g. index == originalCount),
            // We are looking at the clones (which are copy of 0, 1, 2).
            // We instantly jump to index 0.
            if (currentIndex >= originalCount) {
                currentIndex = 0;
                moveToSlide(false); // Jump instantly
                updateDots(); // Ensure dot 0 is active
            }
        });

        function nextSlide() {
            if (isTransitioning) return;
            currentIndex++;
            moveToSlide(true);
        }

        function startAutoPlay() {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(() => {
                if (!isPaused) nextSlide();
            }, 3000);
        }

        function resetAutoPlay() {
            startAutoPlay();
        }

        // Pause on hover - REMOVED per user request
        // const section = document.querySelector('.testimonial-section');
        // section.addEventListener('mouseenter', () => isPaused = true);
        // section.addEventListener('mouseleave', () => isPaused = false);

        // Touch Swipe
        let touchStartX = 0;
        carouselTrack.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carouselTrack.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else {
                    // Prev slide logic
                    if (isTransitioning) return;
                    if (currentIndex === 0) {
                        // If at 0, jump to end (originalCount) instantly, then slide back?
                        // "Rewind" instantly to end clone position is harder. 
                        // Simple Prev: Stop at 0 or wrap via instant jump?
                        // For this implementation, stick to Next-Only infinite loop or simple prev.
                        currentIndex = Math.max(0, currentIndex - 1);
                        moveToSlide(true);
                    } else {
                        currentIndex--;
                        moveToSlide(true);
                    }
                }
                resetAutoPlay();
            }
        }, { passive: true });

        // Init
        window.addEventListener('resize', () => {
            updateDimensions();
            // Adjust index if needed? Keep it safe
            if (currentIndex > originalCount) currentIndex = 0;
            moveToSlide(false);
        });

        // Initial setup delay to ensure CSS applied
        setTimeout(() => {
            updateDimensions();
            startAutoPlay();
        }, 100);
    }
});
