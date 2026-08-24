(function () {
    const mount = (root, data = {}) => {
        if (!root) return;
        const items = Array.isArray(data.items) ? data.items : [];
        root.replaceChildren();
        root.classList.remove("content-card-grid");

        if (!items.length) {
            root.innerHTML = `
                <div class="content-empty-state" role="status">
                    <p class="content-empty-state-title"></p>
                    <p class="content-empty-state-message"></p>
                </div>
            `;
            root.querySelector(".content-empty-state-title").textContent = data.emptyTitle || "Content coming soon";
            root.querySelector(".content-empty-state-message").textContent = data.emptyMessage || "This template is ready for project content.";
            return;
        }

        root.classList.add("content-card-grid");
        items.forEach((item) => {
            const article = document.createElement("article");
            article.className = "content-card";
            const title = document.createElement("h2");
            title.textContent = item.title || "Untitled";
            const description = document.createElement("p");
            description.textContent = item.description || "";
            article.append(title, description);

            if (item.link) {
                const link = document.createElement("a");
                link.href = item.link;
                link.textContent = item.linkLabel || "Open resource";
                article.append(link);
            }
            root.append(article);
        });
    };

    window.ContentTemplate = { mount };
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("[data-content-template]").forEach((root) => {
            mount(root, window[root.dataset.contentTemplate]);
        });
    });
})();
