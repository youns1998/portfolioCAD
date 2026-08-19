document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("nav button");
    const sections = document.querySelectorAll(".section");
    const progressBar = document.createElement("div");
    progressBar.className = "scroll-progress";
    document.body.appendChild(progressBar);

    let isScrolling = false;
    let currentSectionIndex = 0;
    let lastScrollTime = Date.now();
    const scrollCooldown = 800;

    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'section-transition-overlay';
    document.body.appendChild(transitionOverlay);

    const initSections = () => {
        sections.forEach((section, index) => {
            section.style.zIndex = index === 0 ? 2 : 1;
            section.classList.toggle("active", index === 0);
            section.classList.toggle("inactive", index !== 0);
            section.style.opacity = index === 0 ? "1" : "0";
            section.style.visibility = index === 0 ? "visible" : "hidden";
        });

        // 배경색 어둡게 조정하기
        document.body.style.backgroundColor = "#e5e6ea";
    };

    const scrollToSection = (index) => {
        if (typeof index === 'string') {
            const targetSection = document.getElementById(index);
            if (!targetSection) return;
            index = Array.from(sections).indexOf(targetSection);
        }
        if (index < 0 || index >= sections.length || isScrolling) return;

        isScrolling = true;
        currentSectionIndex = index;
        document.body.classList.add('is-changing');
        transitionOverlay.classList.add('active');

        sections.forEach((section, idx) => {
            const isActive = idx === index;
            section.classList.toggle("active", isActive);
            section.classList.toggle("inactive", !isActive);
            section.style.zIndex = isActive ? 2 : 1;
            section.style.opacity = isActive ? "1" : "0";
            section.style.visibility = isActive ? "visible" : "hidden";
        });

        sections[index].scrollIntoView({ behavior: "smooth", block: "start" });

        setTimeout(() => {
            transitionOverlay.classList.remove('active');
            document.body.classList.remove('is-changing');
            isScrolling = false;
            updateNavButtons();
        }, 500);
    };

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.dataset.target;
            const index = Array.from(sections).findIndex(s => s.id === targetId);
            scrollToSection(index);
        });
    });

    const updateScrollProgress = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const value = (scrollY / max) * 100;
        progressBar.style.width = `${value}%`;
    };

    const wheelHandler = (e) => {
        if (isScrolling || Date.now() - lastScrollTime < scrollCooldown) return;

        const direction = e.deltaY > 0 ? 1 : -1;
        scrollToSection(currentSectionIndex + direction);
        lastScrollTime = Date.now();
    };

    const checkAnimatedElements = () => {
        document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    };

    const createIndicator = () => {
        const indicator = document.createElement("div");
        indicator.className = "section-indicator";

        sections.forEach((section, index) => {
            const dot = document.createElement("div");
            dot.className = "indicator-dot";
            dot.dataset.index = index;
            dot.dataset.label = section.id;
            dot.addEventListener("click", () => scrollToSection(index));
            indicator.appendChild(dot);
        });

        document.body.appendChild(indicator);
    };

    const createNavButtons = () => {
        const nav = document.createElement("div");
        nav.className = "nav-buttons";

        const topBtn = document.createElement("button");
        topBtn.className = "top-button hidden";
        topBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        topBtn.onclick = () => scrollToSection(currentSectionIndex - 1);

        const downBtn = document.createElement("button");
        downBtn.className = "down-button";
        downBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
        downBtn.onclick = () => scrollToSection(currentSectionIndex + 1);

        nav.appendChild(topBtn);
        nav.appendChild(downBtn);
        document.body.appendChild(nav);
        return { topBtn, downBtn };
    };

    const updateIndicator = () => {
        document.querySelectorAll(".indicator-dot").forEach((dot, index) => {
            dot.classList.toggle("active", index === currentSectionIndex);
        });
    };

    const { topBtn, downBtn } = createNavButtons();

    const updateNavButtons = () => {
        topBtn.classList.toggle("hidden", currentSectionIndex === 0);
        downBtn.classList.toggle("hidden", currentSectionIndex === sections.length - 1);
        updateIndicator();
    };

    const toggleTopButton = () => {
        document.querySelector('.top-button')?.classList.toggle('hidden', scrollY <= 200);
    };

    const init = () => {
        initSections();
        createIndicator();
        updateNavButtons();
        checkAnimatedElements();
        scrollToSection(0);
    };

    window.addEventListener("scroll", () => {
        updateScrollProgress();
        checkAnimatedElements();
        toggleTopButton();
    }, { passive: true });

    window.addEventListener("wheel", wheelHandler, { passive: true });

    document.addEventListener("mousemove", (e) => {
        document.documentElement.style.setProperty("--mouse-x", `${(e.clientX / innerWidth) * 100}%`);
        document.documentElement.style.setProperty("--mouse-y", `${(e.clientY / innerHeight) * 100}%`);
    });

    init();
});