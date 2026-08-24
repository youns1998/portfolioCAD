window.projectDrawings = {
    label: "Drawings",
    layout: "document",
    initialCategory: "Plans",
    emptyTitle: "등록된 공개 도면이 없습니다",
    emptyMessage: "실제 도면 파일과 검증된 metadata가 함께 준비된 항목만 표시합니다.",
    categories: [
        { id: "Plans", label: "Plans", subcategories: ["1F", "2F"] },
        { id: "Elevations", label: "Elevations", subcategories: ["South"] },
        { id: "Sections", label: "Sections" },
        { id: "Details", label: "Details" }
    ],
    items: []
};

// Kept for any existing code that reads the original global array.
window.drawings = window.projectDrawings.items;
