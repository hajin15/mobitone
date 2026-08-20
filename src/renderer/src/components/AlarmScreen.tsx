import { useState } from 'react';
import type { FormEvent } from 'react';
import styled from '@emotion/styled';

import { Icon } from './Icon';
import type { Alarm } from '../lib/alarm';

type Props = {
  alarms: Alarm[];
  onAdd: (time: string, repeat: boolean) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onBack: () => void;
  onGoTimer: () => void;
};

export function AlarmScreen({ alarms, onAdd, onRemove, onToggle, onBack, onGoTimer }: Props) {
  const [time, setTime] = useState('07:00');
  const [repeat, setRepeat] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    onAdd(time, repeat);
  }

  return (
    <Screen>
      <Header>
        <TextButton type="button" onClick={onBack}>
          <Icon name="arrow_back" size={20} />
          <span>뒤로</span>
        </TextButton>

        <TextButton type="button" onClick={onGoTimer}>
          <span>타이머</span>
          <Icon name="hourglass_empty" size={20} />
        </TextButton>
      </Header>

      <Title>
        <Icon name="alarm" size={30} filled />
        <span>알람</span>
      </Title>

      <List>
        {alarms.length === 0 ? (
          <Empty>맞춰둔 알람이 없습니다.</Empty>
        ) : (
          alarms.map((alarm) => (
            <Row key={alarm.id} data-off={!alarm.enabled || undefined}>
              <RowTime>{alarm.time}</RowTime>
              <RowRepeat>{alarm.repeat ? '매일' : '한 번'}</RowRepeat>

              <SwitchButton
                type="button"
                onClick={() => onToggle(alarm.id)}
                aria-label={alarm.enabled ? '알람 끄기' : '알람 켜기'}
                data-on={alarm.enabled || undefined}
              >
                {alarm.enabled ? '켬' : '끔'}
              </SwitchButton>

              <IconButton
                type="button"
                onClick={() => onRemove(alarm.id)}
                aria-label={`${alarm.time} 알람 삭제`}
              >
                <Icon name="delete" size={20} />
              </IconButton>
            </Row>
          ))
        )}
      </List>

      <AddForm onSubmit={submit}>
        <TimeInput
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label="알람 시각"
          required
        />

        <RepeatLabel>
          <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />
          <span>매일 반복</span>
        </RepeatLabel>

        <AddButton type="submit">
          <Icon name="add" size={20} />
          <span>알람 추가</span>
        </AddButton>
      </AddForm>
    </Screen>
  );
}

const Screen = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
  padding: 0 50px;
`;

const Header = styled.div`
  width: 100%;
  max-width: 640px;
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
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
`;

const List = styled.div`
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* 알람이 늘어나도 화면 밖으로 밀려나지 않게 */
  max-height: 42vh;
  overflow-y: auto;
`;

const Empty = styled.div`
  text-align: center;
  padding: 28px;
  font-size: 16px;
  color: var(--text-tertiary);
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 22px;
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(18px);
  transition: opacity 0.15s ease;

  &[data-off] {
    opacity: 0.45;
  }
`;

const RowTime = styled.span`
  font-size: 26px;
  font-weight: 700;
  color: var(--track-title-color);
  font-variant-numeric: tabular-nums;
`;

const RowRepeat = styled.span`
  flex: 1;
  font-size: 15px;
  color: var(--text-tertiary);
`;

const SwitchButton = styled.button`
  min-width: 52px;
  padding: 7px 0;
  border-radius: 14px;
  border: 1px solid var(--card-border);
  background: none;
  font-family: inherit;
  font-size: 14px;
  color: var(--text-tertiary);
  cursor: pointer;

  &[data-on] {
    background: linear-gradient(135deg, var(--playbtn-grad-start), var(--playbtn-grad-end));
    border-color: transparent;
    color: #ffffff;
  }
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
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
  gap: 16px;
  padding: 14px 20px;
  border-radius: 20px;
  background: var(--bottom-bg);
  border: 1px solid var(--bottom-border);
  backdrop-filter: blur(10px);
`;

const TimeInput = styled.input`
  background: none;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
`;

const RepeatLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: var(--text-secondary);
  cursor: pointer;
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, var(--playbtn-grad-start), var(--playbtn-grad-end));
  font-family: inherit;
  font-size: 15px;
  color: #ffffff;
  cursor: pointer;

  &:hover {
    filter: brightness(1.08);
  }
`;
