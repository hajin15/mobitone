// Electron "Main 프로세스".
// OS와 직접 대화하는 부분(창 만들기, 화면 크기, 전역 단축키)은 전부 여기서 처리합니다.

import { app, BrowserWindow, screen, globalShortcut, ipcMain } from 'electron';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import express from 'express';

let win: BrowserWindow | null = null;

/**
 * 프로덕션에서 빌드된 렌더러를 http 로 서빙하고 그 URL을 돌려줍니다.
 *
 * 왜 그냥 loadFile() 을 안 쓰는가:
 * file:// 로 로드하면 origin 이 null 이 되고, YouTube IFrame API 의
 * postMessage 핸드셰이크가 실패해서 재생이 안 됩니다. 개발 모드는 Vite dev
 * server 가 http origin 을 주므로 문제가 없고, 프로덕션도 같은 조건을
 * 맞춰주기 위해 작은 정적 서버를 띄웁니다.
 *
 * ponytail: 동작이 이미 검증된 express 를 재사용했습니다. 의존성을 없애려면
 * protocol.handle('app://', ...) 로 교체 가능합니다 (Electron 25+).
 */
function serveRenderer(): Promise<string> {
  const server = express();
  server.use(express.static(join(__dirname, '../renderer')));

  return new Promise((resolve, reject) => {
    // 포트 0 = OS가 비어있는 포트를 골라줍니다. 3000번 고정 시 충돌하던 문제를 피합니다.
    const listener = server.listen(0, '127.0.0.1', () => {
      const { port } = listener.address() as AddressInfo;
      resolve(`http://127.0.0.1:${port}/index.html`);
    });

    listener.on('error', reject);
  });
}

const QUIT_ACCELERATOR = 'Control+Alt+Q';

// 작업표시줄에 안 뜨는 창이라, 최소화하면 이 단축키 말고는 되살릴 방법이 없습니다.
const TOGGLE_ACCELERATOR = 'Control+Alt+M';

/**
 * 비상 종료.
 *
 * app.quit() 은 창을 "정중히" 닫으려 하기 때문에, 렌더러가 뭔가에 붙들려 있으면
 * (YouTube iframe 로딩, 무거운 애니메이션 등) 종료 요청이 그대로 멈춰버립니다.
 * 단축키를 눌러도 안 닫히던 게 이 경우입니다. 저장할 상태가 없으므로
 * 프로세스를 즉시 끝냅니다.
 */
function forceQuit() {
  app.exit(0);
}

/**
 * 잠시 치워두기.
 *
 * 이 창은 평소 작업표시줄에 뜨지 않습니다(배경화면처럼 보여야 하므로).
 * 그대로 최소화하면 다시 부를 손잡이가 단축키밖에 안 남으니, 최소화된
 * 동안에만 작업표시줄에 내놨다가 돌아올 때 도로 감춥니다.
 */
function minimizeWindow() {
  if (!win) return;

  win.setSkipTaskbar(false);
  win.minimize();
}

/** 치웠다 다시 부르기. 단축키로 양쪽을 오갑니다. */
function toggleWindow() {
  if (!win) return;

  if (win.isMinimized()) {
    win.restore();
    win.focus();
  } else {
    minimizeWindow();
  }
}

async function createWindow() {
  // 작업 영역(작업표시줄 제외) 크기를 씁니다.
  // 진짜 배경화면으로 만들 때는 workAreaSize 대신 bounds 로 바꿔야 합니다.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

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
    focusable: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // TODO(배경화면): 아래 두 줄은 창을 다른 창 "뒤로" 보내지 못합니다.
  // 지금은 사실상 전체화면 오버레이입니다. Windows에서 진짜 배경화면이 되려면
  // WorkerW 윈도우에 SetParent 로 붙이는 native 작업이 필요합니다.
  win.setAlwaysOnTop(false);
  win.blur();

  // 클릭이 이 창에서 처리됩니다(= 플레이어 버튼이 눌립니다).
  // 클릭을 데스크탑으로 통과시키려면 true + { forward: true } 로 바꿉니다.
  win.setIgnoreMouseEvents(false);

  // 전역 단축키가 막혔을 때를 위한 두 번째 경로.
  // 이 창이 포커스를 갖고 있는 동안에는 이쪽이 항상 받습니다.
  win.webContents.on('before-input-event', (_event, input) => {
    if (input.control && input.alt && input.key.toLowerCase() === 'q') forceQuit();
  });

  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide();
  }

  // 개발 모드에서는 electron-vite 가 이 환경변수에 dev server URL을 넣어줍니다.
  const devUrl = process.env['ELECTRON_RENDERER_URL'];

  if (devUrl) {
    await win.loadURL(devUrl);
  } else {
    await win.loadURL(await serveRenderer());
  }

  // 작업표시줄 아이콘을 눌러 돌아왔을 때도 여기를 지나갑니다.
  win.on('restore', () => {
    win?.setSkipTaskbar(true);
  });

  win.on('closed', () => {
    win = null;
  });
}

// 설정 화면의 "Windows 시작 시 자동 실행" 스위치가 여기로 옵니다.
// openAtLogin 은 OS 의 시작프로그램 등록을 직접 건드립니다.
ipcMain.on('settings:launch-at-login', (_event, enabled: boolean) => {
  app.setLoginItemSettings({ openAtLogin: Boolean(enabled) });
});

// 상단바 메뉴의 "앱 종료". 단축키와 같은 경로로 끝냅니다.
ipcMain.on('app:quit', () => forceQuit());

// 상단바 메뉴의 "화면 닫기". Ctrl+Alt+M 으로 다시 불러옵니다.
ipcMain.on('window:minimize', () => minimizeWindow());

app.whenReady().then(() => {
  createWindow();

  // 비상 종료 단축키. 프레임이 없고 작업표시줄에도 안 뜨는 창이라 필수입니다.
  // register() 는 다른 앱이 이미 그 조합을 선점했으면 조용히 false 를 돌려줍니다.
  if (!globalShortcut.register(QUIT_ACCELERATOR, forceQuit)) {
    console.warn(
      `[MobiTone] ${QUIT_ACCELERATOR} 전역 등록 실패 — 다른 앱이 선점한 것 같습니다.`,
    );
  }

  if (!globalShortcut.register(TOGGLE_ACCELERATOR, toggleWindow)) {
    console.warn(
      `[MobiTone] ${TOGGLE_ACCELERATOR} 전역 등록 실패 — 다른 앱이 선점한 것 같습니다.`,
    );
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
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
