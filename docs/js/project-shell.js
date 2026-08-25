(function () {
    const escapeHtml = (value = "") => String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const hasItems = (section) => Array.isArray(section?.items) && section.items.length > 0;

    const renderHeader = (header, config, sections, sitePath) => {
        if (!header) return;
        const links = sections.map((section) => `
            <a href="#${escapeHtml(section.id)}" data-project-route="${escapeHtml(section.id)}">${escapeHtml(section.label || section.title)}</a>
        `).join("");

        header.classList.add("project-header-continuous");
        header.innerHTML = `
            <div class="container-fluid project-header-inner">
                <a href="${escapeHtml(sitePath)}/index.html" class="project-brand">Youns Journey</a>
                <p class="project-context">${escapeHtml(config.label)}</p>
                <a href="${escapeHtml(sitePath)}/index.html#projects" class="project-back-link">← 포트폴리오</a>
                ${links ? `<nav class="project-nav" aria-label="${escapeHtml(config.label)} 목차">${links}</nav>` : ""}
            </div>
        `;
    };

    const updateHeaderState = (header, activeSection) => {
        header?.querySelectorAll("[data-project-route]").forEach((link) => {
            const active = link.dataset.projectRoute === activeSection;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
        });
    };

    const createOverview = (config, hasPublicContent) => {
        const overview = config.overview || {};
        const facts = (Array.isArray(overview.facts) ? overview.facts : []).filter((fact) => {
            const value = String(fact?.value || "").trim();
            return fact?.label && value && value.toLowerCase() !== "not provided";
        });
        const summary = (Array.isArray(overview.summary) ? overview.summary : [overview.summary]).filter(Boolean);
        const scope = Array.isArray(overview.scope) ? overview.scope.filter(Boolean) : [];
        const hero = overview.hero;

        return `
            <section class="project-page-heading">
                <div class="container-fluid project-frame">
                    <p class="project-kicker">${escapeHtml(config.kicker || config.label || "Portfolio")}</p>
                    <h1 data-progress-heading>${escapeHtml(overview.title || config.label)}</h1>
                    ${overview.intro ? `<p class="project-intro">${escapeHtml(overview.intro)}</p>` : ""}
                </div>
            </section>
            ${hero ? `<section class="project-hero-section"><div class="container-fluid project-frame">
                <div class="project-hero-media">
                    <img src="${escapeHtml(hero)}" alt="${escapeHtml(overview.heroAlt || config.label)}" class="project-hero-image" data-image-fallback>
                    <div class="content-empty-state" data-fallback-message hidden>
                        <p class="content-empty-state-title">Hero image unavailable</p>
                        <p>등록된 hero 파일 경로를 확인해 주세요.</p>
                    </div>
                </div>
            </div></section>` : ""}
            ${(facts.length || summary.length || scope.length) ? `<section class="project-content-section"><div class="container-fluid project-frame">
                ${facts.length ? `<h2 class="project-section-title">Project Information</h2><dl class="project-facts">${facts.map((fact) => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`).join("")}</dl>` : ""}
                ${summary.length || scope.length ? `<div class="project-overview-details">
                    ${summary.length ? `<article class="project-overview-block"><h2>Project Summary</h2>${summary.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</article>` : ""}
                    ${scope.length ? `<article class="project-overview-block"><h2>Work Scope</h2><ul>${scope.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>` : ""}
                </div>` : ""}
            </div></section>` : ""}
            ${!hasPublicContent ? `<section class="project-content-section project-public-status"><div class="container-fluid project-frame">
                <p class="project-public-status-kicker">PUBLIC CONTENT STATUS</p>
                <h2>현재 공개 등록된 작품 미디어가 없습니다.</h2>
                <p>검증된 PDF 또는 이미지가 data에 등록되면 해당 섹션과 진행 표시가 자동으로 나타납니다. Private 자료는 공개 포트폴리오에 포함하지 않습니다.</p>
            </div></section>` : ""}
        `;
    };

    const createPortfolioSection = (section, index) => `
        <section id="${escapeHtml(section.id)}" class="project-portfolio-section${index % 2 ? " project-portfolio-section-neutral" : ""}" data-project-section>
            <div class="container-fluid project-frame">
                <header class="project-portfolio-heading" data-project-reveal>
                    <p class="project-portfolio-number">${String(index + 1).padStart(2, "0")}</p>
                    <div>
                        <p class="project-portfolio-eyebrow">${escapeHtml(section.eyebrow || section.label)}</p>
                        <h2 data-progress-heading>${escapeHtml(section.title || section.label)}</h2>
                        ${section.intro ? `<p>${escapeHtml(section.intro)}</p>` : ""}
                    </div>
                </header>
                <div data-portfolio-section-content="${escapeHtml(section.id)}"></div>
            </div>
        </section>
    `;

    const attachImageFallbacks = (root) => {
        root.querySelectorAll("[data-image-fallback]").forEach((image) => {
            image.addEventListener("error", () => {
                image.hidden = true;
                const fallback = image.nextElementSibling;
                if (fallback?.matches("[data-fallback-message]")) fallback.hidden = false;
            }, { once: true });
        });
    };

    const revealHeadings = (root) => {
        const targets = [...root.querySelectorAll("[data-project-reveal]")];
        if (!("IntersectionObserver" in window)) {
            targets.forEach((target) => target.classList.add("visible"));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            });
        }, { rootMargin: "0px 0px -10%", threshold: 0.08 });
        targets.forEach((target) => observer.observe(target));
    };

    const initNavigation = (header, sections, definitions) => {
        const setCurrent = (id) => updateHeaderState(header, id);
        header?.querySelectorAll("[data-project-route]").forEach((link) => {
            link.addEventListener("click", () => setCurrent(link.dataset.projectRoute));
        });

        const progress = window.SectionProgress?.init({
            sections: sections.map((element) => ({
                element,
                label: definitions.find((entry) => entry.id === element.id)?.label
            })),
            label: `${document.body.dataset.projectLabel || "포트폴리오"} 섹션 진행`,
            onChange: setCurrent
        });

        if (!progress && "IntersectionObserver" in window) {
            const observer = new IntersectionObserver(() => {
                const focusLine = window.innerHeight * 0.34;
                const active = sections.find((section) => {
                    const bounds = section.getBoundingClientRect();
                    return bounds.top <= focusLine && bounds.bottom >= focusLine;
                });
                setCurrent(active?.id || "");
            }, { rootMargin: "-24% 0px -68% 0px", threshold: [0, 0.01] });
            sections.forEach((section) => observer.observe(section));
        }

        const [sectionId, itemId] = decodeURIComponent(location.hash.slice(1)).split("/");
        if (!sections.some((section) => section.id === sectionId)) return;
        setCurrent(sectionId);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            document.getElementById(itemId || sectionId)?.scrollIntoView({ block: "start" });
        }));
    };

    const init = () => {
        const root = document.querySelector("[data-project-browser]");
        const config = window.projectConfig;
        if (!root || !config) return;

        const sitePath = document.body.dataset.sitePath || "../..";
        const contentSections = (Array.isArray(config.sections) ? config.sections : []).filter(hasItems);
        const storySections = [
            { id: "overview", label: "Overview" },
            ...contentSections.map((section) => ({ id: section.id, label: section.label || section.title }))
        ];
        const header = document.querySelector("[data-project-header]");
        renderHeader(header, config, storySections, sitePath);

        root.innerHTML = `
            <div id="overview" class="project-portfolio-overview" data-project-section data-progress-label="Overview">
                ${createOverview(config, contentSections.length > 0)}
            </div>
            ${contentSections.map(createPortfolioSection).join("")}
            <section class="project-portfolio-end" aria-label="포트폴리오 끝">
                <div class="container-fluid project-frame"><p>END</p><strong>${escapeHtml(config.label)}</strong></div>
            </section>
        `;

        root.querySelectorAll("[data-portfolio-section-content]").forEach((mountRoot) => {
            const section = contentSections.find((entry) => entry.id === mountRoot.dataset.portfolioSectionContent);
            if (section && window.MediaGallery) window.MediaGallery.mount(mountRoot, section);
        });

        attachImageFallbacks(root);
        revealHeadings(root);
        initNavigation(header, [...root.querySelectorAll("[data-project-section]")], storySections);
        document.title = `${config.label} | Youns Journey`;

        const footer = document.querySelector("[data-project-footer]");
        if (footer) footer.innerHTML = `<p class="mb-0">&copy; 2026 Youns Journey</p>`;
    };

    document.addEventListener("DOMContentLoaded", init);
})();
