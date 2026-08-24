(function () {
    const PDFJS_VERSION = "6.2.108";
    const PDFJS_MODULE_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs`;
    const PDFJS_WORKER_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
    const pdfDocumentCache = new Map();
    let pdfJsPromise = null;

    const isValidPage = (value) => {
        const page = Number(value);
        const hasPageValue = typeof value === "number"
            || (typeof value === "string" && value.trim() !== "");
        return hasPageValue && Number.isInteger(page) && page > 0;
    };

    const loadPdfJs = () => {
        if (!pdfJsPromise) {
            pdfJsPromise = import(PDFJS_MODULE_URL)
                .then((pdfjs) => {
                    pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
                    return pdfjs;
                })
                .catch((error) => {
                    pdfJsPromise = null;
                    throw error;
                });
        }

        return pdfJsPromise;
    };

    const loadPdfDocument = (file) => {
        if (!file) return Promise.reject(new Error("A PDF file URL is required."));

        if (!pdfDocumentCache.has(file)) {
            const documentPromise = loadPdfJs()
                .then((pdfjs) => pdfjs.getDocument({ url: file }).promise)
                .catch((error) => {
                    pdfDocumentCache.delete(file);
                    throw error;
                });
            pdfDocumentCache.set(file, documentPromise);
        }

        return pdfDocumentCache.get(file);
    };

    const renderPdfPageToCanvas = async (file, pageValue, options = {}) => {
        if (!isValidPage(pageValue)) throw new Error(`Invalid PDF page: ${pageValue}`);

        const pdfDocument = await loadPdfDocument(file);
        const pdfPage = await pdfDocument.getPage(Number(pageValue));
        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const maxWidth = Math.max(1, options.maxWidth || baseViewport.width);
        const maxHeight = Math.max(1, options.maxHeight || baseViewport.height);
        const displayScale = Math.min(maxWidth / baseViewport.width, maxHeight / baseViewport.height);
        const deviceScale = window.devicePixelRatio || 1;
        const outputScale = Math.min(
            Math.max(1, options.pixelRatio || deviceScale),
            options.maxPixelRatio || 2
        );
        const renderViewport = pdfPage.getViewport({ scale: displayScale * outputScale });
        const canvas = document.createElement("canvas");

        canvas.className = options.className || "pdf-page-canvas";
        canvas.width = Math.max(1, Math.floor(renderViewport.width));
        canvas.height = Math.max(1, Math.floor(renderViewport.height));
        canvas.style.width = `${Math.floor(baseViewport.width * displayScale)}px`;
        canvas.style.height = `${Math.floor(baseViewport.height * displayScale)}px`;
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", options.ariaLabel || `PDF page ${Number(pageValue)}`);

        const canvasContext = canvas.getContext("2d", { alpha: false });
        if (!canvasContext) throw new Error("A 2D canvas context is unavailable.");
        await pdfPage.render({ canvasContext, viewport: renderViewport }).promise;
        return canvas;
    };

    const renderPdfThumbnail = (file, page, options = {}) => renderPdfPageToCanvas(file, page, {
        className: "pdf-thumbnail-canvas",
        maxPixelRatio: 1.5,
        ...options
    });

    const renderPdfViewer = (file, page, options = {}) => renderPdfPageToCanvas(file, page, {
        className: "pdf-page-canvas",
        maxPixelRatio: 2,
        ...options
    });

    window.PdfPageRenderer = {
        isValidPage,
        loadPdfDocument,
        renderPdfPageToCanvas,
        renderPdfThumbnail,
        renderPdfViewer
    };
})();
