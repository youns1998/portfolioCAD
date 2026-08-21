document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.getElementById("drawing-gallery");
    const buttons = document.querySelectorAll(".drawing-tree button");

    const viewer = document.getElementById("drawing-viewer");
    const viewerImage = document.getElementById("drawing-viewer-image");
    const viewerTitle = document.getElementById("drawing-viewer-title");
    const viewerDescription = document.getElementById("drawing-viewer-description");
    const viewerClose = document.getElementById("drawing-viewer-close");


    const openViewer = (drawing) => {
        viewerImage.src = drawing.file;
        viewerImage.alt = drawing.title;

        viewerTitle.textContent = drawing.title;
        viewerDescription.textContent = drawing.description;

        viewer.classList.add("active");

        document.body.style.overflow = "hidden";
    };


    const closeViewer = () => {
        viewer.classList.remove("active");

        viewerImage.src = "";

        document.body.style.overflow = "";
    };


    const renderDrawings = (category, subcategory = null) => {
        let filteredDrawings = drawings.filter(
            drawing => drawing.category === category
        );

        if (subcategory) {
            filteredDrawings = filteredDrawings.filter(
                drawing => drawing.subcategory === subcategory
            );
        }

        gallery.innerHTML = "";


        filteredDrawings.forEach(drawing => {
            const card = document.createElement("article");

            card.className = "drawing-card";

            card.innerHTML = `
                <div class="drawing-thumbnail">
                    <img
                        src="${drawing.thumbnail}"
                        alt="${drawing.title}"
                        onerror="
                            this.style.display='none';
                            this.nextElementSibling.style.display='flex';
                        "
                    >

                    <div class="drawing-image-placeholder">
                        ${drawing.title}
                    </div>
                </div>

                <div class="drawing-card-body">
                    <h3>${drawing.title}</h3>
                    <p>${drawing.description}</p>
                </div>
            `;

            card.addEventListener("click", () => {
                openViewer(drawing);
            });

            gallery.appendChild(card);
        });
    };


    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const category = button.dataset.category;
            const subcategory = button.dataset.subcategory || null;

            buttons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            renderDrawings(category, subcategory);
        });
    });


    viewerClose.addEventListener("click", closeViewer);


    viewer.addEventListener("click", (event) => {
        if (event.target === viewer) {
            closeViewer();
        }
    });


    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeViewer();
        }
    });


    renderDrawings("Plans");
});