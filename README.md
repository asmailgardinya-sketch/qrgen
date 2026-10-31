# QR Studio

URL을 QR 코드로 변환하고 PNG로 저장하는 Windows Electron 앱입니다. 인터넷 연결이나 계정 없이 QR 코드를 생성합니다.

## 실행 및 빌드

```powershell
npm.cmd install
npm.cmd start
npm.cmd test
npm.cmd run test:ui
npm.cmd run build
```

빌드 결과: `release/QR-Studio-1.0.0.exe` (설치 없이 실행하는 Windows x64 앱).

URL 입력 시 자동으로 미리보기가 생성됩니다. 128~4096px 크기, 네 가지 코드 색상, 세 가지 오류 복원 수준을 선택하고 **PNG 이미지 저장**을 누르세요. 저장 대화상자에서 파일 이름과 위치를 선택할 수 있습니다. PNG는 지정한 정사각형 크기와 흰색 배경, 스캔을 위한 여백을 포함합니다.

코드 서명이 없는 개인 빌드이므로 Windows에서 게시자가 확인되지 않은 앱으로 표시될 수 있습니다.

`test`는 생성된 PNG를 다시 판독해 URL과 이미지 크기를 검증합니다. `test:ui`는 실제 Electron 창에서 미리보기와 PNG 저장을 검증하고 `release/preview.png`에 화면을 기록합니다.
