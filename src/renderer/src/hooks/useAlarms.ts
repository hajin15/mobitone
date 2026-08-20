import { useCallback, useEffect, useState } from 'react';

import { afterFired, dueAlarm } from '../lib/alarm';
import type { Alarm } from '../lib/alarm';

const STORAGE_KEY = 'mobitone:alarms';

function loadAlarms(): Alarm[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    // 저장값이 손상됐을 수 있으니 모양을 확인하고 받습니다.
    return Array.isArray(saved) ? saved.filter((item) => typeof item?.time === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * 알람 목록 + 발화 감시.
 *
 * now 는 useClock 이 1초마다 주는 현재 시각입니다. 판정은 lib/alarm.ts 의
 * 순수 함수가 하고(테스트 대상), 이 훅은 저장과 상태 전환만 맡습니다.
 */
export function useAlarms(now: Date) {
  const [alarms, setAlarms] = useState<Alarm[]>(loadAlarms);
  const [ringing, setRinging] = useState<Alarm | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    // 이미 울리는 중이면 다음 알람을 겹쳐 띄우지 않습니다.
    if (ringing) return;

    const due = dueAlarm(alarms, now);
    if (!due) return;

    setAlarms((list) => list.map((item) => (item.id === due.id ? afterFired(item, now) : item)));
    setRinging(due);
  }, [now, alarms, ringing]);

  const add = useCallback((time: string, repeat: boolean) => {
    setAlarms((list) => [
      ...list,
      { id: crypto.randomUUID(), time, repeat, enabled: true, lastFired: '' },
      // 목록이 시간순이면 눈으로 찾기 쉽습니다.
    ].sort((a, b) => a.time.localeCompare(b.time)));
  }, []);

  const remove = useCallback((id: string) => {
    setAlarms((list) => list.filter((item) => item.id !== id));
  }, []);

  const toggle = useCallback((id: string) => {
    setAlarms((list) =>
      list.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled, lastFired: '' } : item,
      ),
    );
  }, []);

  const stopRinging = useCallback(() => setRinging(null), []);

  return { alarms, ringing, add, remove, toggle, stopRinging };
}
