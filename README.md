# MobiTone 배경화면 앱

시계, 시간대별 인사말, YouTube 오디오 플레이어가 있는 데스크탑 앱.
Electron + React + electron-vite 기반입니다.

## 실행

```bash
npm install
npm run dev
```

`npm run dev` 는 Vite dev server 와 Electron 을 함께 띄우고 **HMR** 이 붙습니다.
`.tsx` 나 스타일을 고치면 앱 재시작 없이 화면이 바로 갱신됩니다.

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 모드 (HMR). `npm start` 도 같습니다 |
| `npm run build` | `out/` 에 프로덕션 빌드 |
| `npm run preview` | 빌드한 뒤 프로덕션 상태로 실행 |
| `npm run typecheck` | `tsc --noEmit` 타입 검사 |
| `npm test` | 순수 함수 단위 테스트 (Node 내장 러너) |

**종료: `Ctrl + Alt + Q`** — 창에 프레임이 없고 작업표시줄에도 안 뜨기 때문에
이 단축키가 유일한 정상 종료 방법입니다.

## 구조

```
src/
├─ main/index.ts          Main 프로세스: 창 생성, 전역 단축키, 프로덕션 정적 서버
├─ preload/index.ts       Main ↔ Renderer 다리 (아직 비어 있음)
└─ renderer/
   ├─ index.html          Vite entry
   └─ src/
      ├─ main.tsx         React 마운트 + Material Symbols 폰트 import
      ├─ App.tsx          레이아웃, 배경 블롭, 하단 바
      ├─ components/
      │  ├─ Icon.tsx           Material Symbols 래퍼
      │  ├─ TopBar.tsx         로고 / Playlist / 아이콘 버튼
      │  ├─ CenterDisplay.tsx  시계 / 인사말 / 부제
      │  └─ PlayerCard.tsx     앨범아트 / 곡정보 / 진행바 / 컨트롤
      ├─ hooks/
      │  ├─ useClock.ts          1초 간격 시계 + 인사말
      │  ├─ useTheme.ts          라이트·다크 전환 + localStorage
      │  ├─ useYouTubePlayer.ts  숨은 YouTube 플레이어 (소리만)
      │  └─ useIntroAnimation.ts GSAP 등장 타임라인 + 블롭 유영
      ├─ lib/
      │  ├─ format.ts       순수 함수 (시간·인사말·진행률)
      │  └─ format.test.ts  위 함수들의 단위 테스트
      └─ styles/
         └─ GlobalStyles.tsx  리셋 + 테마 CSS 변수
```

빌드 산출물은 `out/` 입니다. 직접 수정하지 마세요.

## 스타일링 방식

**Emotion(`styled`) + CSS 변수 하이브리드**입니다.

- **색·테마 토큰**은 `GlobalStyles.tsx` 의 CSS 변수(`--card-bg` 등)로 둡니다.
  테마 전환은 `documentElement` 의 `data-theme` 속성만 바꾸므로 리렌더가 없습니다.
- **컴포넌트 레이아웃**은 각 컴포넌트 파일 안의 `styled` 로 둡니다.
  스타일이 쓰이는 곳 바로 옆에 있어서 찾기 쉽습니다.

## 알아둬야 할 점

**1. 아직 "진짜" 배경화면이 아닙니다.**
`src/main/index.ts` 의 `setAlwaysOnTop(false)` + `blur()` 는 창을 다른 창 뒤로
보내지 못합니다. 지금은 사실상 전체화면 오버레이입니다. Windows 에서 진짜
배경화면이 되려면 `WorkerW` 윈도우에 `SetParent` 로 붙이는 native 작업이 필요합니다.
해당 위치에 `TODO(배경화면)` 주석이 있습니다.

**2. 프로덕션에서 작은 http 서버를 띄웁니다.**
`file://` 로 로드하면 origin 이 `null` 이 되어 YouTube IFrame API 의 postMessage
핸드셰이크가 실패합니다(= 소리가 안 남). 그래서 프로덕션에서는 `express` 로
`out/renderer` 를 localhost 에 서빙합니다. 개발 모드는 Vite dev server 가 이미
http 라서 그냥 씁니다.

**3. 재생 곡이 하나로 고정입니다.**
`src/renderer/src/App.tsx` 의 `DEFAULT_VIDEO_ID` 상수. 이전/다음 버튼은 재생
목록이 있어야 의미가 있어서 지금은 `disabled` 로 두었습니다.

**4. 알람 / 설정 / 메뉴 / Playlist 추가 버튼은 아직 핸들러가 없습니다.**
UI 만 있는 상태이고, 각 위치에 `TODO` 주석이 있습니다.

## 다음 단계 추천

1. 배경화면으로 실제로 뒤에 깔리게 만들기 (위 1번)
2. 플레이리스트 상태 + 이전/다음 곡 연결
3. `preload` 에 IPC 열어서 로컬 파일·설정 저장 붙이기
4. 알람 UI + `Notification` API
