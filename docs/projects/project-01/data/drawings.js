window.projectDrawings = {
    label: "Drawings",
    initialCategory: "Plans",
    emptyTitle: "No drawings in this category",
    emptyMessage: "Add drawing metadata and a matching media file to populate this view.",
    categories: [
        { id: "Plans", label: "Plans", subcategories: ["1F", "2F", "Roof"] },
        { id: "Sections", label: "Sections" },
        { id: "Elevations", label: "Elevations" },
        { id: "Details", label: "Details" }
    ],
    items: [
        {
            id: "plan-1f",
            title: "1F Floor Plan",
            category: "Plans",
            subcategory: "1F",
            thumbnail: "assets/drawings/plan-1f.png",
            file: "assets/drawings/plan-1f.png",
            description: "1층 평면도"
        },
        {
            id: "plan-2f",
            title: "2F Floor Plan",
            category: "Plans",
            subcategory: "2F",
            thumbnail: "assets/drawings/plan-2f.png",
            file: "assets/drawings/plan-2f.png",
            description: "2층 평면도"
        },
        {
            id: "section-a",
            title: "Section A",
            category: "Sections",
            subcategory: "",
            thumbnail: "assets/drawings/section-a.png",
            file: "assets/drawings/section-a.png",
            description: "주요 단면도"
        },
        {
            id: "elevation-south",
            title: "South Elevation",
            category: "Elevations",
            subcategory: "South",
            thumbnail: "assets/drawings/elevation-south.png",
            file: "assets/drawings/elevation-south.png",
            description: "남측 입면도"
        },
        {
            id: "detail-01",
            title: "Detail 01",
            category: "Details",
            subcategory: "",
            thumbnail: "assets/drawings/detail-01.png",
            file: "assets/drawings/detail-01.png",
            description: "상세도"
        },
        {
            id: "sample-cad",
            title: "CAD Basic Drawing",
            drawingNumber: "SAMPLE-01",
            category: "Details",
            subcategory: "",
            type: "pdf",
            thumbnail: "",
            file: "assets/drawings/샘플 예제.pdf",
            description: "PDF Viewer 테스트용 CAD 샘플 도면"
        }
    ]
};

// Kept for any existing code that reads the original global array.
window.drawings = window.projectDrawings.items;
