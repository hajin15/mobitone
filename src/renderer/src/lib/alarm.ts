// 알람이 울릴 때인지 판정하는 순수 함수들.
// DOM/React를 모르기 때문에 node --test 로 바로 검증할 수 있습니다 (alarm.test.ts).

import { formatClock } from './format.ts';

export type Alarm = {
  id: string;
  /** 'HH:MM'. 초는 다루지 않습니다. */
  time: string;
  /** 매일 반복할지. 아니면 한 번 울리고 꺼집니다. */
  repeat: boolean;
  enabled: boolean;
  /** 마지막으로 울린 날짜('YYYY-MM-DD'). 같은 분에 여러 번 울리는 걸 막습니다. */
  lastFired: string;
};

/** Date → 'YYYY-MM-DD' (로컬 기준). */
export function dateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 지금 울려야 할 알람 하나. 없으면 null.
 *
 * 시계가 1초마다 도는데 07:00 인 1분 동안 60번 울리면 안 되므로,
 * "오늘 이미 울렸는지"(lastFired)를 함께 봅니다.
 */
export function dueAlarm(alarms: Alarm[], now: Date): Alarm | null {
  const nowTime = formatClock(now);
  const today = dateKey(now);

  return (
    alarms.find(
      (alarm) => alarm.enabled && alarm.time === nowTime && alarm.lastFired !== today,
    ) ?? null
  );
}

/** 울린 뒤의 알람 상태. 한 번짜리는 스스로 꺼집니다. */
export function afterFired(alarm: Alarm, now: Date): Alarm {
  return {
    ...alarm,
    enabled: alarm.repeat,
    lastFired: dateKey(now),
  };
}
