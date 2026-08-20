import { useEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';

/**
 * 등장 타임라인 + 배경 블롭 유영.
 *
 * gsap.context 로 감싸면 scope 안의 선택자만 잡고, revert() 한 번으로 이 훅이
 * 건드린 인라인 스타일을 모두 되돌립니다. StrictMode 이중 마운트에서도 안전합니다.
 *
 * 주의: gsap 은 transform 을 인라인으로 씁니다. 그래서 블롭의 테마별 확대는
 * CSS 의 독립 `scale` 속성으로 빼두었습니다(GlobalStyles.tsx). transform 으로
 * 되돌리면 gsap 의 x/y 와 충돌합니다.
 */
export function useIntroAnimation(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!scope.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('[data-anim="top-bar"]', { y: -24, opacity: 0, duration: 0.6 })
        .from('[data-anim="clock"]', { y: 28, opacity: 0, duration: 0.7 }, '-=0.35')
        .from('[data-anim="line"]', { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.45')
        .from('[data-anim="card"]', { y: 40, opacity: 0, duration: 0.7 }, '-=0.35')
        .from('[data-anim="bottom-bar"]', { y: 24, opacity: 0, duration: 0.5 }, '-=0.5');

      // 블롭이 아주 느리게 떠다닙니다. 각자 주기가 달라서 패턴이 눈에 안 띕니다.
      gsap.utils.toArray<HTMLElement>('[data-anim="blob"]').forEach((blob, i) => {
        gsap.to(blob, {
          x: 'random(-70, 70)',
          y: 'random(-50, 50)',
          duration: 14 + i * 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, scope);

    return () => ctx.revert();
  }, [scope]);
}
