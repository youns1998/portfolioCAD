# 프로젝트 저장소와 수정 순서

| 저장소 | 역할 | 확인 명령 |
| --- | --- | --- |
| [portfolioCAD](https://github.com/youns1998/portfolioCAD) | 소개·프로젝트 카드·상세 화면 | `powershell -File scripts/validate.ps1`, `powershell -File scripts/test-browser.ps1` |
| [cad-productivity-palette](https://github.com/youns1998/cad-productivity-palette) | AutoCAD 도킹 팔레트 | `dotnet build -c Release` |
| [revit-bim-portfolio](https://github.com/youns1998/revit-bim-portfolio) | Revit 모델 정보 점검·WPF 화면·CSV | `dotnet build BimInspector.sln -c Release`, `dotnet run --project tests/BimInspector.Checks -c Release` |
| [drawing-file-organizer](https://github.com/youns1998/drawing-file-organizer) | Python 도면 파일 분류·리비전·중복 점검 | `python -m unittest discover -s tests -v` |

각 명령은 해당 저장소 폴더에서 실행합니다. 로컬에서는 네 저장소를 같은 상위 폴더에 두면 이동하기 쉽습니다.

수정 시 먼저 도구 저장소의 기능과 검사를 갱신하고, 실행으로 확인한 뒤 `portfolioCAD/docs/data/projects.js`의 설명과 확인 범위를 맞춥니다.
`thumbnail`의 코딩 SVG는 기능을 표현한 그래픽이며 앱 화면 캡처를 의미하지 않습니다. `readmeUrl`로 연결한 GitHub README에서 소스와 검증 결과를 확인합니다. 도면 카드는 기존 PDF 상세로 연결합니다.

샘플 데이터 검사, API 빌드, 실제 AutoCAD/Revit 호스트 실행은 서로 구분합니다. 학습 중인 모델링이나 실행하지 않은 호스트 동작을 완료 실적으로 표시하지 않습니다.
