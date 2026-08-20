import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Material Symbols (Rounded) 폰트 + .material-symbols-rounded 클래스.
// 네트워크 CDN이 아니라 npm 패키지에서 가져오므로 오프라인에서도 아이콘이 뜹니다.
import 'material-symbols/rounded.css';

// Pretendard(가변 폰트) 한 벌로 45~920 굵기를 전부 씁니다.
// 이것도 CDN이 아니라 npm 패키지라 오프라인에서도 글꼴이 깨지지 않습니다.
import 'pretendard/dist/web/variable/pretendardvariable.css';

import { App } from './App';

const container = document.getElementById('root');

if (!container) {
  throw new Error('#root 를 찾지 못했습니다. src/renderer/index.html 을 확인하세요.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
