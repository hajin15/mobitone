// main.ts
// Electron의 "Main 프로세스" 코드입니다.
// OS와 직접 대화하는 부분(창 만들기, 화면 크기 알아내기 등)은 전부 여기서 처리합니다.

import { app, BrowserWindow, screen, globalShortcut } from 'electron';
import * as path from 'path';
import './server';

let win: BrowserWindow | null = null;

function createWindow() {
  // 1. 사용자의 모니터 크기를 알아냅니다.
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // 2. 화면 전체 크기의 창을 만듭니다.
  win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    focusable: true,    // 이 창이 포커스를 가져가지 않게 (다른 창을 가리지 않도록)
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 3. "가짜 배경화면" 설정
  //    setAlwaysOnTop(true, 'desktop')은 macOS 전용이라 Windows에서는 쓰지 않습니다.
  //    Windows에서는 맨 뒤로 보내기만 하면 다른 창들이 자연스럽게 위에 쌓입니다.
  win.setAlwaysOnTop(false);
  win.blur();

  win.setIgnoreMouseEvents(false);
  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide();
  }

  win.loadURL('http://localhost:3000/index.html');

  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  // 4. 비상 종료 단축키: Ctrl + Alt + Q
  //    마우스 클릭이 다 통과되기 때문에, 끄려면 키보드 단축키가 꼭 필요합니다.
  globalShortcut.register('Control+Alt+Q', () => {
    app.quit();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});