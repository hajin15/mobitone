import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

import { GlobalStyles } from './styles/GlobalStyles';
import { TopBar } from './components/TopBar';
import { CenterDisplay } from './components/CenterDisplay';
import { PlayerCard } from './components/PlayerCard';
import { UrlBar } from './components/UrlBar';
import { AlarmScreen } from './components/AlarmScreen';
import { TimerScreen } from './components/TimerScreen';
import { RingingOverlay } from './components/RingingOverlay';
import { SettingsScreen } from './components/SettingsScreen';
import { PlaylistScreen } from './components/PlaylistScreen';
import { useClock } from './hooks/useClock';
import { useTheme } from './hooks/useTheme';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { useIntroAnimation } from './hooks/useIntroAnimation';
import { useAlarms } from './hooks/useAlarms';
import { useTimer } from './hooks/useTimer';
import { useSettings } from './hooks/useSettings';
import { usePlaylist } from './hooks/usePlaylist';
import { parseVideoId } from './lib/format';

// 아무 기록도 없는 첫 실행에서만 쓰이는 곡(YouTube API 데모 영상).
const DEFAULT_VIDEO_ID = 'M7lc1UVf-VE';

// 마지막으로 듣던 곡. Electron 이 localStorage 를 디스크에 보관해주므로
// 앱을 껐다 켜도 남아 있습니다.
const LAST_VIDEO_KEY = 'mobitone:last-video';

/** 상단바는 어느 화면에서나 남습니다. 가운데 내용만 갈아끼웁니다. */
type Screen = 'home' | 'alarm' | 'timer' | 'settings' | 'playlist';

function loadLastVideoId(): string {
  // 저장된 값이 손상됐을 수도 있으니 입력창과 같은 검사를 거칩니다.
  return parseVideoId(localStorage.getItem(LAST_VIDEO_KEY) ?? '') ?? DEFAULT_VIDEO_ID;
}

export function App() {
  const shellRef = useRef<HTMLDivElement>(null);
  const youtubeHostRef = useRef<HTMLDivElement>(null);

  const [videoId, setVideoId] = useState(loadLastVideoId);

  const [screen, setScreen] = useState<Screen>('home');
  // 상단바의 + 로 들어오면 곡 추가 폼을 펼친 채로 엽니다.
  const [playlistWithForm, setPlaylistWithForm] = useState(false);

  const { settings, update, reset } = useSettings();
  const playlist = usePlaylist();

  const { theme, toggleTheme } = useTheme();
  const { now, time, greeting } = useClock(settings.clock24);
  const player = useYouTubePlayer(videoId, youtubeHostRef, settings.autoPlay);
  const alarms = useAlarms(now);
  const timer = useTimer();

  useIntroAnimation(shellRef);

  const goHome = useCallback(() => setScreen('home'), []);

  const openPlaylist = useCallback((withForm: boolean) => {
    setPlaylistWithForm(withForm);
    setScreen('playlist');
  }, []);

  // 목록에서 곡을 고르면 그 곡을 틀고 홈으로 돌아옵니다.
  const playFromPlaylist = useCallback((id: string) => {
    setVideoId(id);
    setScreen('home');
  }, []);

  // 어느 화면에서든 Esc 로 홈에 돌아옵니다.
  useEffect(() => {
    if (screen === 'home') return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setScreen('home');
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen]);

  // 곡이 바뀔 때마다 기억해 둡니다. 다음 실행 때 이 곡을 물고 시작합니다.
  useEffect(() => {
    if (player.currentId) localStorage.setItem(LAST_VIDEO_KEY, player.currentId);
  }, [player.currentId]);

  return (
    <>
      <GlobalStyles />

      <Shell ref={shellRef}>
        <Blob data-anim="blob" index={1} />
        <Blob data-anim="blob" index={2} />
        <Blob data-anim="blob" index={3} />

        <TopBar
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenAlarm={() => setScreen('alarm')}
          onOpenSettings={() => setScreen('settings')}
          onOpenPlaylist={openPlaylist}
        />

        {screen === 'home' && (
          <>
            <CenterDisplay time={time} greeting={greeting} subtitle={settings.subtitle} />
            <PlayerCard {...player} />
            <UrlBar onSubmit={setVideoId} />
          </>
        )}

        {screen === 'alarm' && (
          <AlarmScreen
            alarms={alarms.alarms}
            onAdd={alarms.add}
            onRemove={alarms.remove}
            onToggle={alarms.toggle}
            onBack={goHome}
            onGoTimer={() => setScreen('timer')}
          />
        )}

        {screen === 'timer' && (
          <TimerScreen
            remaining={timer.remaining}
            isRunning={timer.isRunning}
            onStart={timer.start}
            onPause={timer.pause}
            onResume={timer.resume}
            onReset={timer.reset}
            onBack={goHome}
            onGoAlarm={() => setScreen('alarm')}
          />
        )}

        {screen === 'playlist' && (
          <PlaylistScreen
            tracks={playlist.tracks}
            currentId={player.currentId}
            currentTrack={player.track}
            hasCurrent={playlist.has(player.currentId)}
            startWithForm={playlistWithForm}
            onPlay={playFromPlaylist}
            onAddCurrent={() => void playlist.addByVideoId(player.currentId)}
            onAddByUrl={playlist.addByVideoId}
            onRemove={playlist.remove}
            onBack={goHome}
          />
        )}

        {screen === 'settings' && (
          <SettingsScreen settings={settings} onUpdate={update} onReset={reset} onBack={goHome} />
        )}

        {/* 알람이 먼저입니다. 둘이 겹치면 타이머는 알람을 끈 뒤에 뜹니다. */}
        {alarms.ringing && (
          <RingingOverlay
            label={`알람 ${alarms.ringing.time}`}
            volume={settings.alarmVolume}
            autoStopSec={settings.alarmAutoStopSec}
            onStop={alarms.stopRinging}
          />
        )}

        {!alarms.ringing && timer.isDone && (
          <RingingOverlay
            label="타이머 종료"
            volume={settings.alarmVolume}
            autoStopSec={settings.alarmAutoStopSec}
            onStop={timer.reset}
          />
        )}

        {/* 소리만 쓰는 YouTube iframe 이 이 안에 마운트됩니다 (화면 밖) */}
        <YouTubeHost ref={youtubeHostRef} />
      </Shell>
    </>
  );
}

const Shell = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const BLOB_GEOMETRY = {
  1: css`
    width: 650px;
    height: 650px;
    top: -180px;
    left: -150px;
    background: var(--blob-1);
  `,
  2: css`
    width: 600px;
    height: 600px;
    bottom: -200px;
    left: -120px;
    background: var(--blob-2);
  `,
  3: css`
    width: 550px;
    height: 550px;
    bottom: -150px;
    right: -180px;
    background: var(--blob-3);
  `,
} as const;

const Blob = styled.div<{ index: 1 | 2 | 3 }>`
  position: absolute;
  border-radius: 50%;
  filter: blur(var(--blob-blur));
  /* transform 이 아니라 독립 scale 속성을 씁니다.
     transform 은 gsap 의 유영 애니메이션이 소유합니다. */
  scale: var(--blob-scale);
  z-index: 0;
  opacity: var(--blob-opacity);
  mix-blend-mode: var(--blob-blend);
  transition: opacity 0.3s ease;

  ${({ index }) => BLOB_GEOMETRY[index]}
`;

// 소리만 필요하므로 화면 밖으로 밀어냅니다.
// display:none 이나 visibility:hidden 을 쓰면 YouTube 가 재생을 거부할 수 있습니다.
const YouTubeHost = styled.div`
  position: fixed;
  left: -9999px;
  top: -9999px;
  width: 480px;
  height: 270px;
  opacity: 0;
  pointer-events: none;
`;
