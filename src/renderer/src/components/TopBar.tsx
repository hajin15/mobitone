import { useEffect, useRef, useState } from 'react';
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

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 밖을 누르거나 Esc 를 누르면 닫습니다. 안 그러면 한 번 연 뒤
  // 항목을 고르기 전에는 빠져나갈 방법이 없습니다.
  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

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

        <MenuAnchor ref={menuRef}>
          <IconButton
            type="button"
            aria-label="창 메뉴"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name="menu" size={20} />
          </IconButton>

          {menuOpen && (
            <Menu role="menu">
              <MenuItem
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  window.mobitone?.minimize();
                }}
              >
                <Icon name="keyboard_arrow_down" size={20} />
                <MenuText>
                  <span>화면 닫기</span>
                  <MenuHint>작업표시줄에서 다시 열기</MenuHint>
                </MenuText>
              </MenuItem>

              <MenuItem
                type="button"
                role="menuitem"
                data-danger
                onClick={() => {
                  setMenuOpen(false);
                  window.mobitone?.quit();
                }}
              >
                <Icon name="power_settings_new" size={20} />
                <MenuText>
                  <span>화면 종료하기</span>
                  <MenuHint>Ctrl + Alt + Q</MenuHint>
                </MenuText>
              </MenuItem>
            </Menu>
          )}
        </MenuAnchor>
      </IconGroup>
    </Bar>
  );
}

const Bar = styled.header`
  position: relative;
  /* 화면 컨테이너들도 z-index:1 이라, DOM 에서 뒤에 오는 화면이 상단바를 덮습니다.
     ☰ 드롭다운은 상단바 박스 밖으로 삐져나오므로 한 칸 올려야 가려지지 않습니다.
     알람 오버레이(10)보다는 낮게 둡니다. */
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 36px 50px;
`;

const Logo = styled.div`
  font-size: var(--fs-h2);
  font-weight: var(--fw-black);
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
  font-size: var(--fs-lg);
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

const MenuAnchor = styled.div`
  position: relative;
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 5;
  width: 250px;
  display: flex;
  flex-direction: column;
  padding: 6px;
  border-radius: 18px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(18px);
  box-shadow: var(--card-shadow);
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: none;
  border-radius: 14px;
  background: none;
  font-family: inherit;
  text-align: left;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover {
    background: var(--icon-hover);
  }

  &[data-danger] {
    color: #e2607a;
  }
`;

const MenuText = styled.span`
  display: flex;
  flex-direction: column;
  font-size: var(--fs-md);
  font-weight: var(--fw-semibold);
`;

const MenuHint = styled.span`
  margin-top: 2px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-regular);
  color: var(--text-tertiary);
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
