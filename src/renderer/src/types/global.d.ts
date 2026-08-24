// preload 가 열어준 다리(window.mobitone)의 모양입니다.
// 실제 구현은 src/preload/index.ts 에 있습니다.
export {};

declare global {
  interface Window {
    mobitone?: {
      setLaunchAtLogin(enabled: boolean): void;
      quit(): void;
      minimize(): void;
    };
  }
}
