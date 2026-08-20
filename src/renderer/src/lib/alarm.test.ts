// npm test 로 실행됩니다. lib 폴더의 *.test.ts 를 전부 훑습니다.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { dateKey, dueAlarm, afterFired } from './alarm.ts';
import type { Alarm } from './alarm.ts';

function makeAlarm(over: Partial<Alarm> = {}): Alarm {
  return {
    id: 'a1',
    time: '07:00',
    repeat: false,
    enabled: true,
    lastFired: '',
    ...over,
  };
}

const AT_0700 = new Date(2026, 7, 20, 7, 0, 30);

test('dateKey: 로컬 기준 YYYY-MM-DD', () => {
  assert.equal(dateKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(dateKey(new Date(2026, 11, 31, 0, 0)), '2026-12-31');
});

test('dueAlarm: 시각이 맞으면 그 알람을 돌려줍니다', () => {
  const alarm = makeAlarm();
  assert.equal(dueAlarm([alarm], AT_0700), alarm);
});

test('dueAlarm: 초는 보지 않습니다 (분 단위)', () => {
  const alarm = makeAlarm();
  assert.equal(dueAlarm([alarm], new Date(2026, 7, 20, 7, 0, 0)), alarm);
  assert.equal(dueAlarm([alarm], new Date(2026, 7, 20, 7, 0, 59)), alarm);
});

test('dueAlarm: 시각이 다르면 null', () => {
  assert.equal(dueAlarm([makeAlarm()], new Date(2026, 7, 20, 7, 1)), null);
  assert.equal(dueAlarm([makeAlarm()], new Date(2026, 7, 20, 6, 59)), null);
});

test('dueAlarm: 꺼둔 알람은 울리지 않습니다', () => {
  assert.equal(dueAlarm([makeAlarm({ enabled: false })], AT_0700), null);
});

test('dueAlarm: 오늘 이미 울렸으면 다시 울리지 않습니다', () => {
  // 시계가 1초마다 도는데 07:00 인 동안 60번 울리면 안 됩니다.
  const alarm = makeAlarm({ lastFired: '2026-08-20' });
  assert.equal(dueAlarm([alarm], AT_0700), null);
});

test('dueAlarm: 어제 울린 매일 알람은 오늘 다시 울립니다', () => {
  const alarm = makeAlarm({ repeat: true, lastFired: '2026-08-19' });
  assert.equal(dueAlarm([alarm], AT_0700), alarm);
});

test('dueAlarm: 여러 개 중 조건에 맞는 것만', () => {
  const other = makeAlarm({ id: 'a2', time: '09:00' });
  const target = makeAlarm({ id: 'a3' });
  assert.equal(dueAlarm([other, target], AT_0700), target);
});

test('dueAlarm: 목록이 비어 있으면 null', () => {
  assert.equal(dueAlarm([], AT_0700), null);
});

test('afterFired: 매일 반복이면 켜둔 채 날짜만 기록', () => {
  const after = afterFired(makeAlarm({ repeat: true }), AT_0700);
  assert.equal(after.enabled, true);
  assert.equal(after.lastFired, '2026-08-20');
});

test('afterFired: 한 번짜리는 꺼집니다', () => {
  const after = afterFired(makeAlarm({ repeat: false }), AT_0700);
  assert.equal(after.enabled, false);
  assert.equal(after.lastFired, '2026-08-20');
});
