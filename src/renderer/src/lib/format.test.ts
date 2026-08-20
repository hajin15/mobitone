// npm test 로 실행됩니다. Node 24의 내장 러너 + 타입 스트리핑을 쓰므로
// 별도 테스트 프레임워크나 빌드 단계가 없습니다.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { formatTime, formatClock, greetingFor, progressPercent, parseVideoId } from './format.ts';

test('formatTime: 초를 m:ss 로', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(9), '0:09');
  assert.equal(formatTime(65), '1:05');
  assert.equal(formatTime(600), '10:00');
});

test('formatTime: 이상값은 0:00 (YouTube가 아직 준비 안 됐을 때)', () => {
  assert.equal(formatTime(NaN), '0:00');
  assert.equal(formatTime(Infinity), '0:00');
  assert.equal(formatTime(-5), '0:00');
});

test('formatClock: 0 패딩된 24시간제', () => {
  assert.equal(formatClock(new Date(2026, 0, 1, 9, 5)), '09:05');
  assert.equal(formatClock(new Date(2026, 0, 1, 23, 59)), '23:59');
  assert.equal(formatClock(new Date(2026, 0, 1, 0, 0)), '00:00');
});

test('greetingFor: 12시/18시 경계', () => {
  assert.equal(greetingFor(0), '좋은 아침이에요');
  assert.equal(greetingFor(11), '좋은 아침이에요');
  assert.equal(greetingFor(12), '좋은 오후예요');
  assert.equal(greetingFor(17), '좋은 오후예요');
  assert.equal(greetingFor(18), '좋은 저녁이에요');
  assert.equal(greetingFor(23), '좋은 저녁이에요');
});

test('progressPercent: 0-100 으로 고정', () => {
  assert.equal(progressPercent(0, 100), 0);
  assert.equal(progressPercent(50, 100), 50);
  assert.equal(progressPercent(100, 100), 100);

  // duration 이 아직 0 이면 0으로 (0으로 나누기 방지)
  assert.equal(progressPercent(10, 0), 0);
  assert.equal(progressPercent(10, NaN), 0);

  // 범위를 넘겨도 잘려야 진행바가 삐져나오지 않습니다
  assert.equal(progressPercent(150, 100), 100);
  assert.equal(progressPercent(-10, 100), 0);
});

test('parseVideoId: 사용자가 붙여넣는 여러 형태의 주소', () => {
  const ID = 'M7lc1UVf-VE';

  assert.equal(parseVideoId(ID), ID);
  assert.equal(parseVideoId(`  ${ID}  `), ID);
  assert.equal(parseVideoId(`https://www.youtube.com/watch?v=${ID}`), ID);
  assert.equal(parseVideoId(`https://www.youtube.com/watch?v=${ID}&t=30s`), ID);
  assert.equal(parseVideoId(`https://youtu.be/${ID}`), ID);
  assert.equal(parseVideoId(`youtu.be/${ID}`), ID);
  assert.equal(parseVideoId(`https://www.youtube.com/shorts/${ID}`), ID);
  assert.equal(parseVideoId(`https://www.youtube.com/embed/${ID}`), ID);
});

test('parseVideoId: 못 알아보면 null (입력창이 오류를 띄울 수 있게)', () => {
  assert.equal(parseVideoId(''), null);
  assert.equal(parseVideoId('   '), null);
  assert.equal(parseVideoId('그냥 아무 글자'), null);
  assert.equal(parseVideoId('https://www.youtube.com/'), null);
  assert.equal(parseVideoId('https://example.com/watch?v=short'), null);
});
