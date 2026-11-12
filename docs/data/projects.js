/* Add a PDF under docs/documents, then register it here. */
window.portfolioProjects = [
  {
    id: "comic-cafe",
    title: "만화카페 인테리어 계획",
    category: "Interior / CAD",
    type: "인테리어 제안 · 설계 도면",
    duration: "6주",
    context: "국비 교육 · 개인 프로젝트",
    description: "만화카페의 공간 구성과 동선을 계획하고, 설계 도면과 렌더링으로 정리했습니다.",
    tools: ["SketchUp", "V-Ray", "AutoCAD", "PowerPoint"],
    scope: "공간 계획 · 동선 · 조명 · 가구 · 평면 · 천장 · 내부 입면",
    thumbnail: "documents/1.아이소 확정.png",
    thumbnailAlt: "만화카페 내부 공간 아이소메트리",
    thumbnailEffect: "isometric",
    highlights: [
      "좌석·서가 배치와 이용 동선 계획",
      "평면·천장·내부 입면 도면 작성",
      "컬러링과 3D 렌더링"
    ],
    video: {
      id: "comic-cafe-isometric",
      title: "만화카페 아이소메트릭 회전 영상",
      file: null,
      poster: null,
      playbackRate: 0.5
    },
    documents: [
      {
        id: "comic-cafe-proposal",
        title: "인테리어 계획 제안서",
        group: "Planning",
        file: "documents/comic-cafe-proposal.pdf",
        pages: 28,
        firstPage: 1,
        thumbnail: "documents/thumbnails/comic-cafe-proposal.jpg"
      },
      {
        id: "comic-cafe-drawings",
        title: "만화카페 설계 도면집",
        group: "Drawings",
        file: "documents/comic-cafe-drawings.pdf",
        pages: 13,
        firstPage: 1,
        thumbnail: "documents/thumbnails/comic-cafe-drawings.jpg"
      },
      {
        id: "comic-cafe-coloring",
        title: "만화카페 컬러링",
        group: "Coloring",
        description: "내부 입면의 색채와 마감 표현",
        file: "documents/컬러링.pdf",
        pages: 3,
        firstPage: 1,
        thumbnail: "documents/thumbnails/comic-cafe-coloring.png"
      },
      {
        id: "comic-cafe-sketchup-renderings",
        title: "SketchUp 렌더링",
        group: "Visualization",
        description: "SketchUp 모델링과 공간 렌더링",
        file: "documents/원본.pdf",
        pages: 6,
        firstPage: 1,
        thumbnail: "documents/thumbnails/comic-cafe-renderings.png"
      }
    ]
  },
  {
    id: "two-story-house",
    title: "2층 단독주택 설계 도면",
    category: "Architecture / CAD · Revit",
    type: "건축 도면집 · Revit 시트",
    duration: "6주",
    context: "국비 교육 · 개인 프로젝트",
    description: "2층 단독주택의 설계 도면을 작성하고, 같은 도면을 바탕으로 Revit 모델링과 시트 구성을 학습했습니다.",
    tools: ["AutoCAD", "Revit"],
    scope: "배치 · 평면 · 입면 · 단면 · 상세 · 구조 · Revit 시트",
    highlights: [
      "층별 공간 계획과 평면도 작성",
      "입면도·단면도로 건물 구성 표현",
      "기존 CAD 설계를 바탕으로 Revit 모델링·시트 작성"
    ],
    documents: [
      {
        id: "house-drawings",
        title: "주택 설계 도면집",
        group: "Architecture / CAD",
        file: "documents/two-story-house.pdf",
        pages: 39,
        firstPage: 9,
        thumbnail: "documents/thumbnails/two-story-house.jpg"
      },
      {
        id: "house-revit-sheets",
        title: "주택 Revit 시트",
        group: "Architecture / Revit · BIM",
        description: "기존 2층 단독주택 설계 도면을 바탕으로 작성한 Revit 학습 결과물",
        file: "documents/레빗시트.pdf",
        pages: 17,
        firstPage: 1,
        thumbnail: "documents/thumbnails/house-revit-sheets.png"
      }
    ]
  },
  {
    id: "cad-productivity-palette",
    thumbnail: "images/projects/cad-productivity.svg",
    thumbnailAlt: "CAD 도면 선과 명령 팔레트를 표현한 그래픽",
    readmeUrl: "https://github.com/youns1998/cad-productivity-palette/blob/main/README.md",
    title: "CAD Productivity Palette",
    category: "Automation / Development",
    type: "AutoCAD 도킹 팔레트",
    duration: "1주일",
    context: "개인 개발 프로젝트",
    description: "객체 편집, 자주 쓰는 명령과 도면 점검을 한곳에 모은 AutoCAD 플러그인입니다.",
    visual: {
      caption: "AUTOCAD / C# · WPF",
      title: "CAD TOOLS",
      items: ["선택 객체", "Quick Tools", "도면 점검"]
    },
    tools: ["C#", ".NET 8", "WPF", "AutoCAD .NET API"],
    scope: "객체별 작업 · Quick Tools · 도면 점검 · 사용 기록",
    verification: "Release 빌드 확인(경고 0개·오류 0개).",
    highlights: [
      "선택 객체의 속성 확인·편집",
      "36개 Quick Tool과 최근·자주 사용한 도구",
      "도면 점검과 대상 객체 선택·이동"
    ],
    url: "https://github.com/youns1998/cad-productivity-palette",
    documents: []
  },
  {
    id: "revit-auto",
    thumbnail: "images/projects/bim-inspector.svg",
    thumbnailAlt: "Revit 모델과 도면 작업을 표현한 BIM 그래픽",
    readmeUrl: "https://github.com/youns1998/RevitAuto/blob/main/README.md",
    title: "RevitAuto",
    category: "BIM / Automation",
    type: "Python 기반 Revit 플러그인",
    duration: "진행 중",
    context: "Revit API 학습 · 개인 개발",
    description: "CSV 시트 일괄 생성, 뷰 자동 배치와 시트 목록 출력을 묶은 Python 기반 pyRevit 플러그인입니다.",
    tools: ["Python", "pyRevit", "Revit 2026 API"],
    scope: "CSV 시트 일괄 생성 · 뷰 자동 배치 · 시트 목록 출력",
    verification: "Python 자동 검사 24개 통과(트랜잭션은 대체 API 검사). Revit 내부 실행은 미확인입니다.",
    visual: {
      caption: "REVIT / PYTHON · PYREVIT",
      title: "REVIT AUTO",
      items: ["CSV → 시트", "뷰 → 시트 배치", "시트 목록 CSV"]
    },
    highlights: [
      "미리보기·중복 번호 검사 후 시트 일괄 생성",
      "선택한 뷰마다 새 시트를 생성하고 중앙 배치",
      "시트 번호·이름을 UTF-8 CSV로 내보내기"
    ],
    url: "https://github.com/youns1998/RevitAuto",
    documents: []
  }
];
