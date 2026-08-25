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

    const normalizeSubcategory = (subcategory) => typeof subcategory === "string"
        ? { id: subcategory, label: subcategory }
        : subcategory;

    const uniqueValues = (values) => [...new Set(values.filter(Boolean))];
    const getFile = (item) => item.file || "";
    const getType = (item) => {
        const file = getFile(item).toLowerCase().split(/[?#]/)[0];
        return String(item.type || (file.endsWith(".pdf") ? "pdf" : "image")).toLowerCase();
    };

    const isValidPdfPage = (value) => {
        const page = Number(value);
        const supplied = typeof value === "number" || (typeof value === "string" && value.trim() !== "");
        return supplied && Number.isInteger(page) && page > 0;
    };

    const createEmptyState = (title, message) => `
        <div class="content-empty-state" role="status">
            <p class="content-empty-state-title">${escapeHtml(title)}</p>
            <p>${escapeHtml(message)}</p>
        </div>
    `;

    const buildNavigation = (items, configuredCategories = []) => {
        const configured = configuredCategories.map(normalizeCategory).filter((category) => category.id);
        const itemCategoryIds = uniqueValues(items.map((item) => item.category));
        const orderedCategoryIds = [
            ...configured.map((category) => category.id).filter((id) => itemCategoryIds.includes(id)),
            ...itemCategoryIds.filter((id) => !configured.some((category) => category.id === id))
        ];

        return orderedCategoryIds.map((id) => {
            const definition = configured.find((category) => category.id === id) || { id, label: id, subcategories: [] };
            const itemSubcategoryIds = uniqueValues(items.filter((item) => item.category === id).map((item) => item.subcategory));
            const configuredSubcategories = (definition.subcategories || []).map(normalizeSubcategory).filter(Boolean);
            const subcategoryIds = [
                ...configuredSubcategories.map((entry) => entry.id).filter((entryId) => itemSubcategoryIds.includes(entryId)),
                ...itemSubcategoryIds.filter((entryId) => !configuredSubcategories.some((entry) => entry.id === entryId))
            ];

            return {
                ...definition,
                subcategories: subcategoryIds.map((entryId) => configuredSubcategories.find((entry) => entry.id === entryId) || { id: entryId, label: entryId })
            };
        });
    };

    const getInitialItems = (items, requestedLimit) => {
        const parsedLimit = Number(requestedLimit);
        const limit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 8;
        if (items.length <= limit) return items;

        const selected = new Set();
        const categoryKeys = uniqueValues(items.map((item) => item.category || "__uncategorized__"));
        categoryKeys.forEach((category) => {
            if (selected.size >= limit) return;
            const item = items.find((entry) => (entry.category || "__uncategorized__") === category);
            if (item) selected.add(item);
        });
        items.filter((item) => item.featured === true).forEach((item) => {
            if (selected.size < limit) selected.add(item);
        });
        items.forEach((item) => {
            if (selected.size < limit) selected.add(item);
        });
        return items.filter((item) => selected.has(item));
    };

    const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const withTimeout = (promise, milliseconds = 30000) => new Promise((resolve, reject) => {
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

        const items = Array.isArray(data.items) ? data.items : [];
        const categories = buildNavigation(items, data.categories);
        const initialItems = getInitialItems(items, data.initialVisible);
        const viewerTitleId = `media-viewer-title-${++viewerInstanceCount}`;
        let expanded = initialItems.length === items.length;
        let activeItem = null;
        let lastFocusedElement = null;
        let viewerRenderId = 0;
        let scrollSpy = null;
        const observers = [];
        const mediaJobs = new WeakMap();

        root.innerHTML = `
            <div class="media-browser${categories.length ? "" : " media-browser-no-sidebar"}">
                ${categories.length ? `<aside class="media-sidebar" aria-label="${escapeHtml(data.label || data.title || "Media")} navigation">
                    <h2 class="media-sidebar-title">${escapeHtml(data.label || data.title || "Media")}</h2>
                    <div class="media-filters"></div>
                </aside>` : ""}
                <section class="media-content" aria-live="polite">
                    <div class="media-document-stream"></div>
                    <div class="media-detail-actions"></div>
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
        const stream = root.querySelector(".media-document-stream");
        const detailActions = root.querySelector(".media-detail-actions");
        const viewer = root.querySelector(".media-viewer");
        const viewerPanel = root.querySelector(".media-viewer-panel");
        const stage = root.querySelector(".media-viewer-stage");
        const viewerTitle = root.querySelector(`#${viewerTitleId}`);
        const viewerDescription = root.querySelector(".media-viewer-description");
        const closeButton = root.querySelector(".media-viewer-close");
        const fullscreenButton = root.querySelector(".media-viewer-fullscreen");

        const createPdfFrame = (item, className, titleSuffix = "preview") => {
            const frame = document.createElement("iframe");
            const pageFragment = isValidPdfPage(item.page) ? `#page=${Number(item.page)}&view=FitH` : "";
            frame.className = className;
            frame.src = `${getFile(item)}${pageFragment}`;
            frame.title = `${item.title || "Document"} ${titleSuffix}`;
            frame.loading = "lazy";
            return frame;
        };

        const renderPdfCanvas = async (item, container, placeholder) => {
            try {
                const renderer = window.PdfPageRenderer;
                if (!renderer) throw new Error("PDF page renderer is unavailable.");
                const canvas = await withTimeout(renderer.renderPdfPageToCanvas(getFile(item), item.page, {
                    className: "pdf-sheet-canvas",
                    maxWidth: container.clientWidth || 1200,
                    maxHeight: container.clientHeight || 850,
                    maxPixelRatio: 1.75,
                    ariaLabel: `${item.title || "Drawing"} PDF page ${Number(item.page)}`
                }));
                if (!container.isConnected) return;
                container.prepend(canvas);
                placeholder.classList.remove("visible");
            } catch (error) {
                console.error(`Unable to render PDF page for ${item.id || item.title || "item"}.`, error);
                if (!container.isConnected) return;
                placeholder.textContent = item.missingMessage || "PDF page unavailable";
                placeholder.classList.add("visible");
            }
        };

        const lazyObserver = "IntersectionObserver" in window
            ? new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    observer.unobserve(entry.target);
                    const job = mediaJobs.get(entry.target);
                    if (job) renderPdfCanvas(job.item, entry.target, job.placeholder);
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
            stage.innerHTML = createEmptyState("Media unavailable", item.missingMessage || "등록된 media 파일 경로를 확인해 주세요.");
        };

        const openViewer = (item, trigger) => {
            const renderId = ++viewerRenderId;
            const file = getFile(item);
            const type = getType(item);
            lastFocusedElement = trigger;
            stage.replaceChildren();
            viewerTitle.textContent = item.drawingNumber ? `${item.drawingNumber} · ${item.title || "Untitled"}` : item.title || "Untitled";
            viewerDescription.textContent = item.description || "";
            viewer.hidden = false;
            viewer.classList.add("active");
            document.body.style.overflow = "hidden";
            activeViewerClose = closeViewer;
            closeButton.focus();

            if (!file) {
                showStageFallback(item);
            } else if (type === "pdf" && isValidPdfPage(item.page)) {
                stage.innerHTML = createEmptyState("Loading drawing", "Rendering the selected PDF page.");
                const renderer = window.PdfPageRenderer;
                if (!renderer) return showStageFallback(item);
                withTimeout(renderer.renderPdfViewer(file, item.page, {
                    maxWidth: stage.clientWidth || 1440,
                    maxHeight: stage.clientHeight || 900,
                    ariaLabel: `${item.title || "Drawing"} PDF page ${Number(item.page)}`
                })).then((canvas) => {
                    if (renderId === viewerRenderId && !viewer.hidden) stage.replaceChildren(canvas);
                }).catch((error) => {
                    console.error(`Unable to render PDF page for ${item.id || item.title || "item"}.`, error);
                    if (renderId === viewerRenderId && !viewer.hidden) showStageFallback(item);
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

        const attachMedia = (item, container, placeholder) => {
            const file = getFile(item);
            const type = getType(item);
            const thumbnail = item.thumbnail || (type === "image" ? file : "");

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
            } else if (type === "pdf" && file && isValidPdfPage(item.page)) {
                if (lazyObserver) {
                    mediaJobs.set(container, { item, placeholder });
                    lazyObserver.observe(container);
                } else {
                    renderPdfCanvas(item, container, placeholder);
                }
            } else if (type === "pdf" && file) {
                const frame = createPdfFrame(item, "document-sheet-pdf");
                frame.tabIndex = -1;
                frame.addEventListener("load", () => placeholder.classList.remove("visible"), { once: true });
                container.prepend(frame);
            } else {
                placeholder.textContent = item.missingMessage || "Media unavailable";
            }
        };

        const createDocumentSheet = (item, index) => {
            const sheet = document.createElement("article");
            sheet.className = "document-sheet";
            sheet.id = item.id || `media-item-${index + 1}`;
            sheet.dataset.category = item.category || "";
            sheet.dataset.subcategory = item.subcategory || "";
            sheet.innerHTML = `
                <header class="document-sheet-header">
                    <p class="document-sheet-number">${escapeHtml(item.drawingNumber || String(index + 1).padStart(2, "0"))}</p>
                    <div>
                        <h3>${escapeHtml(item.title || "Untitled")}</h3>
                        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
                    </div>
                </header>
                <div class="document-sheet-media">
                    <span class="media-placeholder visible">${escapeHtml(getType(item) === "pdf" ? "Loading PDF sheet" : item.title || "Media unavailable")}</span>
                    <button type="button" class="document-sheet-open" aria-label="Inspect ${escapeHtml(item.title || "media")}"></button>
                </div>
            `;
            const media = sheet.querySelector(".document-sheet-media");
            attachMedia(item, media, sheet.querySelector(".media-placeholder"));
            const trigger = sheet.querySelector(".document-sheet-open");
            trigger.addEventListener("click", () => openViewer(item, trigger));
            return sheet;
        };

        const createGroupHeading = (label, type) => {
            const heading = document.createElement(type === "category" ? "h2" : "h3");
            heading.className = `media-group-heading media-group-heading-${type}`;
            heading.textContent = label;
            return heading;
        };

        const setSidebarActive = (item) => {
            if (!filters || !item || item === activeItem) return;
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

        const renderDocumentItems = () => {
            lazyObserver?.disconnect();
            scrollSpy?.disconnect();
            const visibleItems = expanded ? items : initialItems;
            const nodes = [];
            let previousCategory = null;
            let previousSubcategory = null;

            visibleItems.forEach((item) => {
                if (item.category && item.category !== previousCategory) {
                    const category = categories.find((entry) => entry.id === item.category);
                    nodes.push(createGroupHeading(category?.label || item.category, "category"));
                    previousCategory = item.category;
                    previousSubcategory = null;
                } else if (!item.category) {
                    previousCategory = null;
                    previousSubcategory = null;
                }
                if (item.subcategory && item.subcategory !== previousSubcategory) {
                    const category = categories.find((entry) => entry.id === item.category);
                    const subcategory = category?.subcategories.find((entry) => entry.id === item.subcategory);
                    nodes.push(createGroupHeading(subcategory?.label || item.subcategory, "subcategory"));
                    previousSubcategory = item.subcategory;
                } else if (!item.subcategory) {
                    previousSubcategory = null;
                }
                nodes.push(createDocumentSheet(item, items.indexOf(item)));
            });
            stream.replaceChildren(...nodes);

            detailActions.replaceChildren();
            if (!expanded) {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "media-detail-toggle";
                button.textContent = `전체 자료 보기 (${items.length})`;
                button.addEventListener("click", () => {
                    expanded = true;
                    renderDocumentItems();
                });
                detailActions.append(button);
            }

            const sheets = [...stream.querySelectorAll(".document-sheet")];
            if ("IntersectionObserver" in window) {
                scrollSpy = new IntersectionObserver((entries) => {
                    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                    const item = visible[0] && items.find((entry) => entry.id === visible[0].target.id);
                    if (item) setSidebarActive(item);
                }, { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.15, 0.5, 0.85] });
                sheets.forEach((sheet) => scrollSpy.observe(sheet));
            }
            setSidebarActive(visibleItems[0]);
        };

        const navigateToItem = (item) => {
            if (!item) return;
            if (!expanded && !initialItems.includes(item)) {
                expanded = true;
                renderDocumentItems();
            }
            requestAnimationFrame(() => {
                document.getElementById(item.id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
            });
            const sectionId = root.closest("[data-project-section]")?.id;
            if (sectionId && item.id) history.replaceState(null, "", `#${encodeURIComponent(sectionId)}/${encodeURIComponent(item.id)}`);
            setSidebarActive(item);
        };

        const renderFilters = () => {
            if (!filters) return;
            filters.innerHTML = `<ul class="media-filter-list">${categories.map((category) => `
                <li>
                    <button type="button" data-category="${escapeHtml(category.id)}">${escapeHtml(category.label)}</button>
                    ${category.subcategories.length ? `<ul class="media-filter-sublist">${category.subcategories.map((subcategory) => `
                        <li><button type="button" data-category="${escapeHtml(category.id)}" data-subcategory="${escapeHtml(subcategory.id)}">${escapeHtml(subcategory.label)}</button></li>
                    `).join("")}</ul>` : ""}
                </li>
            `).join("")}</ul>`;

            filters.querySelectorAll("button").forEach((button) => {
                button.addEventListener("click", () => {
                    const item = items.find((entry) => entry.category === button.dataset.category
                        && (!button.dataset.subcategory || entry.subcategory === button.dataset.subcategory));
                    navigateToItem(item);
                });
            });
        };

        closeButton.addEventListener("click", closeViewer);
        fullscreenButton.addEventListener("click", () => viewerPanel.requestFullscreen?.());
        viewer.addEventListener("click", (event) => {
            if (event.target === viewer) closeViewer();
        });

        renderFilters();
        renderDocumentItems();

        const destroy = () => {
            observers.forEach((observer) => observer.disconnect());
            scrollSpy?.disconnect();
            if (!viewer.hidden) closeViewer();
        };
        root._mediaGalleryDestroy = destroy;
        return destroy;
    };

    window.MediaGallery = { mount };
})();
