# Project content guide

Project 01 is the reference template. Media paths in its data files are relative to the Project 01 HTML pages, not to the data file.

## Add a Drawing

1. Put the full-size image or PDF in `project-01/assets/drawings/`.
2. Add an optional preview image only when the source needs one. PDF pages render directly when `page` is present.
3. Add an item to `project-01/data/drawings.js`.
4. Reuse an existing `category`, or add a category definition to `categories`. The values must match exactly.

```js
{
    id: "unique-drawing-id",
    title: "Drawing title",
    drawingNumber: "A-101", // optional
    category: "Plans",
    subcategory: "1F", // optional
    type: "image", // use "pdf" for a PDF
    thumbnail: "assets/drawings/card-image.jpg", // optional
    file: "assets/drawings/full-image.jpg",
    page: 4, // optional PDF start page; omit to open from page 1
    description: "Verified description"
}
```

Multiple items may reference the same PDF with different positive integer `page` values. Invalid or omitted `page` values open the PDF without a page fragment.

For a PDF with a valid `page`, the shared PDF.js renderer draws that page in both the continuous sheet and the Viewer. A supplied PNG/JPG `thumbnail` still takes precedence. PDFs without a valid `page` retain the browser-native iframe fallback and start at page 1.

`layout: "document"` enables the continuous A4 landscape presentation, sticky navigation, smooth sheet navigation, and scroll spy. Drawings, BIM, and Visualization use this presentation in the Architecture/BIM Full Portfolio.

Never register files from `assets/drawings/private/` as Portfolio items or move extracted pages into a public assets directory.

## Add BIM content

1. Create `project-01/assets/bim/` and add the media files.
2. Add category definitions and items to `project-01/data/bim.js`.
3. Use the same item fields as Drawings. Set paths such as `assets/bim/model-view.jpg`.

When BIM items exist, the Full Portfolio automatically adds the BIM section and its minimal anchor link. Images, page-mapped PDFs, and browser-native PDFs are supported.

## Add a Visualization

1. Create `project-01/assets/visualizations/` and add the media files.
2. Add category definitions and items to `project-01/data/visualizations.js`.
3. Use the same item fields as Drawings, with paths such as `assets/visualizations/exterior-01.jpg`.

Visualization uses the same gallery and viewer as Drawings and BIM.

## Add Automation content

Add an entry to `project-01/data/automation.js`:

```js
{
    title: "Workflow or tool name",
    description: "Verified purpose and result",
    link: "assets/automation/example-file.ext", // optional
    linkLabel: "Open resource" // optional
}
```

Create `project-01/assets/automation/` when an entry needs a local downloadable file. Automation entries render as content cards rather than gallery items.

## Update the Overview and Full Portfolio order

Edit `project-01/data/project.js` using verified information only. Omit unknown facts instead of adding `Not provided` values.

The same file defines the continuous section order. Project 01 uses `layout: "continuous"`; the shared shell renders its Overview first, followed by each non-empty media section in array order. Empty sections and their anchor links stay out of the public document.

- `project-01`: Architecture / BIM reference implementation
- `project-02`: Interior / Visualization extension shell
- `project-03`: Automation / Development extension shell

Use `type: "media"` for PDF/image collections and `type: "content"` for case-study text. Do not describe placeholders as completed work.

## Shared system files

- `js/project-shell.js`: continuous Project 01 document, reusable project header, legacy hash routes, content mounting, footer, and image fallback
- `js/pdf-page-renderer.js`: reusable PDF.js loader, document cache, and single-page canvas renderer
- `js/media-gallery.js`: gallery/document presentations, sticky navigation, scroll spy, image/PDF viewer, empty states, and missing-media fallback
- `js/drawing-browser.js`: compatibility entry point connecting Drawings to the shared gallery
- `js/content-template.js`: Automation content cards and empty state
- `css/project.css`: shared Project page styles

Do not copy the gallery or viewer code into an individual page. Extend the shared module only when every consuming page needs the behavior.
