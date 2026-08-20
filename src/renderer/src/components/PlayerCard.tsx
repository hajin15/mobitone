import styled from '@emotion/styled';

import { Icon } from './Icon';
import { formatTime } from '../lib/format';
import type { PlayerState } from '../hooks/useYouTubePlayer';

export function PlayerCard({
  isReady,
  isPlaying,
  canPrev,
  track,
  progress,
  toggle,
  next,
  prev,
}: PlayerState) {
  return (
    // Anchor 가 가운데 정렬(translateX)을 담당합니다.
    // Card 의 transform 은 gsap 가 등장 애니메이션에 쓰기 때문에 비워둡니다.
    <Anchor>
      <Card data-anim="card">
        <AlbumArt />

        <TrackInfo>
          <TrackTitle title={track.title}>{track.title}</TrackTitle>
          <TrackArtist title={track.artist}>{track.artist}</TrackArtist>
        </TrackInfo>

        <Right>
          <ProgressRow>
            <TimeLabel>{formatTime(progress.current)}</TimeLabel>

            <ProgressBar>
              <ProgressFill style={{ width: `${progress.percent}%` }} />
            </ProgressBar>

            <TimeLabel>{formatTime(progress.duration)}</TimeLabel>
          </ProgressRow>

          <Controls>
            {/* 다음 = 유튜브 믹스의 다음 곡(= 지금 곡과 연관된 곡).
                이전 = 믹스에서 방금 들었던 곡. 믹스 첫 곡에서는 돌아갈 데가 없습니다. */}
            <ControlButton
              type="button"
              aria-label="이전 곡"
              onClick={prev}
              disabled={!isReady || !canPrev}
            >
              <Icon name="skip_previous" size={22} filled />
            </ControlButton>

            <PlayButton
              type="button"
              aria-label={isPlaying ? '일시정지' : '재생'}
              onClick={toggle}
              disabled={!isReady}
            >
              <Icon name={isPlaying ? 'pause' : 'play_arrow'} size={20} filled />
            </PlayButton>

            <ControlButton type="button" aria-label="다음 곡" onClick={next} disabled={!isReady}>
              <Icon name="skip_next" size={22} filled />
            </ControlButton>
          </Controls>
        </Right>
      </Card>
    </Anchor>
  );
}

const Anchor = styled.div`
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 64%;
  transform: translateX(-50%);
`;

const Card = styled.div`
  width: 700px;
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 22px;
  padding: 26px 34px;
  backdrop-filter: blur(18px);
  box-shadow: var(--card-shadow);
`;

const AlbumArt = styled.div`
  width: 76px;
  height: 76px;
  border-radius: 12px;
  background: var(--album-bg);
  flex-shrink: 0;
`;

const TrackInfo = styled.div`
  flex-shrink: 0;
  /* 제목이 아무리 길어도 이 너비를 넘지 않게 */
  max-width: 220px;
  overflow: hidden;
`;

const TrackTitle = styled.div`
  font-size: var(--fs-h3);
  font-weight: var(--fw-bold);
  color: var(--track-title-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackArtist = styled.div`
  font-size: var(--fs-sm);
  color: var(--track-artist-color);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
`;

const ProgressRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TimeLabel = styled.span`
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
  flex-shrink: 0;
  /* 숫자 폭이 흔들려서 진행바가 덜컹거리지 않게 */
  font-variant-numeric: tabular-nums;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--progress-track);
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: var(--progress-fill);
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: var(--control-color);
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--control-hover);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }

  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
`;

const PlayButton = styled(ControlButton)`
  background: linear-gradient(135deg, var(--playbtn-grad-start), var(--playbtn-grad-end));
  width: 48px;
  height: 48px;
  padding: 0;
  color: #ffffff;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
    background: linear-gradient(135deg, var(--playbtn-grad-start), var(--playbtn-grad-end));
  }
`;
