# 최윤성 포트폴리오

건축 도면 PDF와 CAD 개발 작업을 보여주는 정적 포트폴리오입니다. `docs/`가 배포 루트이며 프레임워크나 빌드 도구가 필요하지 않습니다.

현재 등록된 결과물:

| 프로젝트 | 자료 |
| --- | --- |
| 2층 단독주택 설계 도면 | 도면집 PDF 39쪽 |
| 만화카페 인테리어 계획 | 계획 제안서 PDF 28쪽, 설계 도면집 PDF 13쪽 |
| CAD Productivity Palette | [공개 GitHub 저장소](https://github.com/youns1998/cad-productivity-palette) |

## 구성

- `docs/index.html` — 소개, 프로젝트 목록, 연락처
- `docs/projects/detail.html` — 모든 프로젝트가 공유하는 상세 화면과 PDF 뷰어
- `docs/data/projects.js` — 프로젝트와 문서 메타데이터의 단일 원본
- `docs/documents/` — 공개가 승인된 PDF
- `docs/css/portfolio.css`, `docs/js/portfolio.js` — 화면과 동작
- `scripts/validate.ps1` — 경로, 파일 형식, 중복 ID·PDF 확인

## 로컬 실행

`docs/index.html`을 브라우저에서 열어도 됩니다. 배포 환경과 같은 URL 경로로 확인하려면 정적 파일 서버의 루트를 `docs/`로 지정하세요. 이 저장소에는 `package.json`이 없으므로 `npm install`, `npm run lint`, `npm run build`는 필요하지 않습니다.

PowerShell 검증:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\validate.ps1
```

## PDF 추가

1. 공개 권한과 PDF 안의 연락처, 주소, 고객 정보 등을 확인합니다.
2. 승인된 PDF를 `docs/documents/`에 복사합니다. 파일명은 영문 소문자와 하이픈을 권장합니다.
3. `docs/data/projects.js`의 해당 프로젝트 `documents` 배열에 `id`, `title`, `group`, `file`을 추가합니다. `file`은 `documents/example.pdf` 형식입니다. `pages`, `firstPage`, `thumbnail`은 선택 사항입니다.
4. 검증 스크립트를 실행하고 홈, 상세, 원본 열기, 다운로드 링크를 브라우저에서 확인합니다.
5. 변경사항을 커밋하고 `main`에 푸시합니다.

문서 목록과 상세 화면은 같은 데이터를 사용합니다. 새 PDF마다 HTML이나 뷰어 코드를 수정할 필요가 없습니다. 목록 순서는 `documents` 배열 순서입니다.

## 프로젝트 추가

`docs/data/projects.js` 배열에 프로젝트 하나를 추가합니다. 필수 필드는 `id`, `title`, `category`, `type`, `description`입니다. PDF 프로젝트는 `documents` 배열을, 개발 프로젝트는 공개 `url`을 지정합니다. `tools`, `scope`, `highlights`는 확인된 사실만 기록합니다. 연도와 담당 역할은 검증 가능한 경우에만 추가합니다.

## PDF 뷰어

상세 화면은 선택한 PDF를 브라우저 내장 PDF 뷰어로 표시합니다. 브라우저 도구 모음에서 페이지 이동과 확대를 사용할 수 있습니다. 사이트 자체에는 문서 간 이전·다음, 전체 화면, 원본 새 창 열기, 다운로드 기능이 있습니다. 새 라이브러리를 설치하지 않아도 되고 원본 PDF 링크는 브라우저에서 직접 열 수 있습니다.

## 배포

GitHub Pages를 사용한다면 저장소 설정의 **Pages → Build and deployment**에서 **Deploy from a branch**, `main`, `/docs`를 선택합니다. 이후 `main` 푸시가 배포를 갱신합니다. Pages 설정과 실제 배포 성공 여부는 별도로 확인해야 합니다.

공개 저장소에 올리기 전 PDF의 권리, 개인정보, 미공개 도면 여부를 검토하세요. `docs/`에 포함된 파일은 누구나 직접 URL로 받을 수 있습니다. 원본을 가려야 한다면 원본은 로컬에 보관하고 공개용 사본만 `docs/documents/`에 넣습니다.
