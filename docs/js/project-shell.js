(function () {
    const escapeHtml = (value = "") => String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const fallbackPages = [
        { id: "overview", label: "Overview", file: "index.html" },
        { id: "drawings", label: "Drawings", file: "index.html#drawings" },
        { id: "bim", label: "BIM", file: "index.html#bim" },
        { id: "visualization", label: "Visualization", file: "index.html#visualization" },
        { id: "process", label: "Process", file: "index.html#process" }
    ];

    const resolveData = (source) => typeof source === "string" ? window[source] : source;
    const hasPageContent = (page) => {
        if (page.type === "overview") return true;
        const data = resolveData(page.data) || page.placeholderData;
        return Array.isArray(data?.items) && data.items.length > 0;
    };

    const getRoute = (pages) => {
        const requested = decodeURIComponent(location.hash.slice(1)).split("/")[0];
        return pages.some((page) => page.id === requested) ? requested : pages[0]?.id || "overview";
    };

    const getRouteTarget = () => decodeURIComponent(location.hash.slice(1)).split("/")[1] || "";

    const renderHeader = ({ header, pages, activePage, projectPath, sitePath, projectLabel, dynamic, continuous }) => {
        if (!header) return;
        const navigationPages = continuous
            ? pages.filter((page) => page.type !== "overview" && hasPageContent(page))
            : pages;
        const links = navigationPages.map((page) => {
            const active = page.id === activePage;
            const href = continuous || dynamic ? `#${page.id}` : `${projectPath}/${page.file || `index.html#${page.id}`}`;
            const currentValue = continuous ? "location" : "page";
            return `<a href="${escapeHtml(href)}" data-project-route="${escapeHtml(page.id)}"${active ? ` class="active" aria-current="${currentValue}"` : ""}>${escapeHtml(page.label)}</a>`;
        }).join("");

        header.classList.toggle("project-header-continuous", continuous);
        header.innerHTML = `
            <div class="container-fluid project-header-inner">
                <a href="${escapeHtml(sitePath)}/index.html" class="project-brand">Youns Journey</a>
                <p class="project-context">${escapeHtml(projectLabel)}</p>
                <a href="${escapeHtml(sitePath)}/index.html#projects" class="project-back-link">← 포트폴리오</a>
                ${links ? `<nav class="project-nav" aria-label="${escapeHtml(projectLabel)} 목차">${links}</nav>` : ""}
            </div>
        `;
    };

    const updateHeaderState = (header, activePage, currentValue = "page") => {
        header?.querySelectorAll("[data-project-route]").forEach((link) => {
            const active = link.dataset.projectRoute === activePage;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", currentValue);
            else link.removeAttribute("aria-current");
        });
    };

    const createHeading = (config, page) => `
        <section class="project-page-heading">
            <div class="container-fluid project-frame">
                <p class="project-kicker">${escapeHtml(config.kicker || config.label || "Portfolio")}</p>
                <h1>${escapeHtml(page.title || page.label)}</h1>
                ${page.intro ? `<p class="project-intro">${escapeHtml(page.intro)}</p>` : ""}
            </div>
        </section>
    `;

    const createOverview = (config, page) => {
        const overview = config.overview || {};
        const facts = (Array.isArray(overview.facts) ? overview.facts : []).filter((fact) => {
            const value = String(fact?.value || "").trim();
            return fact?.label && value && value.toLowerCase() !== "not provided";
        });
        const summary = (Array.isArray(overview.summary) ? overview.summary : [overview.summary]).filter(Boolean);
        const scope = Array.isArray(overview.scope) ? overview.scope.filter(Boolean) : [];
        const hero = overview.hero;
        const hasOverviewContent = facts.length || summary.length || scope.length;
        return `${createHeading(config, page)}
            ${hero ? `<section class="project-hero-section"><div class="container-fluid project-frame">
                <div class="project-hero-media">
                    <img src="${escapeHtml(hero)}" alt="${escapeHtml(overview.heroAlt || "Project hero")}" class="project-hero-image" data-image-fallback>
                    <div class="content-empty-state" data-fallback-message hidden>
                        <p class="content-empty-state-title">Hero image unavailable</p>
                        <p>Add a verified project hero at the configured path.</p>
                    </div>
                </div>
            </div></section>` : ""}
            <section class="project-content-section"><div class="container-fluid project-frame">
                <h2 class="project-section-title">Project Information</h2>
                ${facts.length ? `<dl class="project-facts">${facts.map((fact) => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`).join("")}</dl>` : ""}
                ${summary.length || scope.length ? `<div class="project-overview-details">
                    ${summary.length ? `<article class="project-overview-block"><h2>Project Summary</h2>${summary.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</article>` : ""}
                    ${scope.length ? `<article class="project-overview-block"><h2>Work Scope</h2><ul>${scope.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>` : ""}
                </div>` : ""}
                ${!hasOverviewContent ? `<div class="content-empty-state overview-empty-state">
                    <p class="content-empty-state-title">${escapeHtml(overview.emptyTitle || "Project content not added")}</p>
                    <p>${escapeHtml(overview.emptyMessage || "Add only verified project context, responsibilities, and outcomes here.")}</p>
                </div>` : ""}
            </div></section>`;
    };

    const mountPageContent = (root, page) => {
        const mountRoot = root.querySelector("[data-dynamic-content]");
        const data = resolveData(page.data);
        if (page.type === "media" && window.MediaGallery) {
            window.MediaGallery.mount(mountRoot, data || page.placeholderData || {});
        } else if (page.type === "content" && window.ContentTemplate) {
            window.ContentTemplate.mount(mountRoot, data || page.placeholderData || {});
        }
    };

    const renderDynamicPage = (root, config, page) => {
        root.querySelector("[data-dynamic-content]")?._mediaGalleryDestroy?.();
        if (page.type === "overview") {
            root.innerHTML = createOverview(config, page);
        } else {
            root.innerHTML = `${createHeading(config, page)}
                <section class="project-content-section">
                    <div class="container-fluid project-frame" data-dynamic-content></div>
                </section>`;
            mountPageContent(root, page);
        }

        root.querySelectorAll("[data-image-fallback]").forEach((image) => {
            image.addEventListener("error", () => {
                image.hidden = true;
                const fallback = image.nextElementSibling;
                if (fallback?.matches("[data-fallback-message]")) fallback.hidden = false;
            }, { once: true });
        });
    };

    const createContinuousSection = (page, index) => `
        <section id="${escapeHtml(page.id)}" class="project-portfolio-section${index % 2 ? " project-portfolio-section-neutral" : ""}" data-project-section>
            <div class="container-fluid project-frame">
                <header class="project-portfolio-heading" data-project-reveal>
                    <p class="project-portfolio-number">${String(index + 1).padStart(2, "0")}</p>
                    <div>
                        <p class="project-portfolio-eyebrow">${escapeHtml(page.eyebrow || page.label)}</p>
                        <h2>${escapeHtml(page.title || page.label)}</h2>
                        ${page.intro ? `<p>${escapeHtml(page.intro)}</p>` : ""}
                    </div>
                </header>
                <div data-continuous-content="${escapeHtml(page.id)}"></div>
            </div>
        </section>
    `;

    const renderContinuousPortfolio = (root, config, pages) => {
        const overviewPage = pages.find((page) => page.type === "overview") || pages[0];
        const contentPages = pages.filter((page) => page.type !== "overview" && hasPageContent(page));
        root.innerHTML = `
            <div id="overview" class="project-portfolio-overview" data-project-section>
                ${createOverview(config, overviewPage)}
            </div>
            ${contentPages.map(createContinuousSection).join("")}
            <section class="project-portfolio-end" aria-label="포트폴리오 끝">
                <div class="container-fluid project-frame">
                    <p>END</p>
                    <strong>${escapeHtml(config.label)}</strong>
                </div>
            </section>
        `;

        root.querySelectorAll("[data-continuous-content]").forEach((mountRoot) => {
            const page = contentPages.find((entry) => entry.id === mountRoot.dataset.continuousContent);
            const data = page && (resolveData(page.data) || page.placeholderData);
            if (page?.type === "media" && data && window.MediaGallery) {
                window.MediaGallery.mount(mountRoot, data);
            } else if (page?.type === "content" && data && window.ContentTemplate) {
                window.ContentTemplate.mount(mountRoot, data);
            }
        });

        root.querySelectorAll("[data-image-fallback]").forEach((image) => {
            image.addEventListener("error", () => {
                image.hidden = true;
                const fallback = image.nextElementSibling;
                if (fallback?.matches("[data-fallback-message]")) fallback.hidden = false;
            }, { once: true });
        });

        const revealTargets = [...root.querySelectorAll("[data-project-reveal]")];
        if ("IntersectionObserver" in window) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                });
            }, { rootMargin: "0px 0px -10%", threshold: 0.08 });
            revealTargets.forEach((target) => revealObserver.observe(target));
        } else {
            revealTargets.forEach((target) => target.classList.add("visible"));
        }

        return [...root.querySelectorAll("[data-project-section]")];
    };

    const initContinuousNavigation = (header, sections) => {
        const setCurrentSection = (sectionId) => updateHeaderState(header, sectionId, "location");
        header?.querySelectorAll("[data-project-route]").forEach((link) => {
            link.addEventListener("click", () => setCurrentSection(link.dataset.projectRoute));
        });

        if ("IntersectionObserver" in window) {
            const sectionObserver = new IntersectionObserver(() => {
                const focusLine = window.innerHeight * 0.34;
                const activeSection = sections.find((section) => {
                    const bounds = section.getBoundingClientRect();
                    return bounds.top <= focusLine && bounds.bottom >= focusLine;
                });
                setCurrentSection(activeSection?.id || "");
            }, { rootMargin: "-24% 0px -68% 0px", threshold: [0, 0.01] });
            sections.forEach((section) => sectionObserver.observe(section));
        }

        const requestedSection = decodeURIComponent(location.hash.slice(1));
        if (sections.some((section) => section.id === requestedSection)) {
            setCurrentSection(requestedSection);
            requestAnimationFrame(() => {
                document.getElementById(requestedSection)?.scrollIntoView({ block: "start" });
            });
        }
    };

    const init = () => {
        const body = document.body;
        const projectPath = body.dataset.projectPath || ".";
        const sitePath = body.dataset.sitePath || "../..";
        const dynamicRoot = document.querySelector("[data-project-browser]");
        const config = window.projectConfig;
        const dynamic = Boolean(dynamicRoot && config?.pages?.length);
        const pages = dynamic ? config.pages : fallbackPages;
        const continuous = Boolean(dynamic && config.layout === "continuous");
        const projectLabel = config?.label || body.dataset.projectLabel || "Project";
        const header = document.querySelector("[data-project-header]");
        let activePage = dynamic ? getRoute(pages) : (body.dataset.page === "automation" ? "process" : body.dataset.page || "overview");
        let renderedPage = "";

        renderHeader({ header, pages, activePage, projectPath, sitePath, projectLabel, dynamic, continuous });

        const renderRoute = () => {
            const route = getRoute(pages);
            const target = getRouteTarget();
            activePage = route;
            updateHeaderState(header, route);

            if (renderedPage !== route) {
                const page = pages.find((entry) => entry.id === route) || pages[0];
                dynamicRoot.classList.add("is-switching");
                renderDynamicPage(dynamicRoot, config, page);
                renderedPage = route;
                document.title = `${page.label} | ${config.label} | Youns Journey`;
                requestAnimationFrame(() => dynamicRoot.classList.remove("is-switching"));
                window.scrollTo({ top: 0, behavior: "auto" });
            }

            if (target) {
                const scrollToTarget = () => document.getElementById(target)?.scrollIntoView({ block: "start" });
                requestAnimationFrame(() => requestAnimationFrame(scrollToTarget));
                window.setTimeout(scrollToTarget, 250);
            }
        };

        if (continuous) {
            const continuousSections = renderContinuousPortfolio(dynamicRoot, config, pages);
            initContinuousNavigation(header, continuousSections);
            document.title = `${config.label} | Youns Journey`;
        } else if (dynamic) {
            renderRoute();
            window.addEventListener("hashchange", renderRoute);
        } else {
            document.querySelectorAll("[data-image-fallback]").forEach((image) => {
                image.addEventListener("error", () => {
                    image.hidden = true;
                    const fallback = image.nextElementSibling;
                    if (fallback?.matches("[data-fallback-message]")) fallback.hidden = false;
                }, { once: true });
            });
        }

        const footer = document.querySelector("[data-project-footer]");
        if (footer) footer.innerHTML = `<p class="mb-0">&copy; 2026 Youns Journey</p>`;
    };

    document.addEventListener("DOMContentLoaded", init);
})();
