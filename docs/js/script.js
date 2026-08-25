document.addEventListener("DOMContentLoaded", () => {
    const renderPortfolioPreviews = () => {
        document.querySelectorAll("[data-portfolio-project]").forEach((root) => {
            const project = window.portfolioProjects?.[root.dataset.portfolioProject];
            const mountRoot = root.querySelector("[data-portfolio-preview]");
            if (!project || !mountRoot) return;

            const limit = Number.isInteger(project.previewLimit) && project.previewLimit > 0 ? project.previewLimit : 3;
            const mediaEntries = (project.sections || []).flatMap((section) =>
                (section.items || []).map((item) => ({ item, section }))
            );
            const featuredItems = mediaEntries.filter(({ item }) => item.featured === true).slice(0, limit);

            mountRoot.replaceChildren();
            mountRoot.hidden = featuredItems.length === 0;
            featuredItems.forEach(({ item, section }) => {
                const article = document.createElement("article");
                article.className = "portfolio-featured-item";

                const media = document.createElement("div");
                media.className = "portfolio-featured-media";
                const mediaPath = item.thumbnail || (item.type === "image" ? item.file : "");
                if (mediaPath) {
                    const image = document.createElement("img");
                    image.src = `${project.homeBasePath || ""}${mediaPath}`;
                    image.alt = item.alt || item.title || "";
                    image.loading = "lazy";
                    image.addEventListener("error", () => {
                        image.remove();
                        media.textContent = String(item.type || "media").toUpperCase();
                        media.classList.add("portfolio-featured-media-fallback");
                    }, { once: true });
                    media.append(image);
                } else {
                    media.textContent = String(item.type || "media").toUpperCase();
                    media.classList.add("portfolio-featured-media-fallback");
                }

                const copy = document.createElement("div");
                const category = document.createElement("p");
                category.textContent = [section.label, item.category, item.subcategory].filter(Boolean).join(" / ");
                const title = document.createElement("strong");
                title.textContent = item.title || "Untitled";
                copy.append(category, title);
                article.append(media, copy);
                mountRoot.append(article);
            });

            const actionRoot = root.querySelector("[data-portfolio-action]");
            if (actionRoot && mediaEntries.length && project.homePath) {
                const link = document.createElement("a");
                link.className = "portfolio-more-link";
                link.href = project.homePath;
                link.innerHTML = '더 보기 <span aria-hidden="true">→</span>';
                actionRoot.replaceChildren(link);
            }
        });
    };

    renderPortfolioPreviews();

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

    const progressLabels = {
        home: "Home",
        about: "소개",
        skills: "기술 및 도구",
        projects: "포트폴리오",
        contact: "연락처"
    };
    const progress = window.SectionProgress?.init({
        sections: sections.map((element) => ({ element, label: progressLabels[element.id] })),
        label: "홈 섹션 진행",
        onChange: setActiveSection
    });

    if (!progress && "IntersectionObserver" in window) {
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
