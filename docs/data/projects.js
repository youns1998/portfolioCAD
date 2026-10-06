/* Add a PDF under docs/documents, then register it here. */
window.portfolioProjects = [
  {
    id: "two-story-house",
    title: "2층 단독주택 설계 도면",
    category: "Architecture / CAD",
    type: "건축 도면집",
    description: "배치와 면적 계획부터 평면·입면·단면, 창호 및 구조 상세까지 정리한 2층 주택 도면집입니다.",
    tools: ["AutoCAD"],
    scope: "배치 · 평면 · 입면 · 단면 · 상세 · 구조",
    highlights: [
      "1층과 2층의 계획안, 평면도, 지붕 평면도를 비교해 볼 수 있습니다.",
      "네 방향 입면도와 단면도를 통해 외형과 수직 공간을 확인할 수 있습니다.",
      "창호, 마감, 구조 평면과 부재 자료까지 한 문서에 정리되어 있습니다."
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
      }
    ]
  },
  {
    id: "comic-cafe",
    title: "만화카페 인테리어 계획",
    category: "Interior / CAD",
    type: "인테리어 제안 · 설계 도면",
    description: "이용 동선과 좌석·서가 구성, 조명과 마감을 계획하고 별도의 CAD 도면집으로 구체화한 만화카페 프로젝트입니다.",
    tools: ["AutoCAD", "PowerPoint"],
    scope: "공간 계획 · 동선 · 조명 · 가구 · 평면 · 천장 · 내부 입면",
    highlights: [
      "제안서에 공간 콘셉트, 이용 동선, 조명, 재료와 가구 계획을 담았습니다.",
      "도면집에서 평면도, 천장도, 내부 입면도와 부분 단면도를 볼 수 있습니다.",
      "두 PDF를 한 프로젝트의 계획 자료와 설계 결과물로 연결했습니다."
    ],
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
      }
    ]
  },
  {
    id: "cad-productivity-palette",
    title: "CAD Productivity Palette",
    category: "Automation / Development",
    type: "AutoCAD 도킹 팔레트",
    description: "선택 객체 확인, 반복 명령 실행, 도면 상태 점검을 한곳에서 처리하는 AutoCAD 생산성 플러그인입니다.",
    tools: ["C#", ".NET 8", "WPF", "AutoCAD .NET API"],
    scope: "객체별 작업 · Quick Tools · 도면 점검 · 사용 기록",
    highlights: [
      "객체 종류와 주요 속성을 보여주고 해당 객체의 편집 작업을 제공합니다.",
      "36개 Quick Tool과 최근·자주 사용한 도구를 팔레트에서 실행할 수 있습니다.",
      "도면 점검 항목을 확인하고 대상 객체를 선택하여 해당 범위로 이동할 수 있습니다."
    ],
    url: "https://github.com/youns1998/cad-productivity-palette",
    documents: []
  }
];
