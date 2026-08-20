// 화면에 값을 찍기 전에 거치는 순수 함수들.
// DOM/React를 모르기 때문에 node --test 로 바로 검증할 수 있습니다 (format.test.ts).

/** 초 → "m:ss". 재생 시간 표시용. */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Date → 시계 문자열.
 *
 * use24 가 true 면 "17:30", false 면 "오후 5:30". 설정 화면에서 고릅니다.
 * 인자를 생략하면 기존처럼 24시간제입니다.
 */
export function formatClock(date: Date, use24 = true): string {
  const hours = date.getHours();
  const mm = String(date.getMinutes()).padStart(2, '0');

  if (use24) return `${String(hours).padStart(2, '0')}:${mm}`;

  // 0시와 12시는 둘 다 "12시"로 적습니다(0시가 되면 안 됩니다).
  const meridiem = hours < 12 ? '오전' : '오후';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${meridiem} ${hour12}:${mm}`;
}

/** 시(0-23) → 시간대별 인사말. */
export function greetingFor(hour: number): string {
  if (hour < 12) return '좋은 아침이에요';
  if (hour < 18) return '좋은 오후예요';
  return '좋은 저녁이에요';
}

/** 진행바 채움 비율(0-100). duration 이 아직 0이거나 이상값이면 0. */
export function progressPercent(current: number, duration: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(duration)) return 0;
  if (duration <= 0) return 0;

  return Math.min(100, Math.max(0, (current / duration) * 100));
}

const VIDEO_ID = /^[\w-]{11}$/;

/**
 * 유튜브 주소(또는 ID 자체) → 영상 ID. 알아볼 수 없으면 null.
 * watch?v=, youtu.be/, /embed/, /shorts/, /live/ 를 모두 받습니다.
 */
export function parseVideoId(input: string): string | null {
  const text = input.trim();
  if (!text) return null;

  if (VIDEO_ID.test(text)) return text;

  try {
    // 프로토콜 없이 "youtu.be/..." 만 붙여넣는 경우가 흔합니다.
    const url = new URL(/^https?:\/\//.test(text) ? text : `https://${text}`);

    const v = url.searchParams.get('v');
    if (v && VIDEO_ID.test(v)) return v;

    // youtu.be/ID, /embed/ID, /shorts/ID, /live/ID 는 마지막 경로 조각이 ID입니다.
    const last = url.pathname.split('/').filter(Boolean).pop();
    return last && VIDEO_ID.test(last) ? last : null;
  } catch {
    return null;
  }
}

/** 초 → "HH:MM:SS". 타이머 남은 시간 표시용. */
export function formatCountdown(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00:00';

  const total = Math.floor(seconds);
  const hh = String(Math.floor(total / 3600)).padStart(2, '0');
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}
