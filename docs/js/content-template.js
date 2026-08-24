document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-content-template]").forEach((root) => {
        const data = window[root.dataset.contentTemplate];
        const items = data?.items || [];

        if (!items.length) {
            root.innerHTML = `
                <div class="content-empty-state" role="status">
                    <p class="content-empty-state-title">${data?.emptyTitle || "Content coming soon"}</p>
                    <p>${data?.emptyMessage || "This template is ready for project content."}</p>
                </div>
            `;
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
    });
});
