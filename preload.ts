// preload.ts
// Main 프로세스와 화면(Renderer) 사이를 "안전하게" 이어주는 다리 역할입니다.
// 지금은 특별히 주고받을 데이터가 없어서 비워둡니다.
//
// 나중에 예를 들어 "로컬 mp3 파일 목록 읽어오기" 같은 기능을 추가할 때
// 여기에 contextBridge.exposeInMainWorld(...) 코드를 추가하게 됩니다.

console.log('preload script loaded');
  