// Main 프로세스와 화면(Renderer) 사이를 안전하게 이어주는 다리입니다.
// contextIsolation: true 라서, 여기서 노출하지 않은 것은 렌더러가 볼 수 없습니다.
//
// 아직 주고받을 데이터가 없어서 비워둡니다. 예를 들어 "로컬 mp3 목록 읽기"나
// "창을 배경으로 보내기"를 추가할 때 아래처럼 열게 됩니다.
//
//   import { contextBridge, ipcRenderer } from 'electron';
//   contextBridge.exposeInMainWorld('mobitone', {
//     listTracks: () => ipcRenderer.invoke('tracks:list'),
//   });

console.log('preload script loaded');
