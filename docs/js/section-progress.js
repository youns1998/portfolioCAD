(function () {
    const normalizeSections = (root, sections) => (sections || [])
        .map((entry) => {
            const element = entry instanceof Element ? entry : entry?.element;
            if (!element?.id || element.hidden) return null;
            const heading = element.querySelector("[data-progress-heading], h1, h2");
            return {
                element,
                id: element.id,
                label: entry?.label || element.dataset.progressLabel || heading?.textContent?.trim() || element.id
            };
        })
        .filter(Boolean)
        .filter((entry, index, entries) => entries.findIndex((candidate) => candidate.id === entry.id) === index)
        .filter((entry) => root === document || root.contains(entry.element));

    const getHashSection = () => decodeURIComponent(location.hash.slice(1)).split("/")[0];

    const init = ({ root = document, sections, label = "Section progress", onChange } = {}) => {
        const entries = normalizeSections(root, sections);
        if (!entries.length) return null;

        root.querySelector("[data-section-progress]")?.remove();
        const nav = document.createElement("nav");
        nav.className = "section-progress";
        nav.dataset.sectionProgress = "";
        nav.setAttribute("aria-label", label);
        nav.style.setProperty("--section-progress", "0");
        nav.innerHTML = `
            <p class="section-progress-current" aria-live="polite"></p>
            <div class="section-progress-rail" aria-hidden="true"><span></span></div>
            <ol class="section-progress-list">
                ${entries.map((entry) => `
                    <li>
                        <a href="#${encodeURIComponent(entry.id)}" data-progress-target="${entry.id}">
                            <span class="section-progress-dot" aria-hidden="true"></span>
                            <span class="section-progress-label"></span>
                        </a>
                    </li>
                `).join("")}
            </ol>
        `;

        [...nav.querySelectorAll("[data-progress-target]")].forEach((link, index) => {
            link.querySelector(".section-progress-label").textContent = entries[index].label;
            link.setAttribute("aria-label", `${entries[index].label} 섹션으로 이동`);
        });
        document.body.append(nav);

        let activeId = "";
        let frame = 0;
        const setActive = (id) => {
            const index = entries.findIndex((entry) => entry.id === id);
            if (index < 0 || id === activeId) return;
            activeId = id;
            nav.style.setProperty("--section-progress", entries.length === 1 ? "1" : String(index / (entries.length - 1)));
            nav.querySelector(".section-progress-current").textContent = entries[index].label;

            entries.forEach((entry) => entry.element.classList.toggle("is-progress-active", entry.id === id));
            nav.querySelectorAll("[data-progress-target]").forEach((link) => {
                const active = link.dataset.progressTarget === id;
                link.classList.toggle("is-active", active);
                if (active) link.setAttribute("aria-current", "location");
                else link.removeAttribute("aria-current");
            });
            onChange?.(id, entries[index].element);
        };

        const findActive = () => {
            frame = 0;
            const focusLine = window.innerHeight * 0.38;
            const containing = entries.find(({ element }) => {
                const bounds = element.getBoundingClientRect();
                return bounds.top <= focusLine && bounds.bottom >= focusLine;
            });
            if (containing) return setActive(containing.id);

            const nearest = entries.reduce((best, entry) => {
                const distance = Math.abs(entry.element.getBoundingClientRect().top - focusLine);
                return !best || distance < best.distance ? { entry, distance } : best;
            }, null);
            if (nearest) setActive(nearest.entry.id);
        };
        const scheduleFindActive = () => {
            if (!frame) frame = requestAnimationFrame(findActive);
        };

        let observer = null;
        if ("IntersectionObserver" in window) {
            observer = new IntersectionObserver(scheduleFindActive, {
                rootMargin: "-28% 0px -58% 0px",
                threshold: [0, 0.01]
            });
            entries.forEach(({ element }) => observer.observe(element));
        } else {
            window.addEventListener("scroll", scheduleFindActive, { passive: true });
        }
        window.addEventListener("resize", scheduleFindActive, { passive: true });
        window.addEventListener("hashchange", scheduleFindActive);

        const requestedId = getHashSection();
        setActive(entries.some((entry) => entry.id === requestedId) ? requestedId : entries[0].id);
        scheduleFindActive();

        return {
            destroy() {
                observer?.disconnect();
                cancelAnimationFrame(frame);
                window.removeEventListener("scroll", scheduleFindActive);
                window.removeEventListener("resize", scheduleFindActive);
                window.removeEventListener("hashchange", scheduleFindActive);
                nav.remove();
                entries.forEach(({ element }) => element.classList.remove("is-progress-active"));
            },
            setActive
        };
    };

    window.SectionProgress = { init };
})();
