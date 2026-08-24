document.addEventListener("DOMContentLoaded", () => {
    const animatedElements = [...document.querySelectorAll(".animate-on-scroll")];
    const sections = [...document.querySelectorAll("#home, .site-content > .section")];
    const navigationLinks = [...document.querySelectorAll(
        '#home nav a[href^="#"], .site-nav a[href^="#"]'
    )];
    const sectionIds = new Set(sections.map((section) => section.id));
    let activeSectionId = "";

    const revealElement = (element) => element.classList.add("visible");
    const revealVisibleElements = () => {
        animatedElements.forEach((element) => {
            const bounds = element.getBoundingClientRect();
            if (bounds.bottom > 0 && bounds.top < window.innerHeight) revealElement(element);
        });
    };

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                revealElement(entry.target);
                observer.unobserve(entry.target);
            });
        }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

        animatedElements.forEach((element) => revealObserver.observe(element));
    } else {
        animatedElements.forEach(revealElement);
    }

    const setActiveSection = (sectionId) => {
        if (!sectionIds.has(sectionId) || sectionId === activeSectionId) return;
        activeSectionId = sectionId;

        sections.forEach((section) => {
            section.classList.toggle("is-active-section", section.id === sectionId && section.id !== "home");
        });

        navigationLinks.forEach((link) => {
            const active = link.hash === `#${sectionId}`;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
        });
    };

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => setActiveSection(link.hash.slice(1)));
    });

    const initialHash = decodeURIComponent(location.hash.slice(1));
    const initialSectionId = sectionIds.has(initialHash) ? initialHash : "home";
    setActiveSection(initialSectionId);
    if (initialSectionId !== "home") {
        const initialSection = document.getElementById(initialSectionId);
        if (initialSection) {
            const sectionTop = initialSection.getBoundingClientRect().top + window.scrollY;
            const previousScrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = "auto";
            window.scrollTo(0, Math.max(0, sectionTop - 68));
            requestAnimationFrame(() => {
                document.documentElement.style.scrollBehavior = previousScrollBehavior;
                requestAnimationFrame(revealVisibleElements);
            });
        }
    }

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(() => {
            const focusLine = window.innerHeight * 0.4;
            const activeSection = sections.find((section) => {
                const bounds = section.getBoundingClientRect();
                return bounds.top <= focusLine && bounds.bottom >= focusLine;
            });

            if (activeSection) setActiveSection(activeSection.id);
        }, {
            rootMargin: "-32% 0px -55% 0px",
            threshold: [0, 0.01]
        });

        sections.forEach((section) => sectionObserver.observe(section));
    }

    window.addEventListener("hashchange", () => {
        const sectionId = decodeURIComponent(location.hash.slice(1));
        if (sectionIds.has(sectionId)) setActiveSection(sectionId);
    });
});
