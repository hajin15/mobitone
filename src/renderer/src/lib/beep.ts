// 음원 파일 없이 브라우저가 직접 만들어내는 알람음.
// 인터넷이 끊겨 있어도, 유튜브가 막혀 있어도 확실히 울립니다.

const TONE_HZ = 880;
const TONE_SECONDS = 0.14;
const REPEAT_MS = 800;

let context: AudioContext | null = null;

function getContext(): AudioContext {
  // AudioContext 는 비싸서 하나만 만들어 재사용합니다.
  context ??= new AudioContext();

  // 사용자 조작 전에 만들어졌으면 멈춘 상태로 시작합니다.
  if (context.state === 'suspended') void context.resume();

  return context;
}

function playTone(ctx: AudioContext, volume: number) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.frequency.value = TONE_HZ;
  oscillator.connect(gain);
  gain.connect(ctx.destination);

  // 소리를 뚝 끊으면 '틱' 하는 잡음이 생기므로 볼륨을 부드럽게 눕힙니다.
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  // exponentialRamp 는 0 을 못 받아서 아주 작은 값으로 바닥을 깝니다.
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + TONE_SECONDS);

  oscillator.start(now);
  oscillator.stop(now + TONE_SECONDS);
}

/** 알람음을 반복 재생하고, 멈추는 함수를 돌려줍니다. volume 은 0~1. */
export function startBeeping(volume = 0.25): () => void {
  const ctx = getContext();

  playTone(ctx, volume);
  const id = setInterval(() => playTone(ctx, volume), REPEAT_MS);

  return () => clearInterval(id);
}
