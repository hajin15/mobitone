import { Global, css } from '@emotion/react';

// 기존 style.css 에서 "전역"에 해당하는 것만 옮겼습니다.
// 컴포넌트별 스타일은 각 컴포넌트의 styled 로 갔습니다.
const globalCss = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif;
  }

  /* ==================== 테마 변수 ==================== */
  /* 라이트 모드 (기본값) */
  :root {
    --bg-base: #eef1fb;

    --blob-1: radial-gradient(circle, #bcc9ff 0%, #dde5ff 45%, transparent 75%);
    --blob-2: radial-gradient(circle, #b6f2e6 0%, #d9f8f1 45%, transparent 75%);
    --blob-3: radial-gradient(circle, #ddc9fb 0%, #ede1ff 45%, transparent 75%);
    --blob-opacity: 0.85;
    --blob-blend: normal;
    --blob-blur: 100px;
    /* 원본의 --blob-scare 오타를 고친 값. 이 변수가 비어 있어서
       라이트 모드에서는 확대가 아예 적용되지 않고 있었습니다. */
    --blob-scale: 1;

    --text-primary: #4552d6;
    --text-secondary: #4a5170;
    --text-tertiary: #8b93ad;

    --clock-grad-start: #7b86f0;
    --clock-grad-end: #6a78e0;

    --pill-bg: rgba(255, 255, 255, 0.75);
    --pill-border: rgba(0, 0, 0, 0.06);

    --icon-bg: rgba(255, 255, 255, 0.85);
    --icon-border: rgba(0, 0, 0, 0.06);
    --icon-hover: rgba(0, 0, 0, 0.05);

    --card-bg: rgba(255, 255, 255, 0.75);
    --card-border: rgba(0, 0, 0, 0.06);
    --card-shadow: 0 12px 30px rgba(90, 100, 170, 0.12);

    --album-bg: linear-gradient(135deg, #a9c6ff, #d6b9ff);

    --track-title-color: #333a52;
    --track-artist-color: #7d84a0;

    --progress-track: rgba(0, 0, 0, 0.08);
    --progress-fill: #6f7ce8;

    --control-color: #6f7ce8;
    --control-hover: rgba(111, 124, 232, 0.1);
    --playbtn-grad-start: #8b7ff0;
    --playbtn-grad-end: #6f9af0;

    --bottom-bg: rgba(255, 255, 255, 0.55);
    --bottom-border: rgba(0, 0, 0, 0.06);
  }

  /* 다크 모드 */
  :root[data-theme='dark'] {
    --bg-base: #08070f;

    --blob-1: radial-gradient(circle, #8a68f5 0%, #4a35a8 40%, transparent 72%);
    --blob-2: radial-gradient(circle, #2fcaae 0%, #1a7d8f 40%, transparent 72%);
    --blob-3: radial-gradient(circle, #c93ed6 0%, #59268f 40%, transparent 72%);
    --blob-opacity: 0.42;
    --blob-blend: screen;
    --blob-blur: 150px;
    --blob-scale: 1.35;

    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.85);
    --text-tertiary: rgba(255, 255, 255, 0.45);

    --clock-grad-start: #b998ff;
    --clock-grad-end: #7f90e8;

    --pill-bg: rgba(255, 255, 255, 0.06);
    --pill-border: rgba(255, 255, 255, 0.13);

    --icon-bg: rgba(255, 255, 255, 0.06);
    --icon-border: rgba(255, 255, 255, 0.13);
    --icon-hover: rgba(255, 255, 255, 0.1);

    --card-bg: rgba(255, 255, 255, 0.06);
    --card-border: rgba(255, 255, 255, 0.1);
    --card-shadow: none;

    --album-bg: rgba(255, 255, 255, 0.8);

    --track-title-color: #ffffff;
    --track-artist-color: rgba(255, 255, 255, 0.55);

    --progress-track: rgba(255, 255, 255, 0.18);
    --progress-fill: rgba(255, 255, 255, 0.85);

    --control-color: rgba(255, 255, 255, 0.85);
    --control-hover: rgba(255, 255, 255, 0.1);
    --playbtn-grad-start: #b962da;
    --playbtn-grad-end: #7280c2;

    --bottom-bg: rgba(255, 255, 255, 0.07);
    --bottom-border: rgba(255, 255, 255, 0.1);
  }

  /* ==================== 기본 레이아웃 ==================== */
  html,
  body,
  #root {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: relative;
    color: var(--text-primary);
    background: var(--bg-base);
    transition: background 0.3s ease;
  }

  /* Material Symbols 기본값. 폰트 자체는 main.tsx 에서 import 합니다. */
  .material-symbols-rounded {
    user-select: none;
  }
`;

export function GlobalStyles() {
  return <Global styles={globalCss} />;
}
