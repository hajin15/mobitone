import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

// electron-vite 기본 규약을 그대로 씁니다.
//   main     → src/main/index.ts       → out/main/index.js
//   preload  → src/preload/index.ts    → out/preload/index.js
//   renderer → src/renderer/index.html → out/renderer/
// 기본값과 같으므로 input 경로를 따로 적지 않습니다.
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },

  preload: {
    plugins: [externalizeDepsPlugin()],
  },

  renderer: {
    plugins: [
      react({
        // Emotion 의 css prop 과 styled 디버그 라벨을 켭니다.
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
    ],
  },
});
