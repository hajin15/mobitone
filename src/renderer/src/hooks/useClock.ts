import { useEffect, useState } from 'react';

import { formatClock, greetingFor } from '../lib/format';

/** 1초마다 갱신되는 시계 + 시간대별 인사말. */
export function useClock(use24 = true) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return {
    // 알람 감시가 원본 Date 를 씁니다(분 비교 + 날짜 기록).
    now,
    time: formatClock(now, use24),
    greeting: greetingFor(now.getHours()),
  };
}
