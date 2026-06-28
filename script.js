document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. SCROLL SPY TRACKER
    // ==========================================
    const sections = document.querySelectorAll("header[id], section[id]");
    const navLinks = document.querySelectorAll(".nav-menu li a");

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute("id");
                navLinks.forEach((link) => {
                    const liElement = link.parentElement;
                    if (link.getAttribute("href") === `#${currentId}`) {
                        liElement.classList.add("active");
                    } else {
                        liElement.classList.remove("active");
                    }
                });
            }
        });
    }, { rootMargin: "-20% 0px -60% 0px" });

    sections.forEach((section) => scrollObserver.observe(section));

    // ==========================================
    // 2. HOMEPAGE TRACK CAROUSEL INTERACTION
    // ==========================================
    const track = document.getElementById("carouselTrack");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (track && prevBtn && nextBtn) {
        let currentIndex = 0;

        const updateSliderPosition = () => {
            const cards = document.querySelectorAll(".project-card");
            if (cards.length === 0) return;
            const totalCards = cards.length;
            const itemsPerView = window.innerWidth <= 768 ? 1 : 2;
            
            const maxIndex = totalCards - itemsPerView;
            if (currentIndex > maxIndex) currentIndex = maxIndex;
            if (currentIndex < 0) currentIndex = 0;

            const cardWidth = cards[0].getBoundingClientRect().width;
            const gap = 20; 
            const amountToMove = currentIndex * (cardWidth + gap);

            track.style.transform = `translateX(-${amountToMove}px)`;
        };

        nextBtn.addEventListener("click", () => {
            const cards = document.querySelectorAll(".project-card");
            const itemsPerView = window.innerWidth <= 768 ? 1 : 2;
            if (currentIndex < cards.length - itemsPerView) currentIndex++;
            else currentIndex = 0;
            updateSliderPosition();
        });

        prevBtn.addEventListener("click", () => {
            const cards = document.querySelectorAll(".project-card");
            const itemsPerView = window.innerWidth <= 768 ? 1 : 2;
            if (currentIndex > 0) currentIndex--;
            else currentIndex = cards.length - itemsPerView;
            updateSliderPosition();
        });

        window.addEventListener("resize", updateSliderPosition);
    }

    // ==========================================
    // 3. ZOOM LIGHTBOX CORE LOGIC
    // ==========================================
    const lightbox = document.getElementById("imageLightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const closeBtn = document.querySelector(".lightbox-close");

    let scale = 1, isDragging = false;
    let startX = 0, startY = 0, translateX = 0, translateY = 0;

    const setupLightboxTriggers = () => {
        const clickableImages = document.querySelectorAll("[data-popup-img]");
        clickableImages.forEach(item => {
            item.removeEventListener("click", triggerLightboxOpen);
            item.addEventListener("click", triggerLightboxOpen);
        });
    };

    function triggerLightboxOpen(e) {
        const targetSrc = e.currentTarget.getAttribute("data-popup-img");
        if (!targetSrc || targetSrc.includes("your-logo")) return;

        lightboxImg.src = targetSrc;
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
        resetZoom();
    }

    const closeLightbox = () => {
        if (lightbox) {
            lightbox.classList.remove("active");
            document.body.style.overflow = "";
            setTimeout(resetZoom, 300);
        }
    };

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (lightbox) {
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-wrapper')) closeLightbox();
        });
    }

    function resetZoom() {
        scale = 1; translateX = 0; translateY = 0;
        if (lightboxImg) {
            lightboxImg.style.transform = `translate(0px, 0px) scale(1)`;
            lightboxImg.classList.remove("zoomed");
        }
    }

    if (lightbox) {
        lightbox.addEventListener("wheel", (e) => {
            if (!lightboxImg || !lightbox.classList.contains("active")) return;
            e.preventDefault();
            scale += e.deltaY < 0 ? 0.12 : -0.12;
            scale = Math.max(1, Math.min(4, scale));

            if (scale > 1) lightboxImg.classList.add("zoomed");
            else { resetZoom(); return; }

            lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        }, { passive: false });
    }

    if (lightboxImg) {
        lightboxImg.addEventListener("mousedown", (e) => {
            if (scale === 1) return;
            isDragging = true;
            startX = e.clientX - translateX; startY = e.clientY - translateY;
            e.preventDefault();
        });
    }

    window.addEventListener("mousemove", (e) => {
        if (!isDragging || !lightboxImg) return;
        translateX = e.clientX - startX; translateY = e.clientY - startY;
        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    });

    window.addEventListener("mouseup", () => isDragging = false);

    // ==========================================
    // 4. CHRONO GALLERY REBUILD MATRIX (FILTER)
    // ==========================================
    const dropdown = document.getElementById("galleryDropdown");
    const gridContainer = document.querySelector(".gallery-page-grid");

    if (dropdown && gridContainer) {
        const selectedLabel = dropdown.querySelector(".dropdown-selected");
        const optionsList = dropdown.querySelectorAll(".dropdown-options li");
        const elementsArray = Array.from(gridContainer.children);

        dropdown.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("open");
        });

        document.addEventListener("click", () => {
            dropdown.classList.remove("open");
        });

        optionsList.forEach(option => {
            option.addEventListener("click", () => {
                const sortValue = option.getAttribute("data-value");
                
                selectedLabel.textContent = option.textContent;
                optionsList.forEach(opt => opt.classList.remove("active-opt"));
                option.classList.add("active-opt");

                gridContainer.innerHTML = "";

                if (sortValue === "newest") {
                    const reversed = [...elementsArray].reverse();
                    reversed.forEach(el => gridContainer.appendChild(el));
                } else {
                    elementsArray.forEach(el => gridContainer.appendChild(el));
                }
                
                setupLightboxTriggers();
            });
        });

        // Sets default sorting layout state to Newest first on screen rendering
        const initialReversed = [...elementsArray].reverse();
        gridContainer.innerHTML = "";
        initialReversed.forEach(el => gridContainer.appendChild(el));
    }

    setupLightboxTriggers();
});