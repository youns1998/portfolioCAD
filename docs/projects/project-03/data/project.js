(function () {
    const project = {
        id: "automation",
        label: "자동화 · 개발",
        kicker: "PROJECT 03",
        homeBasePath: "projects/project-03/",
        homePath: "projects/project-03/index.html",
        previewLimit: 3,
        overview: {
            title: "자동화 · 개발",
            intro: "건축과 소프트웨어를 연결해 반복 작업의 흐름을 정리하는 영역입니다.",
            facts: [
                { label: "영역", value: "Architecture × Software" },
                { label: "초점", value: "Workflow Automation" },
                { label: "작업 범위", value: "CAD · BIM · Data Processing" },
                { label: "사용 도구", value: "Python · CAD/BIM Automation" }
            ],
            summary: [
                "설계와 도면 작업에서 반복되는 문제를 찾고 자동화 흐름으로 연결하는 작업을 정리합니다.",
                "실제 사례는 문제, 기존 흐름, 자동화, 결과 순서로 구성하며 확인되지 않은 성과나 수치는 추가하지 않습니다."
            ],
            scope: [
                "Problem · Existing Workflow",
                "CAD / BIM Automation · Python",
                "Result · Process Documentation"
            ]
        },
        sections: [
            {
                id: "automation-work",
                label: "자동화 작업",
                title: "자동화 작업",
                eyebrow: "AUTOMATION / DEVELOPMENT",
                intro: "문제에서 결과까지 검증된 사례를 순서대로 정리합니다.",
                categories: ["Problem", "Existing Workflow", "Automation", "Result"],
                items: []
            }
        ]
    };

    window.portfolioProjects = window.portfolioProjects || {};
    window.portfolioProjects[project.id] = project;
    if (document.body?.dataset.projectId === project.id) window.projectConfig = project;
})();
