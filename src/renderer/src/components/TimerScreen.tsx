import { useState } from 'react';
import styled from '@emotion/styled';

import { Icon } from './Icon';
import { formatCountdown } from '../lib/format';

type Props = {
  remaining: number;
  isRunning: boolean;
  onStart: (seconds: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onBack: () => void;
  onGoAlarm: () => void;
};

export function TimerScreen({
  remaining,
  isRunning,
  onStart,
  onPause,
  onResume,
  onReset,
  onBack,
  onGoAlarm,
}: Props) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);

  // 맞추는 중 / 세는 중을 이걸로 가릅니다.
  const isSet = remaining > 0;
  const total = hours * 3600 + minutes * 60 + seconds;

  return (
    <Screen>
      <Header>
        <TextButton type="button" onClick={onBack}>
          <Icon name="arrow_back" size={20} />
          <span>뒤로</span>
        </TextButton>

        <TextButton type="button" onClick={onGoAlarm}>
          <Icon name="alarm" size={20} />
          <span>알람</span>
        </TextButton>
      </Header>

      <Title>
        <Icon name="hourglass_empty" size={30} filled />
        <span>타이머</span>
      </Title>

      {isSet ? (
        <Countdown data-paused={!isRunning || undefined}>{formatCountdown(remaining)}</Countdown>
      ) : (
        <Inputs>
          <Field>
            <NumberInput
              type="number"
              min={0}
              max={23}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              aria-label="시"
            />
            <Unit>시간</Unit>
          </Field>

          <Field>
            <NumberInput
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              aria-label="분"
            />
            <Unit>분</Unit>
          </Field>

          <Field>
            <NumberInput
              type="number"
              min={0}
              max={59}
              value={seconds}
              onChange={(e) => setSeconds(Number(e.target.value))}
              aria-label="초"
            />
            <Unit>초</Unit>
          </Field>
        </Inputs>
      )}

      <Controls>
        {!isSet && (
          <PrimaryButton type="button" onClick={() => onStart(total)} disabled={total <= 0}>
            <Icon name="play_arrow" size={20} filled />
            <span>시작</span>
          </PrimaryButton>
        )}

        {isSet && (
          <>
            <PrimaryButton type="button" onClick={isRunning ? onPause : onResume}>
              <Icon name={isRunning ? 'pause' : 'play_arrow'} size={20} filled />
              <span>{isRunning ? '일시정지' : '계속'}</span>
            </PrimaryButton>

            <GhostButton type="button" onClick={onReset}>
              <Icon name="refresh" size={20} />
              <span>초기화</span>
            </GhostButton>
          </>
        )}
      </Controls>
    </Screen>
  );
}

const Screen = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
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
  font-size: var(--fs-md);
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
  font-size: var(--fs-h1);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
`;

const Countdown = styled.div`
  font-size: var(--fs-hero);
  font-weight: var(--fw-black);
  line-height: 1;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  transition: opacity 0.15s ease;

  &[data-paused] {
    opacity: 0.5;
  }
`;

const Inputs = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 22px;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const NumberInput = styled.input`
  width: 130px;
  padding: 12px 0;
  text-align: center;
  border-radius: 18px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  backdrop-filter: blur(18px);
  outline: none;
  font-family: inherit;
  font-size: var(--fs-numeric);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
`;

const Unit = styled.span`
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
`;

const Controls = styled.div`
  display: flex;
  gap: 14px;
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 30px;
  border-radius: 18px;
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
