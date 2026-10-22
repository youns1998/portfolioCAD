# 두 포트폴리오의 편집 기준

같은 녹색 계열 색상, 타이포그래피, 프로필, 카드와 내비게이션을 사용하면서 소개하는 작업의 비중을 나눕니다. 80:20은 프로젝트 개수나 코드 줄 수가 아닌 소개 문구·기술 소개·노출 순서·화면 면적에 대한 편집 방향입니다.

| 항목 | portfolioCAD | portfolioSW |
| --- | --- | --- |
| 주력 약 80% | 건축·인테리어·도면·시각화 | 소프트웨어·도구·자동화 |
| 보조 약 20% | 설계를 돕는 개발 도구 | 건축 작업에서 얻은 문제 이해 |
| 주요 결과물 | 만화카페, 단독주택, PDF 5개·89쪽 | C#·WPF·Python 도구 3개 |
| 다음 작업 자리 | 추가하지 않음 | Spring 백엔드, GIS 공간 데이터 |
| 상세 자료의 원본 | 건축 PDF와 설계 이미지 | 개발 프로젝트 설명과 원본 저장소 링크 |

CAD의 개발 도구는 작은 목록으로 표시하고 GitHub README에 연결합니다. SW의 건축 작업은 작은 목록으로 표시하고 CAD의 설계 상세에 연결합니다. 두 사이트의 주요 작업은 준비 중인 작업과 분리합니다. SW 저장소에 건축 PDF를 복제하지 않습니다.

## 독립적인 유지 관리

두 저장소 모두 `docs/`를 GitHub Pages 루트로 사용하는 빌드 없는 정적 사이트입니다. 서로의 로컬 폴더나 루트 기준 `/assets` 경로에 의존하지 않습니다.

- `docs/index.html`: 각 사이트의 소개·순서·기술·주력/보조 영역. `data-focus`는 각각 `architecture`, `software`입니다.
- `docs/data/projects.js`: 실제 결과물. 도구 설명·검증 범위를 바꿀 때는 양쪽 데이터를 확인합니다.
- `docs/css/portfolio.css`, `docs/js/portfolio.js`: 분리 시점의 공통 디자인·동작. 공통 수정은 양쪽에 반영하고 각각 검증합니다.
- `docs/projects/detail.html`: 동일한 상세 화면 구조. 건축 PDF는 CAD에서 관리합니다.
- `scripts/validate.ps1`, `scripts/test-browser.ps1`: 각 폴더에서 파일 및 브라우저 검증을 실행합니다.

Spring·GIS 작업은 SW의 `window.portfolioPlannedProjects`에만 있습니다. 구현 전에는 사용 기술 실적·완성 프로젝트 수·GitHub 결과물 링크에 포함하지 않습니다. 실제 결과물이 생기면 `portfolioProjects`에 설명·사용 기술·검증 결과·실제 URL을 등록하고 해당 예정 카드를 제거합니다.

샘플 데이터 검사, API 빌드와 실제 CAD/Revit 내부 실행은 구분합니다. 기존 `verification`에 기록된 범위를 넘어 실행했다고 표현하지 않습니다.

배포 버전 쿼리 `?v=`는 CSS·데이터·JS 변경 시 두 HTML에서 함께 갱신합니다. 배포는 각 저장소의 `main` 브랜치 `/docs` 설정을 사용합니다.
