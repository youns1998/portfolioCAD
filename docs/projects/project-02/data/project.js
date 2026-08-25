(function () {
    const project = {
        id: "interior",
        label: "인테리어 · 시각화",
        kicker: "PROJECT 02",
        homeBasePath: "projects/project-02/",
        homePath: "projects/project-02/index.html",
        previewLimit: 3,
        overview: {
            title: "인테리어 · 시각화",
            intro: "공간 계획에서 CAD, 모델링과 최종 시각화로 이어지는 작업 범위를 소개합니다.",
            facts: [
                { label: "프로젝트 유형", value: "인테리어 · 시각화 포트폴리오" },
                { label: "작업 범위", value: "CAD · SketchUp · Materials · Rendering" },
                { label: "사용 도구", value: "AutoCAD · SketchUp · Rendering" },
                { label: "구성", value: "Planning · Model · Visualization" }
            ],
            summary: [
                "인테리어 작업을 공간 계획, CAD, SketchUp, 재료와 렌더링의 흐름으로 정리하는 포트폴리오입니다.",
                "확인된 결과물만 data에 등록하며 모든 콘텐츠는 한 문서 안에서 이어집니다."
            ],
            scope: [
                "Space Planning · CAD",
                "SketchUp · Materials",
                "Rendering · Final Visualization"
            ]
        },
        sections: [
            {
                id: "interior-work",
                label: "인테리어 작업",
                title: "인테리어 작업",
                eyebrow: "INTERIOR / VISUALIZATION",
                intro: "공간 계획부터 최종 시각화까지 실제 결과물을 순서대로 정리합니다.",
                categories: ["Space Planning", "CAD", "SketchUp", "Materials", "Rendering", "Final Visualization"],
                items: []
            }
        ]
    };

    window.portfolioProjects = window.portfolioProjects || {};
    window.portfolioProjects[project.id] = project;
    if (document.body?.dataset.projectId === project.id) window.projectConfig = project;
})();
