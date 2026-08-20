import { useState } from 'react';
import type { FormEvent } from 'react';
import styled from '@emotion/styled';

import { Icon } from './Icon';
import { parseVideoId } from '../lib/format';
import type { Track } from '../hooks/usePlaylist';

type Props = {
  tracks: Track[];
  /** 지금 재생 중인 영상 ID. 목록에서 강조하는 데 씁니다. */
  currentId: string;
  /** 지금 재생 중인 곡 정보. "지금 곡 담기" 에 씁니다. */
  currentTrack: { title: string; artist: string };
  /** 지금 곡이 이미 목록에 있는지 */
  hasCurrent: boolean;
  startWithForm: boolean;
  onPlay: (videoId: string) => void;
  onAddCurrent: () => void;
  onAddByUrl: (videoId: string) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
};

export function PlaylistScreen({
  tracks,
  currentId,
  currentTrack,
  hasCurrent,
  startWithForm,
  onPlay,
  onAddCurrent,
  onAddByUrl,
  onRemove,
  onBack,
}: Props) {
  const [isAdding, setIsAdding] = useState(startWithForm);
  const [url, setUrl] = useState('');
  const [invalid, setInvalid] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();

    const videoId = parseVideoId(url);
    if (!videoId) {
      setInvalid(true);
      return;
    }

    onAddByUrl(videoId);
    setUrl('');
    setInvalid(false);
    setIsAdding(false);
  }

  return (
    <Screen>
      <Header>
        <TextButton type="button" onClick={onBack}>
          <Icon name="arrow_back" size={20} />
          <span>뒤로</span>
        </TextButton>

        <TextButton type="button" onClick={onAddCurrent} disabled={!currentId || hasCurrent}>
          <Icon name="library_add" size={20} />
          <span>{hasCurrent ? '이미 담긴 곡' : '지금 곡 담기'}</span>
        </TextButton>
      </Header>

      <Title>
        <Icon name="music_note" size={30} filled />
        <span>플레이리스트</span>
      </Title>

      {currentId && !hasCurrent && (
        <NowPlaying>
          지금 재생 중: <strong>{currentTrack.title}</strong>
        </NowPlaying>
      )}

      <List>
        {tracks.length === 0 ? (
          <Empty>담아둔 곡이 없습니다. 아래에서 추가해 보세요.</Empty>
        ) : (
          tracks.map((track) => (
            <Row key={track.id} data-on={track.videoId === currentId || undefined}>
              <PlayButton
                type="button"
                onClick={() => onPlay(track.videoId)}
                aria-label={`${track.title} 재생`}
              >
                <Icon name={track.videoId === currentId ? 'graphic_eq' : 'play_arrow'} size={20} filled />
              </PlayButton>

              <RowText>
                <RowTitle title={track.title}>{track.title}</RowTitle>
                <RowArtist title={track.artist}>{track.artist}</RowArtist>
              </RowText>

              <IconButton
                type="button"
                onClick={() => onRemove(track.id)}
                aria-label={`${track.title} 목록에서 빼기`}
              >
                <Icon name="delete" size={20} />
              </IconButton>
            </Row>
          ))
        )}
      </List>

      {isAdding ? (
        <AddForm onSubmit={submit} data-invalid={invalid || undefined}>
          <UrlInput
            value={url}
            autoFocus
            spellCheck={false}
            aria-label="유튜브 주소"
            placeholder={invalid ? '유튜브 주소를 못 알아봤어요' : '유튜브 주소를 붙여넣으세요'}
            onChange={(e) => {
              setUrl(e.target.value);
              if (invalid) setInvalid(false);
            }}
          />

          <GhostButton type="button" onClick={() => setIsAdding(false)}>
            취소
          </GhostButton>

          <PrimaryButton type="submit" disabled={!url.trim()}>
            <Icon name="add" size={20} />
            <span>추가</span>
          </PrimaryButton>
        </AddForm>
      ) : (
        <PrimaryButton type="button" onClick={() => setIsAdding(true)}>
          <Icon name="add" size={20} />
          <span>주소로 곡 추가</span>
        </PrimaryButton>
      )}
    </Screen>
  );
}

const Screen = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 0 50px;
`;

const Header = styled.div`
  width: 100%;
  max-width: 720px;
  display: flex;
  justify-content: space-between;
`;

const TextButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 20px;
  font-family: inherit;
  font-size: var(--fs-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--icon-hover);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const Title = styled.h1`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: var(--fs-h1);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
`;

const NowPlaying = styled.div`
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
  max-width: 640px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  strong {
    color: var(--text-secondary);
    font-weight: var(--fw-semibold);
  }
`;

const List = styled.div`
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 46vh;
  overflow-y: auto;
`;

const Empty = styled.div`
  text-align: center;
  padding: 30px;
  font-size: var(--fs-md);
  color: var(--text-tertiary);
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(18px);

  &[data-on] {
    border-color: var(--progress-fill);
  }
`;

const PlayButton = styled.button`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--playbtn-grad-start), var(--playbtn-grad-end));
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    filter: brightness(1.08);
  }
`;

const RowText = styled.div`
  flex: 1;
  min-width: 0;
`;

const RowTitle = styled.div`
  font-size: var(--fs-md);
  font-weight: var(--fw-semibold);
  color: var(--track-title-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowArtist = styled.div`
  margin-top: 2px;
  font-size: var(--fs-xs);
  color: var(--track-artist-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  border: none;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--icon-hover);
  }
`;

const AddForm = styled.form`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px 12px 20px;
  border-radius: 20px;
  background: var(--bottom-bg);
  border: 1px solid var(--bottom-border);
  backdrop-filter: blur(10px);
  transition: border-color 0.2s ease;

  &[data-invalid] {
    border-color: #e2607a;
  }
`;

const UrlInput = styled.input`
  width: 380px;
  background: none;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: var(--fs-sm);
  color: var(--text-secondary);

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 22px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, var(--playbtn-grad-start), var(--playbtn-grad-end));
  font-family: inherit;
  font-size: var(--fs-md);
  color: #ffffff;
  cursor: pointer;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

const GhostButton = styled(PrimaryButton)`
  background: none;
  border: 1px solid var(--card-border);
  color: var(--text-secondary);

  &:hover:not(:disabled) {
    filter: none;
    background: var(--icon-hover);
  }
`;
