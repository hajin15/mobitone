import { useEffect, useState } from 'react';

import { formatClock, greetingFor } from '../lib/format';

/** 1초마다 갱신되는 시계 + 시간대별 인사말. */
export function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return {
    time: formatClock(now),
    greeting: greetingFor(now.getHours()),
  };
}
