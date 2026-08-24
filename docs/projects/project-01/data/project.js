window.projectConfig = {
    label: "건축설계 · BIM",
    kicker: "PROJECT 01",
    layout: "continuous",
    pages: [
        { id: "overview", label: "건축설계 · BIM", title: "건축설계 · BIM", type: "overview", intro: "건축 도면에서 BIM과 시각화로 이어지는 작업 범위를 하나의 문서로 소개합니다." },
        { id: "drawings", label: "도면", title: "도면", eyebrow: "DRAWINGS", type: "media", data: "projectDrawings", intro: "평면, 입면, 단면과 상세 도면을 의도한 순서대로 이어서 감상합니다." },
        { id: "bim", label: "BIM", title: "BIM", eyebrow: "BUILDING INFORMATION MODELING", type: "media", data: "projectBim", intro: "모델, 단면, 디테일과 작업 과정을 연속으로 정리합니다." },
        { id: "visualization", label: "시각화", title: "시각화", eyebrow: "VISUALIZATION", type: "media", data: "projectVisualizations", intro: "외부, 내부와 조감 시각 자료를 프로젝트 흐름의 마지막에 배치합니다." }
    ],
    overview: {
        facts: [
            { label: "프로젝트 유형", value: "건축설계 · BIM 포트폴리오" },
            { label: "작업 범위", value: "CAD 도면 정리 · BIM · 시각화" },
            { label: "사용 도구", value: "AutoCAD · Revit" },
            { label: "구성", value: "Drawings · BIM · Visualization" }
        ],
        summary: [
            "건축 설계 작업을 도면, BIM, 시각화 단계로 나누어 정리하는 포트폴리오입니다.",
            "등록된 결과물은 별도 선택 화면을 거치지 않고 작업의 서사 순서에 따라 한 문서 안에서 이어집니다."
        ],
        scope: [
            "CAD 도면 — 평면 · 입면 · 단면 · 상세",
            "BIM — 모델 · 단면 · 디테일 · 작업 과정",
            "3D 시각화 — 외부 · 내부 · 조감"
        ]
    }
};
