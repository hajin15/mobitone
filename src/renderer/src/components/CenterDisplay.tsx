import styled from '@emotion/styled';

type CenterDisplayProps = {
  time: string;
  greeting: string;
  subtitle: string;
};

export function CenterDisplay({ time, greeting, subtitle }: CenterDisplayProps) {
  return (
    <Center>
      <Clock data-anim="clock">{time}</Clock>
      <Greeting data-anim="line">{greeting}</Greeting>
      <Subtitle data-anim="line">{subtitle}</Subtitle>
    </Center>
  );
}

const Center = styled.main`
  position: relative;
  z-index: 1;
  text-align: center;
  margin-top: 110px;
`;

const Clock = styled.div`
  font-size: var(--fs-display);
  font-weight: var(--fw-black);
  letter-spacing: 2px;
  line-height: 1;
  background: linear-gradient(90deg, var(--clock-grad-start), var(--clock-grad-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Greeting = styled.div`
  font-size: var(--fs-h3);
  font-weight: var(--fw-medium);
  margin-top: 16px;
  color: var(--text-secondary);
`;

const Subtitle = styled.div`
  font-size: var(--fs-md);
  font-weight: var(--fw-regular);
  color: var(--text-tertiary);
  margin-top: 6px;
`;
