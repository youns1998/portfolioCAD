window.projectInteriorPortfolio = {
    label: "인테리어 · 시각화",
    layout: "document",
    categories: [
        { id: "Space Planning", label: "Space Planning" },
        { id: "CAD", label: "CAD" },
        { id: "SketchUp", label: "SketchUp" },
        { id: "Materials", label: "Materials" },
        { id: "Rendering", label: "Rendering" },
        { id: "Final Visualization", label: "Final Visualization" }
    ],
    items: [],
    emptyTitle: "공개 가능한 인테리어 작업을 준비 중입니다",
    emptyMessage: "검증된 CAD, SketchUp, 재료 및 렌더링 자료가 등록되면 이 화면에서 순서대로 이어집니다."
};

window.projectConfig = {
    label: "인테리어 · 시각화",
    kicker: "PROJECT 02",
    pages: [
        { id: "overview", label: "Overview", title: "인테리어 · 시각화", type: "overview", intro: "공간 계획에서 CAD, 모델링과 최종 시각화로 이어지는 작업 범위를 소개합니다." },
        { id: "portfolio", label: "Full View", title: "인테리어 · 시각화", type: "media", data: "projectInteriorPortfolio", intro: "등록된 작업을 Space Planning부터 Final Visualization까지 연속으로 감상합니다." }
    ],
    overview: {
        facts: [
            { label: "프로젝트 유형", value: "인테리어 · 시각화 포트폴리오" },
            { label: "작업 범위", value: "CAD · SketchUp · Materials · Rendering" },
            { label: "사용 도구", value: "AutoCAD · SketchUp · Rendering" },
            { label: "구성", value: "Planning · Model · Visualization" }
        ],
        summary: [
            "인테리어 작업을 공간 계획, CAD, SketchUp, 재료와 렌더링의 흐름으로 정리하는 포트폴리오입니다.",
            "공개 가능한 결과물만 등록하며 Full View에서는 각 자료를 별도 카드 선택 없이 위에서 아래로 이어서 볼 수 있습니다."
        ],
        scope: [
            "Space Planning · CAD",
            "SketchUp · Materials",
            "Rendering · Final Visualization"
        ]
    }
};
