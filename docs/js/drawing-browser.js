// Backward-compatible entry point for the existing Drawings page.
// Rendering and viewer behavior now live in the shared media-gallery module.
document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-drawing-browser]");
    if (root && window.MediaGallery && window.projectDrawings) {
        window.MediaGallery.mount(root, window.projectDrawings);
    }
});
