# Portfolio content guide

Each Portfolio has one content source: its `data/project.js`. Project 01 is the reference implementation.

The shared flow is:

```text
project.js data → project-shell.js → media-gallery.js → Full Portfolio / Viewer
                ↘ Home featured preview
```

Do not add content markup to an HTML page. Do not copy the Viewer or navigation code into a project folder.

## Media item model

The minimum recommended fields are `id`, `title`, `type`, and `file`.

```js
{
    id: "plan-1f",
    title: "1층 평면도",
    type: "pdf", // "pdf" or "image"
    file: "assets/drawings/project-drawings.pdf",

    drawingNumber: "A-101", // optional
    category: "Plans", // optional
    subcategory: "1F", // optional
    page: 4, // optional, positive PDF page number
    thumbnail: "assets/drawings/plan-1f.jpg", // optional
    description: "검증된 설명", // optional
    featured: true // optional; Home preview only
}
```

Item order in the array is the Full Portfolio order. Do not sort filenames alphabetically and do not add `order` unless array order becomes insufficient.

## Add a PDF

1. Put the PDF in the matching Project 01 asset folder, for example `project-01/assets/drawings/`.
2. Open `project-01/data/project.js`.
3. Add one item to the appropriate section's `items` array.

```js
{
    id: "section-a",
    title: "단면도 A",
    category: "Sections",
    type: "pdf",
    file: "assets/drawings/section-a.pdf"
}
```

No HTML, navigation, CSS, or renderer edit is required.

## Add a page from a multi-page PDF

Several items may reference the same PDF. Add a positive `page` number to each item.

```js
{
    id: "section-a-page-11",
    title: "단면도 A",
    category: "Sections",
    type: "pdf",
    file: "assets/drawings/project-drawings.pdf",
    page: 11
}
```

The shared PDF.js renderer draws the selected page inline and in the Viewer. A PDF without `page` uses the browser PDF viewer and opens from page 1. `thumbnail` is optional and takes precedence for an inline preview.

## Add an image

1. Put the image in the appropriate asset folder, such as `project-01/assets/visualizations/`.
2. Add an item to the matching section in `project-01/data/project.js`.

```js
{
    id: "exterior-render",
    title: "외부 렌더링",
    category: "Exterior",
    type: "image",
    file: "assets/visualizations/exterior.jpg",
    featured: true
}
```

PDF and image items can be mixed in the same section and use the same Viewer and missing-media fallback.

## Delete content

1. Delete the item from `data/project.js`.
2. Delete its asset only when no other item references that file.

The item then disappears from the Home preview, Full Portfolio, category navigation, subcategory navigation, and Viewer entry points automatically.

## Category and subcategory rules

- `categories` is optional configuration for labels and preferred navigation order.
- Only categories that have at least one item are rendered.
- Only subcategories that have at least one item are rendered.
- A category or subcategory found in an item but omitted from the config is inferred at its first data occurrence.
- Removing every matching item hides the navigation entry and heading. Adding an item restores them.
- Full Portfolio items always preserve their original array order after preview selection or navigation.

## Featured and preview rules

- `featured: true` adds the item to the Home preview.
- Removing `featured` leaves the item in the Full Portfolio but removes it from Home.
- Home renders at most `previewLimit` featured items; Project 01 uses 3.
- Project 02 and 03 keep their preparation status while empty; adding the first item automatically replaces it with a `더 보기` link from `homePath`.
- Home never embeds a full PDF. It uses an optional thumbnail or a lightweight PDF label.
- Fixed marketing copy may remain in `docs/index.html`; media title, type, and file stay only in `project.js`.

## Full Portfolio and large collections

Sections are rendered only when their `items` array is non-empty. Section navigation follows that same rule.

The shared media renderer initially shows all items for a small collection. Above `initialVisible` (default 8), it shows a representative sequence that includes the first item from each category, then featured items, then fills the remaining slots in data order. `전체 자료 보기` reveals the complete collection without a nested route.

PDF page rendering is lazy and starts only near the viewport. Images also use native lazy loading.

## Private assets

Never register, move, copy, thumbnail, or publish anything under `assets/**/private/`.

The private directory remains ignored by Git and its contents must not appear in Portfolio data or tests.

## Overview, sections, and new projects

Edit a project's `overview` and `sections` in that project's single `data/project.js`. Omit unknown facts instead of writing `Not provided` or speculative content.

- `project-01`: Architecture / BIM reference implementation
- `project-02`: Interior / Visualization extension shell
- `project-03`: Automation / Development extension shell

To extend a project, add asset folders and section items; its HTML shell and shared renderer stay unchanged. A new project needs one minimal HTML shell, one `data/project.js`, and the existing shared CSS/JS includes.

## Shared runtime files

- `js/project-shell.js`: Overview, non-empty continuous sections, project navigation, deep links, footer, and hero fallback
- `js/media-gallery.js`: data-driven category headings/navigation, progressive detail reveal, PDF/image inline media, Viewer, ESC close, and missing-media fallback
- `js/pdf-page-renderer.js`: shared PDF.js loader, document cache, and selected-page canvas renderer
- `js/section-progress.js`: Home and Full Portfolio section-based progress, accessible anchor navigation, and responsive current-section UI
- `css/project.css`: shared Portfolio and Viewer presentation

There are no separate Drawings/BIM/Visualization HTML pages or per-media renderers. Content changes belong in `data/project.js` only.
