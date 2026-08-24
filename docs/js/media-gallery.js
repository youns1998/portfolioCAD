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

    const isValidPdfPage = (value) => {
        const page = Number(value);
        const hasPageValue = typeof value === "number"
            || (typeof value === "string" && value.trim() !== "");
        return hasPageValue && Number.isInteger(page) && page > 0;
    };

    const getFile = (item) => item.file || item.src || "";
    const getType = (item) => {
        const file = getFile(item).toLowerCase().split(/[?#]/)[0];
        return item.type || (file.endsWith(".pdf") ? "pdf" : "image");
    };

    const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const withTimeout = (promise, milliseconds = 10000) => new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error("PDF rendering timed out.")), milliseconds);
        promise.then((value) => {
            window.clearTimeout(timer);
            resolve(value);
        }, (error) => {
            window.clearTimeout(timer);
            reject(error);
        });
    });

    let viewerInstanceCount = 0;
    let activeViewerClose = null;

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") activeViewerClose?.();
    });

    const mount = (root, data = {}) => {
        if (!root) return () => {};
        root._mediaGalleryDestroy?.();

        const viewerTitleId = `media-viewer-title-${++viewerInstanceCount}`;
        const items = Array.isArray(data.items) ? data.items : [];
        const categories = (data.categories?.length ? data.categories : inferCategories(items)).map(normalizeCategory);
        const documentMode = data.layout === "document";
        let activeCategory = documentMode ? null : data.initialCategory || categories[0]?.id || null;
        let activeSubcategory = null;
        let activeItem = null;
        let lastFocusedElement = null;
        let viewerRenderId = 0;
        const observers = [];

        root.innerHTML = `
            <div class="media-browser${documentMode ? " media-browser-document" : ""}">
                <aside class="media-sidebar" aria-label="${escapeHtml(data.label || "Media")} navigation">
                    <h2 class="media-sidebar-title">${escapeHtml(data.label || "Media")}</h2>
                    <div class="media-filters"></div>
                </aside>
                <section class="media-content" aria-live="polite">
                    <div class="media-gallery${documentMode ? " media-document-stream" : ""}"></div>
                </section>
            </div>
            <div class="media-viewer" role="dialog" aria-modal="true" aria-labelledby="${viewerTitleId}" hidden>
                <div class="media-viewer-panel">
                    <div class="media-viewer-actions">
                        <button type="button" class="media-viewer-fullscreen">Fullscreen</button>
                        <button type="button" class="media-viewer-close" aria-label="Close viewer">&times;</button>
                    </div>
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
        const viewerPanel = root.querySelector(".media-viewer-panel");
        const stage = root.querySelector(".media-viewer-stage");
        const viewerTitle = root.querySelector(`#${viewerTitleId}`);
        const viewerDescription = root.querySelector(".media-viewer-description");
        const closeButton = root.querySelector(".media-viewer-close");
        const fullscreenButton = root.querySelector(".media-viewer-fullscreen");
        const mediaJobs = new WeakMap();

        const createPdfFrame = (item, className, titleSuffix = "preview") => {
            const frame = document.createElement("iframe");
            const pageFragment = isValidPdfPage(item.page) ? `#page=${Number(item.page)}&view=FitH` : "";
            frame.className = className;
            frame.src = `${getFile(item)}${pageFragment}`;
            frame.title = `${item.title || "Document"} ${titleSuffix}`;
            frame.loading = "lazy";
            return frame;
        };

        const renderPdfCanvas = async (item, container, placeholder, mode = "thumbnail") => {
            try {
                const renderer = window.PdfPageRenderer;
                if (!renderer) throw new Error("PDF page renderer is unavailable.");
                const options = {
                    maxWidth: container.clientWidth || (mode === "sheet" ? 1200 : 600),
                    maxHeight: container.clientHeight || (mode === "sheet" ? 850 : 424),
                    ariaLabel: `${item.title || "Drawing"} PDF page ${Number(item.page)}`
                };
                const renderPromise = mode === "sheet"
                    ? renderer.renderPdfPageToCanvas(getFile(item), item.page, { ...options, className: "pdf-sheet-canvas", maxPixelRatio: 1.75 })
                    : renderer.renderPdfThumbnail(getFile(item), item.page, options);
                const canvas = await withTimeout(renderPromise);

                if (!container.isConnected) return;
                container.prepend(canvas);
                placeholder.classList.remove("visible");
            } catch (error) {
                console.error(`Unable to render PDF page for ${item.id || item.title || "item"}.`, error);
                if (container.isConnected) {
                    if (mode === "sheet" && getFile(item)) {
                        const frame = createPdfFrame(item, "document-sheet-pdf", "PDF page preview");
                        frame.tabIndex = -1;
                        container.prepend(frame);
                        placeholder.classList.remove("visible");
                    } else {
                        placeholder.textContent = item.missingMessage || "PDF page unavailable";
                        placeholder.classList.add("visible");
                    }
                }
            }
        };

        const lazyObserver = "IntersectionObserver" in window
            ? new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    observer.unobserve(entry.target);
                    const job = mediaJobs.get(entry.target);
                    if (job) renderPdfCanvas(job.item, entry.target, job.placeholder, job.mode);
                });
            }, { rootMargin: "360px" })
            : null;
        if (lazyObserver) observers.push(lazyObserver);

        const closeViewer = () => {
            if (viewer.hidden) return;
            viewerRenderId += 1;
            viewer.hidden = true;
            viewer.classList.remove("active");
            stage.replaceChildren();
            document.body.style.overflow = "";
            if (document.fullscreenElement === viewerPanel) document.exitFullscreen?.();
            activeViewerClose = null;
            lastFocusedElement?.focus();
        };

        const showStageFallback = (item) => {
            stage.innerHTML = createEmptyState(
                "Media unavailable",
                item.missingMessage || "Add or correct this item's media file to display it here."
            );
        };

        const openViewer = (item, trigger) => {
            const renderId = ++viewerRenderId;
            lastFocusedElement = trigger;
            stage.replaceChildren();
            const file = getFile(item);
            const type = getType(item);
            const hasValidPage = isValidPdfPage(item.page);

            viewerTitle.textContent = item.number || item.drawingNumber
                ? `${item.number || item.drawingNumber} · ${item.title || "Untitled"}`
                : item.title || "Untitled";
            viewerDescription.textContent = item.description || "";
            viewer.hidden = false;
            viewer.classList.add("active");
            document.body.style.overflow = "hidden";
            activeViewerClose = closeViewer;
            closeButton.focus();

            if (!file) {
                showStageFallback(item);
            } else if (type === "pdf" && hasValidPage) {
                stage.innerHTML = createEmptyState("Loading drawing", "Rendering the selected PDF page.");
                const renderer = window.PdfPageRenderer;
                if (!renderer) {
                    showStageFallback(item);
                    return;
                }
                withTimeout(renderer.renderPdfViewer(file, item.page, {
                    maxWidth: stage.clientWidth || 1440,
                    maxHeight: stage.clientHeight || 900,
                    ariaLabel: `${item.title || "Drawing"} PDF page ${Number(item.page)}`
                })).then((canvas) => {
                    if (renderId !== viewerRenderId || viewer.hidden) return;
                    stage.replaceChildren(canvas);
                }).catch((error) => {
                    console.error(`Unable to render PDF page for ${item.id || item.title || "item"}.`, error);
                    if (renderId === viewerRenderId && !viewer.hidden) {
                        stage.replaceChildren(createPdfFrame(item, "media-viewer-pdf", "PDF viewer"));
                    }
                });
            } else if (type === "pdf") {
                stage.append(createPdfFrame(item, "media-viewer-pdf", "PDF viewer"));
            } else {
                const image = document.createElement("img");
                image.className = "media-viewer-image";
                image.src = file;
                image.alt = item.alt || item.title || "";
                image.addEventListener("error", () => showStageFallback(item), { once: true });
                stage.append(image);
            }
        };

        const setSidebarActive = (item) => {
            if (!item || item === activeItem) return;
            activeItem = item;
            filters.querySelectorAll("button").forEach((button) => {
                const sameCategory = button.dataset.category === item.category;
                const isSubcategory = Boolean(button.dataset.subcategory);
                const active = sameCategory && (!isSubcategory || button.dataset.subcategory === (item.subcategory || ""));
                button.classList.toggle("active", active);
                if (active && (isSubcategory || !item.subcategory)) button.setAttribute("aria-current", "location");
                else button.removeAttribute("aria-current");
            });
        };

        const findTargetItem = (category, subcategory) => items.find((item) =>
            item.category === category && (!subcategory || item.subcategory === subcategory));

        const navigateToItem = (item) => {
            const target = item && document.getElementById(item.id);
            if (!target) return;
            target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
            const route = decodeURIComponent(location.hash.slice(1)).split("/")[0];
            if (route) history.replaceState(null, "", `#${encodeURIComponent(route)}/${encodeURIComponent(item.id)}`);
            setSidebarActive(item);
        };

        const renderFilters = () => {
            if (!categories.length) {
                filters.innerHTML = `<p class="media-filter-empty">Categories appear here when content is added.</p>`;
                return;
            }

            filters.innerHTML = `<ul class="media-filter-list">${categories.map((category) => `
                <li>
                    <button type="button" data-category="${escapeHtml(category.id)}"${!documentMode && category.id === activeCategory && !activeSubcategory ? ' class="active"' : ""}>${escapeHtml(category.label)}</button>
                    ${category.subcategories?.length ? `<ul class="media-filter-sublist">${category.subcategories.map((subcategory) => {
                        const entry = typeof subcategory === "string" ? { id: subcategory, label: subcategory } : subcategory;
                        return `<li><button type="button" data-category="${escapeHtml(category.id)}" data-subcategory="${escapeHtml(entry.id)}"${!documentMode && category.id === activeCategory && entry.id === activeSubcategory ? ' class="active"' : ""}>${escapeHtml(entry.label)}</button></li>`;
                    }).join("")}</ul>` : ""}
                </li>
            `).join("")}</ul>`;

            filters.querySelectorAll("button").forEach((button) => {
                button.addEventListener("click", () => {
                    const category = button.dataset.category;
                    const subcategory = button.dataset.subcategory || null;
                    if (documentMode) {
                        navigateToItem(findTargetItem(category, subcategory));
                    } else {
                        activeCategory = category;
                        activeSubcategory = subcategory;
                        renderFilters();
                        renderGalleryItems();
                    }
                });
            });
        };

        const attachMedia = (item, container, placeholder, mode) => {
            const file = getFile(item);
            const type = getType(item);
            const thumbnail = item.thumbnail || (type === "pdf" ? "" : file);

            if (thumbnail) {
                const image = document.createElement("img");
                image.src = thumbnail;
                image.alt = item.alt || item.title || "";
                image.loading = "lazy";
                image.addEventListener("load", () => placeholder.classList.remove("visible"), { once: true });
                image.addEventListener("error", () => {
                    image.remove();
                    placeholder.textContent = item.missingMessage || "Media unavailable";
                    placeholder.classList.add("visible");
                }, { once: true });
                container.prepend(image);
            } else if (type === "pdf" && isValidPdfPage(item.page)) {
                if (lazyObserver) {
                    mediaJobs.set(container, { item, placeholder, mode });
                    lazyObserver.observe(container);
                } else {
                    renderPdfCanvas(item, container, placeholder, mode);
                }
            } else if (type === "pdf" && file && mode === "sheet") {
                const frame = createPdfFrame(item, "document-sheet-pdf", "preview");
                frame.tabIndex = -1;
                frame.addEventListener("load", () => placeholder.classList.remove("visible"), { once: true });
                container.prepend(frame);
            }
        };

        const createGalleryCard = (item) => {
            const card = document.createElement("article");
            card.className = "media-card";
            card.innerHTML = `
                <button type="button" class="media-card-open" aria-label="Open ${escapeHtml(item.title || "media")}">
                    <span class="media-thumbnail">
                        <span class="media-placeholder visible">${escapeHtml(getType(item) === "pdf" ? "PDF" : item.title || "Media unavailable")}</span>
                    </span>
                    <span class="media-card-body">
                        <strong>${escapeHtml(item.title || "Untitled")}</strong>
                        ${item.description ? `<span>${escapeHtml(item.description)}</span>` : ""}
                    </span>
                </button>`;
            const media = card.querySelector(".media-thumbnail");
            attachMedia(item, media, card.querySelector(".media-placeholder"), "thumbnail");
            const trigger = card.querySelector("button");
            trigger.addEventListener("click", () => openViewer(item, trigger));
            return card;
        };

        const createDocumentSheet = (item, index) => {
            const sheet = document.createElement("article");
            const isExample = item.demo === true || String(item.id || "").startsWith("example-");
            sheet.className = `document-sheet${isExample ? " document-sheet-example" : ""}`;
            sheet.id = item.id || `media-item-${index + 1}`;
            sheet.dataset.category = item.category || "";
            sheet.dataset.subcategory = item.subcategory || "";
            sheet.innerHTML = `
                <header class="document-sheet-header">
                    <p class="document-sheet-number">${escapeHtml(item.drawingNumber || item.number || String(index + 1).padStart(2, "0"))}</p>
                    <div>
                        <h2>${escapeHtml(item.title || "Untitled")}</h2>
                        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
                        ${isExample ? '<span class="document-sheet-test-label">Local interface test · not portfolio work</span>' : ""}
                    </div>
                </header>
                <div class="document-sheet-media">
                    <span class="media-placeholder visible">${escapeHtml(getType(item) === "pdf" ? "Loading PDF sheet" : item.title || "Media unavailable")}</span>
                    <button type="button" class="document-sheet-open" aria-label="Inspect ${escapeHtml(item.title || "drawing")}"></button>
                </div>`;
            const media = sheet.querySelector(".document-sheet-media");
            attachMedia(item, media, sheet.querySelector(".media-placeholder"), "sheet");
            const trigger = sheet.querySelector(".document-sheet-open");
            trigger.addEventListener("click", () => openViewer(item, trigger));
            return sheet;
        };

        const renderGalleryItems = () => {
            lazyObserver?.disconnect();
            const filtered = activeCategory
                ? items.filter((item) => item.category === activeCategory && (!activeSubcategory || item.subcategory === activeSubcategory))
                : items;
            if (!filtered.length) {
                gallery.innerHTML = createEmptyState(data.emptyTitle || "Content coming soon", data.emptyMessage || "This template is ready for project media.");
                return;
            }
            gallery.replaceChildren(...filtered.map(createGalleryCard));
        };

        const renderDocumentItems = () => {
            if (!items.length) {
                gallery.innerHTML = createEmptyState(data.emptyTitle || "Content coming soon", data.emptyMessage || "This template is ready for project media.");
                return;
            }
            const sheets = items.map(createDocumentSheet);
            gallery.replaceChildren(...sheets);
            const spy = "IntersectionObserver" in window
                ? new IntersectionObserver((entries) => {
                    const visible = entries.filter((entry) => entry.isIntersecting)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                    const item = visible[0] && items.find((entry) => entry.id === visible[0].target.id);
                    if (item) setSidebarActive(item);
                }, { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.15, 0.5, 0.85] })
                : null;
            if (spy) {
                observers.push(spy);
                sheets.forEach((sheet) => spy.observe(sheet));
            } else {
                setSidebarActive(items[0]);
            }
            setSidebarActive(items[0]);
        };

        closeButton.addEventListener("click", closeViewer);
        fullscreenButton.addEventListener("click", () => viewerPanel.requestFullscreen?.());
        viewer.addEventListener("click", (event) => {
            if (event.target === viewer) closeViewer();
        });

        renderFilters();
        if (documentMode) renderDocumentItems();
        else renderGalleryItems();

        const destroy = () => {
            observers.forEach((observer) => observer.disconnect());
            if (!viewer.hidden) closeViewer();
        };
        root._mediaGalleryDestroy = destroy;
        return destroy;
    };

    window.MediaGallery = { mount };
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("[data-media-gallery]").forEach((root) => {
            mount(root, window[root.dataset.mediaGallery]);
        });
    });
})();
