// renderer.ts
// MobiTone 화면에서 동작하는 코드

console.log('🔥 새로운 renderer.ts 실행됨');


// ==================================================
// 전역 변수
// ==================================================

let youtubePlayer: any = null;
let isPlaying = false;


// ==================================================
// 1. 시계
// ==================================================

function updateClock() {

  const now = new Date();

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');

  const clockEl =
    document.getElementById('clock');

  if (clockEl) {
    clockEl.textContent = `${hh}:${mm}`;
  }
}


// ==================================================
// 2. 시간대별 인사말
// ==================================================

function updateGreeting() {

  const hour = new Date().getHours();

  let message = '안녕하세요';

  if (hour < 12) {
    message = '좋은 아침이에요';

  } else if (hour < 18) {
    message = '좋은 오후예요';

  } else {
    message = '좋은 저녁이에요';
  }

  const greetingEl =
    document.getElementById('greeting');

  if (greetingEl) {
    greetingEl.textContent = message;
  }
}


// 처음 실행
updateClock();
updateGreeting();


// 1초마다 시계 업데이트
setInterval(() => {

  updateClock();
  updateGreeting();

}, 1000);


// ==================================================
// 3. 재생 버튼
// ==================================================

const playBtn =
  document.getElementById('playBtn');

if (playBtn) {

  playBtn.addEventListener('click', () => {

    if (!youtubePlayer) {
      return;
    }

    if (isPlaying) {
      youtubePlayer.pauseVideo();
    } else {
      youtubePlayer.playVideo();
    }

  });

}


// ==================================================
// 4. 재생 버튼 모양 변경
// ==================================================

function updatePlayButton(playing: boolean) {

  isPlaying = playing;

  if (playBtn) {
    playBtn.textContent = playing ? '⏸' : '▶';
  }

}


// ==================================================
// 4-1. 곡 정보(제목/가수) 화면에 반영
// ==================================================

function updateTrackInfo() {

  if (!youtubePlayer) return;

  // getVideoData()는 공식 문서에 없는 값이지만 실무에서 널리 쓰이는 방법입니다.
  // title = 영상 제목, author = 채널(업로더) 이름
  const data = youtubePlayer.getVideoData?.();
  if (!data) return;

  const titleEl = document.getElementById('trackTitle');
  const artistEl = document.getElementById('trackArtist');

  if (titleEl && data.title) {
    titleEl.textContent = data.title;
  }

  if (artistEl && data.author) {
    artistEl.textContent = data.author;
  }
}


// ==================================================
// 4-2. 재생 진행바 + 시간 실시간 갱신
// ==================================================

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

let progressTimer: ReturnType<typeof setInterval> | null = null;

function startProgressLoop() {
  if (progressTimer) return; // 이미 돌고 있으면 중복 실행 방지

  progressTimer = setInterval(() => {

    if (!youtubePlayer) return;

    const current = youtubePlayer.getCurrentTime?.() ?? 0;
    const duration = youtubePlayer.getDuration?.() ?? 0;

    const fillEl = document.getElementById('progressFill');
    const currentLabel = document.getElementById('currentTimeLabel');
    const durationLabel = document.getElementById('durationLabel');

    if (fillEl && duration > 0) {
      const percent = (current / duration) * 100;
      fillEl.style.width = `${percent}%`;
    }

    if (currentLabel) currentLabel.textContent = formatTime(current);
    if (durationLabel) durationLabel.textContent = formatTime(duration);

  }, 500);
}

function stopProgressLoop() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}


// ==================================================
// 5. 라이트 / 다크 모드
// ==================================================

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY =
  'mobitone-theme';


const rootEl =
  document.documentElement;


const themeToggleBtn =
  document.getElementById(
    'themeToggleBtn'
  );


function applyTheme(
  theme: Theme
) {

  if (theme === 'dark') {

    rootEl.setAttribute(
      'data-theme',
      'dark'
    );

  }

  else {

    rootEl.removeAttribute(
      'data-theme'
    );

  }


  if (themeToggleBtn) {

    themeToggleBtn.textContent =
      theme === 'dark'
        ? '☀'
        : '🌙';

  }


  localStorage.setItem(
    THEME_STORAGE_KEY,
    theme
  );

}


const savedTheme =
  (localStorage.getItem(
    THEME_STORAGE_KEY
  ) as Theme | null)
  ?? 'light';


applyTheme(savedTheme);


themeToggleBtn?.addEventListener(
  'click',
  () => {

    const isDark =
      rootEl.getAttribute(
        'data-theme'
      ) === 'dark';


    applyTheme(
      isDark
        ? 'light'
        : 'dark'
    );

  }
);


// ==================================================
// 6. YouTube API 준비
// ==================================================

(window as any).onYouTubeIframeAPIReady = () => {

  youtubePlayer = new (window as any).YT.Player('youtube-player', {

    width: '480',
    height: '270',

    videoId: 'M7lc1UVf-VE',

    playerVars: {
      playsinline: 1,
      controls: 0, // 화면에 안 보이니 컨트롤도 필요 없어서 꺼둡니다
    },

    events: {

      // ----------------------------------
      // Player 준비 완료 → 화면에서 완전히 숨기기 (소리는 유지)
      // ----------------------------------
      onReady: () => {

        const youtubeElement = document.getElementById('youtube-player');

        if (youtubeElement) {
          youtubeElement.style.position = 'fixed';
          youtubeElement.style.left = '-9999px';   // 화면 밖으로 밀어냄
          youtubeElement.style.top = '-9999px';
          youtubeElement.style.opacity = '0';
          youtubeElement.style.pointerEvents = 'none';
        }

        updateTrackInfo();
      },

      // ----------------------------------
      // YouTube 재생 상태 변경
      // ----------------------------------
      onStateChange: (event: any) => {

        // 1 = 재생
        if (event.data === 1) {
          updatePlayButton(true);
          updateTrackInfo();
          startProgressLoop();
        }

        // 2 = 일시정지
        else if (event.data === 2) {
          updatePlayButton(false);
          stopProgressLoop();
        }

        // 0 = 종료
        else if (event.data === 0) {
          updatePlayButton(false);
          stopProgressLoop();
        }

      }

    }

  });

};


// ==================================================
// 7. YouTube IFrame API 스크립트 불러오기
// ==================================================

const youtubeScript =
  document.createElement(
    'script'
  );


youtubeScript.src =
  'https://www.youtube.com/iframe_api';


const firstScript =
  document.getElementsByTagName(
    'script'
  )[0];


if (
  firstScript &&
  firstScript.parentNode
) {

  firstScript.parentNode.insertBefore(
    youtubeScript,
    firstScript
  );

}


console.log(
  '📺 YouTube API 스크립트 추가 완료'
);