import styled from '@emotion/styled';

import { Icon } from './Icon';
import type { Settings } from '../hooks/useSettings';

const VOLUMES = [0.1, 0.25, 0.5, 0.75, 1] as const;
const AUTO_STOPS = [30, 60, 180, 300] as const;

function autoStopLabel(seconds: number): string {
  return seconds < 60 ? `${seconds}초` : `${seconds / 60}분`;
}

type Props = {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onReset: () => void;
  onBack: () => void;
};

export function SettingsScreen({ settings, onUpdate, onReset, onBack }: Props) {
  return (
    <Screen>
      <Header>
        <TextButton type="button" onClick={onBack}>
          <Icon name="arrow_back" size={20} />
          <span>뒤로</span>
        </TextButton>

        <TextButton type="button" onClick={onReset}>
          <Icon name="restart_alt" size={20} />
          <span>기본값으로</span>
        </TextButton>
      </Header>

      <Title>
        <Icon name="settings" size={30} filled />
        <span>설정</span>
      </Title>

      <Panel>
        <Item>
          <ItemText>
            <ItemName>시계 표시</ItemName>
            <ItemHint>{settings.clock24 ? '17:30 처럼' : '오후 5:30 처럼'}</ItemHint>
          </ItemText>

          <Chips>
            <Chip
              type="button"
              data-on={settings.clock24 || undefined}
              onClick={() => onUpdate('clock24', true)}
            >
              24시간제
            </Chip>
            <Chip
              type="button"
              data-on={!settings.clock24 || undefined}
              onClick={() => onUpdate('clock24', false)}
            >
              오전/오후
            </Chip>
          </Chips>
        </Item>

        <Item>
          <ItemText>
            <ItemName>화면 문구</ItemName>
            <ItemHint>시계 아래에 뜨는 한 줄</ItemHint>
          </ItemText>

          <TextInput
            value={settings.subtitle}
            maxLength={40}
            placeholder="예: 오늘도 화이팅"
            aria-label="화면 문구"
            onChange={(e) => onUpdate('subtitle', e.target.value)}
          />
        </Item>

        <Item>
          <ItemText>
            <ItemName>켤 때 음악 자동 재생</ItemName>
            <ItemHint>끄면 곡만 물려두고 기다립니다</ItemHint>
          </ItemText>

          <Switch
            type="button"
            data-on={settings.autoPlay || undefined}
            onClick={() => onUpdate('autoPlay', !settings.autoPlay)}
          >
            {settings.autoPlay ? '켬' : '끔'}
          </Switch>
        </Item>

        <Item>
          <ItemText>
            <ItemName>알람음 크기</ItemName>
            <ItemHint>{`지금 ${Math.round(settings.alarmVolume * 100)}%`}</ItemHint>
          </ItemText>

          <Chips>
            {VOLUMES.map((value) => (
              <Chip
                key={value}
                type="button"
                data-on={settings.alarmVolume === value || undefined}
                onClick={() => onUpdate('alarmVolume', value)}
              >
                {`${Math.round(value * 100)}%`}
              </Chip>
            ))}
          </Chips>
        </Item>

        <Item>
          <ItemText>
            <ItemName>알람 자동 정지</ItemName>
            <ItemHint>중지를 안 눌렀을 때 스스로 멎기까지</ItemHint>
          </ItemText>

          <Chips>
            {AUTO_STOPS.map((value) => (
              <Chip
                key={value}
                type="button"
                data-on={settings.alarmAutoStopSec === value || undefined}
                onClick={() => onUpdate('alarmAutoStopSec', value)}
              >
                {autoStopLabel(value)}
              </Chip>
            ))}
          </Chips>
        </Item>

        <Item>
          <ItemText>
            <ItemName>Windows 시작 시 자동 실행</ItemName>
            <ItemHint>컴퓨터를 켜면 이 앱도 같이 뜹니다</ItemHint>
          </ItemText>

          <Switch
            type="button"
            data-on={settings.launchAtLogin || undefined}
            onClick={() => onUpdate('launchAtLogin', !settings.launchAtLogin)}
          >
            {settings.launchAtLogin ? '켬' : '끔'}
          </Switch>
        </Item>
      </Panel>
    </Screen>
  );
}

const Screen = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
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
  font-size: 16px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--icon-hover);
  }
`;

const Title = styled.h1`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  color: var(--text-primary);
`;

const Panel = styled.div`
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  border-radius: 22px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(18px);
  box-shadow: var(--card-shadow);
  /* 항목이 늘어나도 화면 밖으로 밀려나지 않게 */
  max-height: 56vh;
  overflow-y: auto;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 26px;

  & + & {
    border-top: 1px solid var(--card-border);
  }
`;

const ItemText = styled.div`
  min-width: 0;
`;

const ItemName = styled.div`
  font-size: 17px;
  font-weight: 600;
  color: var(--track-title-color);
`;

const ItemHint = styled.div`
  margin-top: 3px;
  font-size: 14px;
  color: var(--text-tertiary);
`;

const Chips = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const Chip = styled.button`
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--icon-bg);
  font-family: inherit;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover {
    background: var(--icon-hover);
  }

  &[data-on] {
    background: linear-gradient(135deg, var(--playbtn-grad-start), var(--playbtn-grad-end));
    border-color: transparent;
    color: #ffffff;
    font-weight: 700;
  }
`;

const Switch = styled(Chip)`
  min-width: 58px;
`;

const TextInput = styled.input`
  width: 280px;
  flex-shrink: 0;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--icon-bg);
  outline: none;
  font-family: inherit;
  font-size: 15px;
  color: var(--text-secondary);

  &::placeholder {
    color: var(--text-tertiary);
  }
`;
