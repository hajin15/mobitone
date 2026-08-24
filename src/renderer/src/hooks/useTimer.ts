import { useCallback, useEffect, useState } from 'react';

/**
 * 초 단위 카운트다운.
 *
 * 화면이 아니라 App 이 들고 있습니다. 홈으로 돌아가도 계속 돌아야 하기 때문입니다.
 */
export function useTimer() {
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  // 0 에 닿으면 멈춥니다. setRemaining 안에서 처리하면 StrictMode 의
  // 이중 호출에서 종료가 두 번 잡히므로 따로 봅니다.
  useEffect(() => {
    if (!isRunning || remaining > 0) return;

    setIsRunning(false);
    setIsDone(true);
  }, [isRunning, remaining]);

  const start = useCallback((seconds: number) => {
    if (seconds <= 0) return;

    setRemaining(seconds);
    setIsDone(false);
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);

  // setRemaining 안에서 setIsRunning 을 부르면 StrictMode 의 이중 호출에
  // 걸립니다. 남은 시간은 이미 이 자리에서 볼 수 있으니 그대로 씁니다.
  const resume = useCallback(() => {
    if (remaining > 0) setIsRunning(true);
  }, [remaining]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsDone(false);
    setRemaining(0);
  }, []);

  const dismiss = useCallback(() => setIsDone(false), []);

  return { remaining, isRunning, isDone, start, pause, resume, reset, dismiss };
}
