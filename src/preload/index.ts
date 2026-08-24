// Main 프로세스와 화면(Renderer) 사이를 안전하게 이어주는 다리입니다.
// contextIsolation: true 라서, 여기서 노출하지 않은 것은 렌더러가 볼 수 없습니다.

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('mobitone', {
  // Windows 시작 시 자동 실행은 브라우저 권한 밖이라 Main 에 부탁합니다.
  setLaunchAtLogin: (enabled: boolean) => ipcRenderer.send('settings:launch-at-login', enabled),

  // 창에 X 버튼이 없어서 단축키 말고는 끌 방법이 없었습니다.
  quit: () => ipcRenderer.send('app:quit'),

  // 잠시 치워두기. Ctrl+Alt+M 으로 되돌립니다.
  minimize: () => ipcRenderer.send('window:minimize'),
});
