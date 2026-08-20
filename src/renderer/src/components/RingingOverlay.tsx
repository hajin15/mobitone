import { useEffect } from 'react';
import styled from '@emotion/styled';

import { Icon } from './Icon';
import { startBeeping } from '../lib/beep';

// 자리를 비웠을 때 하염없이 울리지 않게.
const AUTO_STOP_MS = 60_000;

type Props = {
  label: string;
  onStop: () => void;
};

/** 알람/타이머가 울릴 때 화면을 덮는 알림창. 소리도 이 컴포넌트가 책임집니다. */
export function RingingOverlay({ label, onStop }: Props) {
  useEffect(() => {
    const stopBeeping = startBeeping();
    const timeout = setTimeout(onStop, AUTO_STOP_MS);

    return () => {
      stopBeeping();
      clearTimeout(timeout);
    };
  }, [onStop]);

  return (
    <Backdrop role="alertdialog" aria-label={label}>
      <Panel>
        <Bell>
          <Icon name="notifications_active" size={64} filled />
        </Bell>

        <Label>{label}</Label>

        <StopButton type="button" onClick={onStop} autoFocus>
          중지
        </StopButton>
      </Panel>
    </Backdrop>
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
  padding: 56px 72px;
  border-radius: 28px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(18px);
  box-shadow: var(--card-shadow);
`;

const Bell = styled.div`
  color: var(--text-primary);
  /* 소리만으로는 놓칠 수 있으니 눈에도 띄게 흔듭니다. */
  animation: shake 1s ease-in-out infinite;

  @keyframes shake {
    0%,
    100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(12deg);
    }
    75% {
      transform: rotate(-12deg);
    }
  }
`;

const Label = styled.div`
  font-size: 34px;
  font-weight: 700;
  color: var(--text-primary);
`;

const StopButton = styled.button`
  padding: 15px 54px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, var(--playbtn-grad-start), var(--playbtn-grad-end));
  font-family: inherit;
  font-size: 18px;
  color: #ffffff;
  cursor: pointer;

  &:hover {
    filter: brightness(1.08);
  }
`;
