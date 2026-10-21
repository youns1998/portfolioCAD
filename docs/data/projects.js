/* Add a PDF under docs/documents, then register it here. */
window.portfolioProjects = [
  {
    id: "comic-cafe",
    title: "만화카페 인테리어 계획",
    category: "Interior / CAD",
    type: "인테리어 제안 · 설계 도면",
    duration: "1개월",
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
    category: "Architecture / CAD",
    type: "건축 도면집",
    duration: "3주",
    context: "국비 교육 · 개인 프로젝트",
    description: "2층 단독주택의 배치·평면·입면·단면과 주요 상세를 도면집으로 정리했습니다.",
    tools: ["AutoCAD"],
    scope: "배치 · 평면 · 입면 · 단면 · 상세 · 구조",
    highlights: [
      "층별 공간 계획과 평면도 작성",
      "입면도·단면도로 건물 구성 표현",
      "창호·마감·구조 상세 정리"
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
    id: "revit-bim-inspector",
    thumbnail: "images/projects/bim-inspector.svg",
    thumbnailAlt: "입체 모델의 층과 점검 지점을 표현한 BIM 그래픽",
    readmeUrl: "https://github.com/youns1998/revit-bim-portfolio/blob/main/README.md",
    title: "Revit BIM Inspector",
    category: "BIM / Development",
    type: "Revit 모델 정보 점검 도구",
    duration: "진행 중",
    context: "개인 개발 프로젝트",
    description: "실·문·창·시트 정보를 점검하고 CSV 보고서를 만드는 Revit용 도구입니다.",
    tools: ["Revit API", "C#", ".NET 8", "WPF"],
    scope: "실·문·창·시트 점검 · 분류 필터 · CSV · JSON",
    verification: "샘플 검사 13개·CSV 출력·Revit 2026 API 빌드 확인. Revit 내부 실행은 미확인입니다.",
    visual: {
      caption: "REVIT / C# · WPF",
      title: "BIM CHECK",
      items: ["실·문·창 점검", "시트 구성 확인", "CSV 보고서"]
    },
    highlights: [
      "미배치·면적 0인 실과 중복 번호 점검",
      "문·창 Mark와 빈 시트 점검",
      "분류 필터와 CSV·JSON 내보내기"
    ],
    url: "https://github.com/youns1998/revit-bim-portfolio",
    documents: []
  },
  {
    id: "drawing-file-organizer",
    thumbnail: "images/projects/drawing-organizer.svg",
    thumbnailAlt: "도면 파일이 폴더와 보고서로 정리되는 흐름을 표현한 그래픽",
    readmeUrl: "https://github.com/youns1998/drawing-file-organizer/blob/main/README.md",
    title: "Drawing File Organizer",
    category: "Automation / Python",
    type: "도면 파일 정리 도구",
    duration: "진행 중",
    context: "개인 개발 프로젝트",
    description: "도면 파일의 이름·리비전·중복을 확인하고 프로젝트별 폴더로 정리하는 Python 도구입니다.",
    tools: ["Python", "표준 라이브러리"],
    scope: "파일명·리비전 점검 · 내용 중복 확인 · 분류 복사 · CSV · HTML",
    verification: "자동 검사 13개 통과. DXF 예제 5개 분석과 최신 리비전 3개 복사를 확인했습니다.",
    visual: {
      caption: "PYTHON / FILE AUTOMATION",
      title: "DRAWING FILES",
      items: ["파일·리비전 점검", "프로젝트별 정리", "CSV·HTML 보고서"]
    },
    highlights: [
      "PDF·DWG·DXF 파일명과 최신 리비전 확인",
      "내용 중복·출력 경로 충돌 점검",
      "원본을 유지하는 분류 복사와 CSV·HTML 보고서"
    ],
    url: "https://github.com/youns1998/drawing-file-organizer",
    documents: []
  }
];
