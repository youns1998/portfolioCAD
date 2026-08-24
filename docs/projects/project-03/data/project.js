window.projectAutomationPortfolio = {
    label: "자동화 · 개발",
    layout: "document",
    categories: [
        { id: "Problem", label: "Problem" },
        { id: "Existing Workflow", label: "Existing Workflow" },
        { id: "Automation", label: "Automation" },
        { id: "Result", label: "Result" }
    ],
    items: [],
    emptyTitle: "공개 가능한 자동화 사례를 준비 중입니다",
    emptyMessage: "검증된 문제, 기존 작업 흐름, 자동화 과정과 결과가 등록되면 이 화면에서 순서대로 이어집니다."
};

window.projectConfig = {
    label: "자동화 · 개발",
    kicker: "PROJECT 03",
    pages: [
        { id: "overview", label: "Overview", title: "자동화 · 개발", type: "overview", intro: "건축과 소프트웨어를 연결해 반복 작업의 흐름을 정리하는 영역입니다." },
        { id: "portfolio", label: "Full View", title: "자동화 · 개발", type: "media", data: "projectAutomationPortfolio", intro: "Problem부터 Result까지 검증된 사례를 연속으로 감상합니다." }
    ],
    overview: {
        facts: [
            { label: "영역", value: "Architecture × Software" },
            { label: "초점", value: "Workflow Automation" },
            { label: "작업 범위", value: "CAD · BIM · Data Processing" },
            { label: "사용 도구", value: "Python · CAD/BIM Automation" }
        ],
        summary: [
            "설계와 도면 작업에서 반복되는 문제를 찾고 자동화 흐름으로 연결하는 작업을 정리합니다.",
            "실제 사례는 Problem, Existing Workflow, Automation, Result 순서로 구성하며 확인되지 않은 성과나 수치는 추가하지 않습니다."
        ],
        scope: [
            "Problem · Existing Workflow",
            "CAD / BIM Automation · Python",
            "Result · Process Documentation"
        ]
    }
};
