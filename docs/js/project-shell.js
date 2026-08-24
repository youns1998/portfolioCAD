document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const projectPath = body.dataset.projectPath || ".";
    const sitePath = body.dataset.sitePath || "../..";
    const currentPage = body.dataset.page || "overview";
    const projectLabel = body.dataset.projectLabel || "Project";

    const pages = [
        ["overview", "Overview", "index.html"],
        ["drawings", "Drawings", "drawings.html"],
        ["bim", "BIM", "bim.html"],
        ["visualization", "Visualization", "visualization.html"],
        ["automation", "Automation", "automation.html"]
    ];

    const header = document.querySelector("[data-project-header]");
    if (header) {
        const links = pages.map(([key, label, file]) => {
            const active = key === currentPage;
            return `<a href="${projectPath}/${file}"${active ? ' class="active" aria-current="page"' : ""}>${label}</a>`;
        }).join("");

        header.innerHTML = `
            <div class="container project-header-inner">
                <a href="${sitePath}/index.html" class="project-brand">Youns Journey</a>
                <nav class="project-nav" aria-label="${projectLabel} navigation">${links}</nav>
            </div>
        `;
    }

    const footer = document.querySelector("[data-project-footer]");
    if (footer) {
        footer.innerHTML = `<p class="mb-0">&copy; 2026 Youns Journey</p>`;
    }

    document.querySelectorAll("[data-image-fallback]").forEach((image) => {
        image.addEventListener("error", () => {
            image.hidden = true;
            const fallback = image.nextElementSibling;
            if (fallback?.matches("[data-fallback-message]")) fallback.hidden = false;
        }, { once: true });
    });
});
