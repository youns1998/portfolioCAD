# Project content guide

Project 01 is the reference template. Media paths in its data files are relative to the Project 01 HTML pages, not to the data file.

## Add a Drawing

1. Put the full-size image or PDF in `project-01/assets/drawings/`.
2. Put an optional card image in the same folder. A PDF can omit `thumbnail` and will show a PDF placeholder.
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
    description: "Verified description"
}
```

## Add BIM content

1. Create `project-01/assets/bim/` and add the media files.
2. Add category definitions and items to `project-01/data/bim.js`.
3. Use the same item fields as Drawings. Set paths such as `assets/bim/model-view.jpg`.

The BIM page automatically gains filters, cards, and the shared viewer from its data. Images and browser-native PDFs are supported.

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

## Update the Overview

Edit `project-01/index.html` and replace only the `Not provided` values and empty-state copy for which verified project information is available. Replace `assets/hero/cad.png` or update its path and alt text when the final hero image is ready.

## Shared system files

- `js/project-shell.js`: project header, navigation, footer, and simple image fallback
- `js/media-gallery.js`: category filters, cards, image/PDF viewer, empty states, and missing-image fallback
- `js/drawing-browser.js`: compatibility entry point connecting Drawings to the shared gallery
- `js/content-template.js`: Automation content cards and empty state
- `css/project.css`: shared Project page styles

Do not copy the gallery or viewer code into an individual page. Extend the shared module only when every consuming page needs the behavior.
