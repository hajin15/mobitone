import styled from '@emotion/styled';

import { Icon } from './Icon';
import type { Theme } from '../hooks/useTheme';

type TopBarProps = {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenAlarm: () => void;
  onOpenSettings: () => void;
  /** withForm 이면 곡 추가 폼이 열린 채로 시작합니다. */
  onOpenPlaylist: (withForm: boolean) => void;
};

export function TopBar({
  theme,
  onToggleTheme,
  onOpenAlarm,
  onOpenSettings,
  onOpenPlaylist,
}: TopBarProps) {
  const isDark = theme === 'dark';

  return (
    <Bar data-anim="top-bar">
      <Logo>MobiTone</Logo>

      <PlaylistPill>
        <PillLabel type="button" onClick={() => onOpenPlaylist(false)}>
          <Icon name="music_note" size={19} filled />
          <span>Playlist</span>
        </PillLabel>

        <PlusButton
          type="button"
          aria-label="플레이리스트에 곡 추가"
          onClick={() => onOpenPlaylist(true)}
        >
          <Icon name="add" size={20} />
        </PlusButton>
      </PlaylistPill>

      <IconGroup>
        <IconButton
          type="button"
          aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          onClick={onToggleTheme}
        >
          <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={20} />
        </IconButton>

        <IconButton type="button" aria-label="알람과 타이머" onClick={onOpenAlarm}>
          <Icon name="alarm" size={20} />
        </IconButton>

        <IconButton type="button" aria-label="설정" onClick={onOpenSettings}>
          <Icon name="settings" size={20} />
        </IconButton>

        {/* TODO: 메뉴 — 아직 핸들러가 없습니다. */}
        <IconButton type="button" aria-label="메뉴">
          <Icon name="menu" size={20} />
        </IconButton>
      </IconGroup>
    </Bar>
  );
}

const Bar = styled.header`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  padding: 36px 50px;
`;

const Logo = styled.div`
  font-size: 26px;
  font-weight: 800;
  flex: 1;
  color: var(--text-primary);
`;

const PlaylistPill = styled.div`
  flex: 1.4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: var(--pill-bg);
  border: 1px solid var(--pill-border);
  padding: 12px 12px 12px 28px;
  border-radius: 30px;
  font-size: 17px;
  max-width: 380px;
  margin: 0 auto;
  color: var(--text-secondary);
`;

const PillLabel = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
  background: none;
  border: none;
  padding: 6px 10px;
  border-radius: 20px;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  cursor: pointer;

  &:hover {
    background: var(--icon-hover);
  }
`;

const PlusButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: var(--icon-bg);
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconGroup = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 14px;
`;

const IconButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--icon-border);
  background: var(--icon-bg);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  transition: background 0.15s ease;

  &:hover {
    background: var(--icon-hover);
  }
`;
