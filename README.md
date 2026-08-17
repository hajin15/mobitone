# MobiTone 배경화면 앱 - 시작 가이드

## 1. 실행 방법 (VS Code에서)

1. 이 폴더 전체를 VS Code로 여세요. (`파일 > 폴더 열기`)
2. VS Code 상단 메뉴 `터미널 > 새 터미널`을 눌러 터미널을 엽니다.
3. 아래 명령어를 순서대로 입력하세요.

```bash
npm install
npm start
```

- `npm install`: package.json에 적힌 Electron, TypeScript 등을 다운로드합니다. (처음 한 번만, 시간이 좀 걸려요)
- `npm start`: TypeScript를 JS로 변환(`tsc`)한 뒤 Electron 앱을 실행합니다.

실행하면 화면 전체를 덮는 반투명한 창이 뜨고, 시계와 인사말이 실시간으로 바뀌는 걸 볼 수 있어요.

## 2. 파일 하나하나 설명

| 파일 | 역할 |
|---|---|
| `package.json` | 프로젝트 정보 + 필요한 라이브러리 + 실행 명령어 정의 |
| `tsconfig.json` | TypeScript를 JavaScript로 바꾸는 규칙 |
| `main.ts` | **Main 프로세스.** 창을 만들고, "가짜 배경화면"이 되도록 설정하는 핵심 코드 |
| `preload.ts` | Main과 화면(Renderer) 사이의 다리. 지금은 비어있음 |
| `index.html` | 화면의 뼈대 (시계, 인사말, 플레이어 카드 위치) |
| `style.css` | 피그마 디자인의 색감/그라데이션/레이아웃 |
| `renderer.ts` | 화면 안에서 동작하는 로직 (시계 갱신, 버튼 클릭 등) |

`npm start`를 실행하면 `dist/` 폴더가 자동으로 생기고 그 안에 컴파일된 `main.js`, `preload.js`, `renderer.js`가 만들어집니다. `dist/` 폴더는 직접 수정하지 마세요 — `.ts` 파일을 고치면 다시 자동으로 만들어집니다.

## 3. 지금 알아둬야 할 중요한 점 ⚠️

지금 `main.ts`에서 `win.setIgnoreMouseEvents(true, { forward: true })`를 켜놨기 때문에 **재생 버튼을 눌러도 반응하지 않는 게 정상**이에요. 이건 버그가 아니라, "배경화면처럼 클릭이 뒤로 통과되게" 만든 설정 때문입니다.

나중에 버튼을 진짜로 누를 수 있게 하려면, 마우스가 플레이어 카드 위에 있을 때만 클릭을 받도록 바꿔야 해요. 이건 다음 단계 과제로 남겨두었어요 (원하면 이어서 같이 만들어봐요).

## 4. 다음 단계 추천 순서

1. 지금 상태 그대로 실행해서 배경화면처럼 잘 뜨는지 확인
2. 피그마 디자인이랑 비교하면서 `style.css` 색상/간격 미세 조정
3. 플레이어 카드 위에서만 클릭이 되게 만들기 (hover 시 `setIgnoreMouseEvents(false)`)
4. `<audio>` 태그로 실제 로컬 mp3 파일 재생 연결
5. 알람 설정 UI + `Notification` API 연결

막히는 단계 생기면 그 부분 코드만 들고 물어봐도 좋아요.
