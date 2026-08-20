import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { progressPercent } from '../lib/format';

// 우리가 실제로 쓰는 메서드만 좁게 선언합니다.
type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  nextVideo(): void;
  getCurrentTime?(): number;
  getDuration?(): number;
  getPlaylistIndex?(): number;
  loadPlaylist?(options: { list: string; listType?: string; index?: number }): void;
  loadVideoById?(videoId: string): void;
  // getVideoData()는 공식 문서에 없지만 널리 쓰이는 값입니다.
  // title = 영상 제목, author = 채널(업로더) 이름, video_id = 지금 재생 중인 영상 ID
  getVideoData?(): { title?: string; author?: string; video_id?: string };
  destroy?(): void;
};

const API_SRC = 'https://www.youtube.com/iframe_api';

// 재생 불가 영상을 만났을 때 몇 곡까지 자동으로 건너뛸지.
// 없으면 전부 막힌 믹스에서 무한히 넘어갑니다.
const MAX_AUTO_SKIP = 3;

// IFrame API 는 전역 콜백(onYouTubeIframeAPIReady) 하나만 받기 때문에
// 스크립트를 한 번만 넣고 그 결과를 Promise 로 공유합니다.
let apiReady: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (apiReady) return apiReady;

  apiReady = new Promise<void>((resolve) => {
    const w = window as any;

    if (w.YT?.Player) {
      resolve();
      return;
    }

    w.onYouTubeIframeAPIReady = () => resolve();

    const script = document.createElement('script');
    script.src = API_SRC;
    document.head.appendChild(script);
  });

  return apiReady;
}

export type PlayerState = {
  isReady: boolean;
  isPlaying: boolean;
  canPrev: boolean;
  /** 지금 재생 중인 영상 ID. 아직 아무것도 안 틀었으면 빈 문자열. */
  currentId: string;
  track: { title: string; artist: string };
  progress: { current: number; duration: number; percent: number };
  toggle: () => void;
  next: () => void;
  prev: () => void;
};

/**
 * 소리만 쓰는 숨은 YouTube 플레이어.
 *
 * 사용자가 고른 영상을 그대로 재생합니다. "다음" 을 처음 누르는 순간에만 그 곡을
 * 씨앗으로 하는 유튜브 자동 믹스(RD + 영상ID)를 물려서, 이후로는 연관된 곡이
 * 이어집니다. 처음부터 믹스를 물리면 엉뚱한 곡이 나오거나(믹스가 씨앗 곡부터
 * 시작하지 않음) 믹스가 없는 영상(브이로그 등)은 아예 재생되지 않습니다.
 *
 * "이전" 도 같은 이유로 믹스에 맡기지 않고, 실제로 재생한 영상 ID 를 직접
 * 쌓아두었다가 되짚습니다.
 *
 * hostRef 안에 마운트용 div 를 직접 만들어 넣습니다. YT.Player 는 넘겨받은
 * 엘리먼트를 iframe 으로 "교체"하기 때문에, React 가 렌더한 div 를 그대로
 * 주면 StrictMode 의 이중 마운트에서 대상이 사라져 두 번째 생성이 실패합니다.
 */
export function useYouTubePlayer(
  videoId: string,
  hostRef: RefObject<HTMLElement | null>,
  /** 앱을 켜자마자 재생할지. 곡을 바꿨을 때는 이 값과 무관하게 항상 재생합니다. */
  autoPlayOnStart = false,
): PlayerState {
  const playerRef = useRef<YTPlayer | null>(null);
  // 앱을 켠 직후인지, 사용자가 곡을 바꾼 것인지 구분합니다.
  // 시작할 때는 곡만 물려두고, 곡을 바꿨을 때만 바로 틀어줍니다.
  const lastIdRef = useRef(videoId);
  const skipsRef = useRef(0);
  // 실제로 재생된 영상 ID 를 순서대로 쌓고, 그 안의 어디를 듣고 있는지를 가리킵니다.
  // 브라우저의 뒤로/앞으로 와 같은 규칙이라 이전↔다음 이 대칭이 됩니다.
  // 믹스의 previousVideo() 를 쓰지 않는 이유: 믹스 0번이 사용자가 넣은 영상이라는
  // 보장이 없어서 "이전" 이 엉뚱한 곡으로 갑니다.
  const historyRef = useRef<string[]>([]);
  const cursorRef = useRef(-1);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [track, setTrack] = useState({ title: '노래 제목', artist: '가수 이름' });
  const [progress, setProgress] = useState({ current: 0, duration: 0, percent: 0 });

  // 커서는 ref, 버튼 활성화는 state 라서 항상 같이 움직여야 합니다.
  const moveTo = useCallback((position: number) => {
    cursorRef.current = position;
    setCanPrev(position > 0);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;

    const isSwitch = lastIdRef.current !== videoId;
    lastIdRef.current = videoId;

    skipsRef.current = 0;

    const mount = document.createElement('div');
    host.appendChild(mount);

    function readTrack(player: YTPlayer) {
      const data = player.getVideoData?.();
      if (!data) return;

      setTrack({
        title: data.title || '노래 제목',
        artist: data.author || '가수 이름',
      });

      if (data.video_id) setCurrentId(data.video_id);
    }

    loadYouTubeApi().then(() => {
      if (cancelled) return;

      const player: YTPlayer = new (window as any).YT.Player(mount, {
        // 사용자가 넣은 영상을 그대로 재생합니다. 믹스는 "다음" 을 누른 뒤에 붙습니다.
        videoId,
        playerVars: {
          playsinline: 1,
          controls: 0, // 화면에 안 보이니 컨트롤도 필요 없습니다
        },
        events: {
          onReady: () => {
            if (cancelled) return;
            setIsReady(true);
            readTrack(player);

            // 곡을 바꾼 경우엔 항상, 앱을 막 켠 경우엔 설정을 따릅니다.
            if (isSwitch || autoPlayOnStart) player.playVideo();
          },
          onStateChange: (event: { data: number }) => {
            if (cancelled) return;

            // 1 = 재생, 2 = 일시정지, 0 = 종료
            setIsPlaying(event.data === 1);

            if (event.data === 1) {
              readTrack(player);
              skipsRef.current = 0; // 한 곡이라도 재생됐으면 스킵 카운터를 되돌립니다

              const playing = player.getVideoData?.()?.video_id;
              const history = historyRef.current;

              // 지금 가리키는 곡과 같으면 이전/다음으로 이동해 온 것이므로 그대로 둡니다.
              // (일시정지 후 재개로 기록이 불어나는 것도 이 비교가 막아줍니다)
              if (playing && history[cursorRef.current] !== playing) {
                // 뒤로 간 상태에서 새 곡이 시작되면 앞쪽 기록은 버립니다.
                history.splice(cursorRef.current + 1);
                history.push(playing);
                moveTo(history.length - 1);
              }
            }
          },
          onError: () => {
            if (cancelled) return;

            // 믹스를 도는 중에만 자동으로 넘깁니다. 사용자가 직접 넣은 영상이
            // 막혀 있는 경우엔 멋대로 다른 곡을 틀지 않고 그대로 둡니다.
            if ((player.getPlaylistIndex?.() ?? -1) < 0) return;
            if (skipsRef.current >= MAX_AUTO_SKIP) return;
            skipsRef.current += 1;
            player.nextVideo();
          },
        },
      });

      playerRef.current = player;
    });

    return () => {
      cancelled = true;

      try {
        playerRef.current?.destroy?.();
      } catch {
        // 이미 정리된 경우는 무시합니다
      }

      playerRef.current = null;
      mount.remove();
    };
  }, [videoId, hostRef, moveTo, autoPlayOnStart]);

  // 재생 중일 때만 진행바를 돌립니다. 멈추면 마지막 값에서 그대로 멈춥니다.
  useEffect(() => {
    if (!isPlaying) return;

    const id = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      const current = player.getCurrentTime?.() ?? 0;
      const duration = player.getDuration?.() ?? 0;

      setProgress({ current, duration, percent: progressPercent(current, duration) });
    }, 500);

    return () => clearInterval(id);
  }, [isPlaying]);

  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [isPlaying]);

  const next = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    const history = historyRef.current;
    const forward = cursorRef.current + 1;

    // 뒤로 갔다 온 상태라면, 되돌아가기 전에 듣던 그 곡으로 복귀합니다.
    if (forward < history.length) {
      moveTo(forward);
      player.loadVideoById?.(history[forward]);
      return;
    }

    // 기록의 끝 = 새 곡을 찾을 차례.
    // 믹스를 돌고 있으면 그냥 다음 곡.
    if ((player.getPlaylistIndex?.() ?? -1) >= 0) {
      player.nextVideo();
      return;
    }

    // 단일 영상 재생 중이면 지금 곡을 씨앗으로 믹스를 만들고
    // 두 번째 곡(= 지금 곡과 연관된 곡)부터 재생합니다.
    const seed = history[cursorRef.current] ?? videoId;
    player.loadPlaylist?.({ listType: 'playlist', list: `RD${seed}`, index: 1 });
  }, [videoId, moveTo]);

  const prev = useCallback(() => {
    const player = playerRef.current;
    const back = cursorRef.current - 1;
    if (!player || back < 0) return;

    moveTo(back);
    player.loadVideoById?.(historyRef.current[back]);
  }, [moveTo]);

  return {
    isReady,
    isPlaying,
    canPrev,
    currentId,
    track,
    progress,
    toggle,
    next,
    prev,
  };
}
