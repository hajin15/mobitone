import { useState } from 'react';
import type { FormEvent } from 'react';
import styled from '@emotion/styled';

import { Icon } from './Icon';
import type { Alarm } from '../lib/alarm';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

/** 고른 시각이 오전인지 오후인지 한눈에 확인할 수 있게. */
function meridiemLabel(hour: string): string {
  const value = Number(hour);

  if (value === 0) return '오전 12시';
  if (value < 12) return `오전 ${value}시`;
  if (value === 12) return '오후 12시';

  return `오후 ${value - 12}시`;
}

type Props = {
  alarms: Alarm[];
  onAdd: (time: string, repeat: boolean) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onBack: () => void;
  onGoTimer: () => void;
};

export function AlarmScreen({ alarms, onAdd, onRemove, onToggle, onBack, onGoTimer }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [hour, setHour] = useState('08');
  const [minute, setMinute] = useState('00');
  const [repeat, setRepeat] = useState(false);

  function openForm() {
    // 고정된 기본값 대신 지금 시각에서 시작합니다.
    const now = new Date();

    setHour(String(now.getHours()).padStart(2, '0'));
    setMinute(String(now.getMinutes()).padStart(2, '0'));
    setRepeat(false);
    setIsAdding(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    onAdd(`${hour}:${minute}`, repeat);
    setIsAdding(false);
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

      {isAdding ? (
        <AddForm onSubmit={submit}>
          {/* 드롭다운(운영체제가 띄우는 팝업)은 투명한 창에서 제대로 안 그려질 수
              있어, 고를 수 있는 값을 처음부터 전부 펼쳐 놓습니다. */}
          <Preview>
            <PreviewTime>{`${hour}:${minute}`}</PreviewTime>
            <PreviewHint>{meridiemLabel(hour)}</PreviewHint>
          </Preview>

          <PickerBlock>
            <FieldLabel>시</FieldLabel>
            <Chips>
              {HOURS.map((value) => (
                <Chip
                  key={value}
                  type="button"
                  aria-label={`${value}시`}
                  data-on={value === hour || undefined}
                  onClick={() => setHour(value)}
                >
                  {value}
                </Chip>
              ))}
            </Chips>
          </PickerBlock>

          <PickerBlock>
            <FieldLabel>분</FieldLabel>
            <Chips>
              {MINUTES.map((value) => (
                <Chip
                  key={value}
                  type="button"
                  aria-label={`${value}분`}
                  data-on={value === minute || undefined}
                  onClick={() => setMinute(value)}
                >
                  {value}
                </Chip>
              ))}
            </Chips>
          </PickerBlock>

          <RepeatLabel>
            <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />
            <span>매일 반복</span>
          </RepeatLabel>

          <ButtonRow>
            <GhostButton type="button" onClick={() => setIsAdding(false)}>
              취소
            </GhostButton>

            <PrimaryButton type="submit">
              <Icon name="check" size={20} />
              <span>{`${hour}:${minute} 으로 추가`}</span>
            </PrimaryButton>
          </ButtonRow>
        </AddForm>
      ) : (
        <PrimaryButton type="button" onClick={openForm}>
          <Icon name="add" size={20} />
          <span>알람 추가</span>
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
  gap: 22px;
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
  font-size: 30px;
  font-weight: 700;
  color: var(--text-primary);
`;

const List = styled.div`
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 26vh;
  overflow-y: auto;
`;

const Empty = styled.div`
  text-align: center;
  padding: 20px;
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
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 22px 30px;
  border-radius: 22px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(18px);
  box-shadow: var(--card-shadow);
`;

const Preview = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
`;

const PreviewTime = styled.span`
  font-size: 40px;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
`;

const PreviewHint = styled.span`
  font-size: 16px;
  color: var(--text-tertiary);
`;

const PickerBlock = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const FieldLabel = styled.span`
  width: 20px;
  padding-top: 8px;
  flex-shrink: 0;
  font-size: 15px;
  color: var(--text-tertiary);
`;

const Chips = styled.div`
  display: grid;
  /* 시(24개)는 두 줄, 분(60개)은 다섯 줄로 떨어집니다. */
  grid-template-columns: repeat(12, 40px);
  gap: 6px;
`;

const Chip = styled.button`
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--card-border);
  background: var(--icon-bg);
  font-family: inherit;
  font-size: 14px;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
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

const RepeatLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: var(--text-secondary);
  cursor: pointer;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, var(--playbtn-grad-start), var(--playbtn-grad-end));
  font-family: inherit;
  font-size: 16px;
  color: #ffffff;
  cursor: pointer;

  &:hover {
    filter: brightness(1.08);
  }
`;

const GhostButton = styled(PrimaryButton)`
  background: none;
  border: 1px solid var(--card-border);
  color: var(--text-secondary);

  &:hover {
    filter: none;
    background: var(--icon-hover);
  }
`;
