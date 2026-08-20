import { useState } from 'react';
import type { FormEvent } from 'react';
import styled from '@emotion/styled';

import { Icon } from './Icon';
import { parseVideoId } from '../lib/format';

type Props = {
  onSubmit: (videoId: string) => void;
};

/** 화면 아래 바. 유튜브 주소를 붙여넣고 Enter 를 치면 그 곡으로 바뀝니다. */
export function UrlBar({ onSubmit }: Props) {
  const [value, setValue] = useState('');
  const [invalid, setInvalid] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();

    const videoId = parseVideoId(value);
    if (!videoId) {
      setInvalid(true);
      return;
    }

    onSubmit(videoId);
    setValue('');
    setInvalid(false);
  }

  return (
    <Anchor>
      {/* 오류 표시는 data 속성으로만 넘깁니다. 스타일 분기는 CSS 가 합니다. */}
      <Bar data-anim="bottom-bar" data-invalid={invalid || undefined} onSubmit={submit}>
        <Icon name="link" size={20} />

        <Input
          value={value}
          placeholder={invalid ? '유튜브 주소를 못 알아봤어요' : '유튜브 주소를 붙여넣고 Enter'}
          spellCheck={false}
          onChange={(e) => {
            setValue(e.target.value);
            // 다시 타이핑을 시작하면 오류 표시를 지웁니다
            if (invalid) setInvalid(false);
          }}
        />

        <SubmitButton type="submit" aria-label="이 곡으로 바꾸기" disabled={!value.trim()}>
          <Icon name="play_arrow" size={20} filled />
        </SubmitButton>
      </Bar>
    </Anchor>
  );
}

const Anchor = styled.div`
  position: absolute;
  z-index: 1;
  left: 50%;
  bottom: 34px;
  transform: translateX(-50%);
`;

const Bar = styled.form`
  width: 780px;
  height: 48px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px 0 18px;
  border-radius: 24px;
  background: var(--bottom-bg);
  border: 1px solid var(--bottom-border);
  backdrop-filter: blur(10px);
  color: var(--text-tertiary);
  transition: border-color 0.2s ease;

  &[data-invalid] {
    border-color: #e2607a;
  }
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 15px;
  color: var(--text-secondary);

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const SubmitButton = styled.button`
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  padding: 0;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffffff;
  background: linear-gradient(135deg, var(--playbtn-grad-start), var(--playbtn-grad-end));
  transition: opacity 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;
