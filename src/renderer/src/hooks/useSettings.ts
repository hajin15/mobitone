import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'mobitone:settings';

export type Settings = {
  /** true = 17:30, false = 오후 5:30 */
  clock24: boolean;
  /** 시계 밑에 뜨는 문구 */
  subtitle: string;
  /** 앱을 켤 때 마지막 곡을 바로 재생할지 */
  autoPlay: boolean;
  /** 알람음 크기 0 ~ 1 */
  alarmVolume: number;
  /** 알람을 끄지 않았을 때 스스로 멎기까지(초) */
  alarmAutoStopSec: number;
  /** Windows 시작할 때 앱도 같이 켤지 */
  launchAtLogin: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  clock24: true,
  subtitle: '시작이 반이다',
  autoPlay: false,
  alarmVolume: 0.25,
  alarmAutoStopSec: 60,
  launchAtLogin: false,
};

function loadSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');

    // 저장값이 손상됐거나 예전 버전이면 빠진 항목만 기본값으로 채웁니다.
    return { ...DEFAULT_SETTINGS, ...(saved && typeof saved === 'object' ? saved : {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** 설정 하나만 바꾸면 되도록 update(키, 값) 형태로 내보냅니다. */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // 자동 실행은 브라우저가 못 하는 일이라 Main 프로세스에 부탁합니다.
  // preload 가 아직 안 붙은 환경(브라우저로 열어본 경우)에서도 죽지 않게 확인합니다.
  useEffect(() => {
    window.mobitone?.setLaunchAtLogin?.(settings.launchAtLogin);
  }, [settings.launchAtLogin]);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  return { settings, update, reset };
}
