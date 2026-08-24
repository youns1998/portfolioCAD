(function () {
    const escapeHtml = (value = "") => String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const normalizeCategory = (category) => typeof category === "string"
        ? { id: category, label: category, subcategories: [] }
        : { subcategories: [], ...category };

    const inferCategories = (items) => [...new Set(items.map((item) => item.category).filter(Boolean))]
        .map((category) => ({ id: category, label: category, subcategories: [] }));

    const createEmptyState = (title, message) => `
        <div class="content-empty-state" role="status">
            <p class="content-empty-state-title">${escapeHtml(title)}</p>
            <p>${escapeHtml(message)}</p>
        </div>
    `;

    let viewerInstanceCount = 0;

    const mount = (root, data) => {
        if (!root || !data) return;

        const viewerTitleId = `media-viewer-title-${++viewerInstanceCount}`;
        const items = Array.isArray(data.items) ? data.items : [];
        const categories = (data.categories?.length ? data.categories : inferCategories(items)).map(normalizeCategory);
        let activeCategory = data.initialCategory || categories[0]?.id || null;
        let activeSubcategory = null;
        let lastFocusedElement = null;

        root.innerHTML = `
            <div class="media-browser">
                <aside class="media-sidebar" aria-label="${escapeHtml(data.label || "Media")} filters">
                    <h2 class="media-sidebar-title">${escapeHtml(data.label || "Media")}</h2>
                    <div class="media-filters"></div>
                </aside>
                <section class="media-content" aria-live="polite">
                    <div class="media-gallery"></div>
                </section>
            </div>
            <div class="media-viewer" role="dialog" aria-modal="true" aria-labelledby="${viewerTitleId}" hidden>
                <div class="media-viewer-panel">
                    <button type="button" class="media-viewer-close" aria-label="Close viewer">&times;</button>
                    <div class="media-viewer-stage"></div>
                    <div class="media-viewer-info">
                        <h2 id="${viewerTitleId}"></h2>
                        <p class="media-viewer-description"></p>
                    </div>
                </div>
            </div>
        `;

        const filters = root.querySelector(".media-filters");
        const gallery = root.querySelector(".media-gallery");
        const viewer = root.querySelector(".media-viewer");
        const stage = root.querySelector(".media-viewer-stage");
        const viewerTitle = root.querySelector(`#${viewerTitleId}`);
        const viewerDescription = root.querySelector(".media-viewer-description");
        const closeButton = root.querySelector(".media-viewer-close");

        const closeViewer = () => {
            viewer.hidden = true;
            viewer.classList.remove("active");
            stage.replaceChildren();
            document.body.style.overflow = "";
            lastFocusedElement?.focus();
        };

        const showStageFallback = (item) => {
            stage.innerHTML = createEmptyState(
                "Media unavailable",
                item.missingMessage || "Add or correct this item's media file to display it here."
            );
        };

        const openViewer = (item, trigger) => {
            lastFocusedElement = trigger;
            stage.replaceChildren();
            const file = item.file || item.src;
            const type = item.type || (file && file.toLowerCase().split(/[?#]/)[0].endsWith(".pdf") ? "pdf" : "image");

            if (!file) {
                showStageFallback(item);
            } else if (type === "pdf") {
                const frame = document.createElement("iframe");
                frame.className = "media-viewer-pdf";
                frame.src = file;
                frame.title = `${item.title || "Document"} PDF viewer`;
                stage.append(frame);
            } else {
                const image = document.createElement("img");
                image.className = "media-viewer-image";
                image.src = file;
                image.alt = item.alt || item.title || "";
                image.addEventListener("error", () => showStageFallback(item), { once: true });
                stage.append(image);
            }

            viewerTitle.textContent = item.number || item.drawingNumber
                ? `${item.number || item.drawingNumber} · ${item.title || "Untitled"}`
                : item.title || "Untitled";
            viewerDescription.textContent = item.description || "";
            viewer.hidden = false;
            viewer.classList.add("active");
            document.body.style.overflow = "hidden";
            closeButton.focus();
        };

        const renderFilters = () => {
            if (!categories.length) {
                filters.innerHTML = `<p class="media-filter-empty">Categories appear here when content is added.</p>`;
                return;
            }

            filters.innerHTML = `<ul class="media-filter-list">${categories.map((category) => `
                <li>
                    <button type="button" data-category="${escapeHtml(category.id)}" class="${category.id === activeCategory && !activeSubcategory ? "active" : ""}">${escapeHtml(category.label)}</button>
                    ${category.subcategories?.length ? `<ul class="media-filter-sublist">${category.subcategories.map((subcategory) => {
                        const entry = typeof subcategory === "string" ? { id: subcategory, label: subcategory } : subcategory;
                        return `<li><button type="button" data-category="${escapeHtml(category.id)}" data-subcategory="${escapeHtml(entry.id)}" class="${category.id === activeCategory && entry.id === activeSubcategory ? "active" : ""}">${escapeHtml(entry.label)}</button></li>`;
                    }).join("")}</ul>` : ""}
                </li>
            `).join("")}</ul>`;

            filters.querySelectorAll("button").forEach((button) => {
                button.addEventListener("click", () => {
                    activeCategory = button.dataset.category;
                    activeSubcategory = button.dataset.subcategory || null;
                    renderFilters();
                    renderItems();
                });
            });
        };

        const renderItems = () => {
            const filtered = activeCategory
                ? items.filter((item) => item.category === activeCategory && (!activeSubcategory || item.subcategory === activeSubcategory))
                : items;

            if (!filtered.length) {
                gallery.innerHTML = createEmptyState(
                    data.emptyTitle || "Content coming soon",
                    data.emptyMessage || "This template is ready for project media."
                );
                return;
            }

            gallery.innerHTML = "";
            filtered.forEach((item) => {
                const card = document.createElement("article");
                card.className = "media-card";
                const thumbnail = item.thumbnail || (item.type === "pdf" ? "" : item.file || item.src || "");
                card.innerHTML = `
                    <button type="button" class="media-card-open" aria-label="Open ${escapeHtml(item.title || "media")}">
                        <span class="media-thumbnail">
                            ${thumbnail ? `<img src="${escapeHtml(thumbnail)}" alt="${escapeHtml(item.alt || item.title || "")}">` : ""}
                            <span class="media-placeholder${thumbnail ? "" : " visible"}">${escapeHtml(item.type === "pdf" ? "PDF" : item.title || "Media unavailable")}</span>
                        </span>
                        <span class="media-card-body">
                            <strong>${escapeHtml(item.title || "Untitled")}</strong>
                            ${item.description ? `<span>${escapeHtml(item.description)}</span>` : ""}
                        </span>
                    </button>
                `;

                const thumbnailImage = card.querySelector("img");
                thumbnailImage?.addEventListener("error", () => {
                    thumbnailImage.hidden = true;
                    card.querySelector(".media-placeholder").classList.add("visible");
                }, { once: true });

                const trigger = card.querySelector("button");
                trigger.addEventListener("click", () => openViewer(item, trigger));
                gallery.append(card);
            });
        };

        closeButton.addEventListener("click", closeViewer);
        viewer.addEventListener("click", (event) => {
            if (event.target === viewer) closeViewer();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !viewer.hidden) closeViewer();
        });

        renderFilters();
        renderItems();
    };

    window.MediaGallery = { mount };
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("[data-media-gallery]").forEach((root) => {
            const data = window[root.dataset.mediaGallery];
            mount(root, data);
        });
    });
})();
