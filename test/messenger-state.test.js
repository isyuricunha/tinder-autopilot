const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AUTO_MESSAGE_DAILY_STATE_KEY,
  clearMessengerMatchQueue,
  createMessengerSessionState,
  getAutoMessageDailySentCount,
  getLocalDateKey,
  incrementAutoMessageDailySentCount,
  normalizeAutoMessageDailyState,
  normalizeMessengerMatchQueue
} = require('../src/automations/messenger-state');

test('createMessengerSessionState resets each run to a fresh match queue', () => {
  const firstState = createMessengerSessionState();
  const secondState = createMessengerSessionState();

  firstState.allMatches.push({ id: 'match-1' });

  assert.deepEqual(secondState, {
    allMatches: [],
    checkedMessage: 0,
    isRunningMessage: true,
    nextPageToken: true
  });
  assert.notEqual(firstState.allMatches, secondState.allMatches);
});

test('clearMessengerMatchQueue releases matches without using nullable state', () => {
  assert.deepEqual(clearMessengerMatchQueue(), []);
});

test('normalizeMessengerMatchQueue falls back to an empty array for invalid state', () => {
  assert.deepEqual(normalizeMessengerMatchQueue(null), []);
  assert.deepEqual(normalizeMessengerMatchQueue(undefined), []);
  assert.deepEqual(normalizeMessengerMatchQueue({ id: 'match-1' }), []);
});

test('normalizeMessengerMatchQueue preserves valid match arrays', () => {
  const matches = [{ id: 'match-1' }];

  assert.equal(normalizeMessengerMatchQueue(matches), matches);
});

test('auto message daily state tracks sends by local date', () => {
  assert.equal(AUTO_MESSAGE_DAILY_STATE_KEY, 'AutoMessageDailyState');
  assert.equal(getLocalDateKey(new Date(2026, 5, 12)), '2026-06-12');
  assert.deepEqual(normalizeAutoMessageDailyState({ dateKey: '2026-06-12', sentCount: '3' }), {
    dateKey: '2026-06-12',
    sentCount: 3
  });
  assert.deepEqual(normalizeAutoMessageDailyState({ dateKey: '2026-06-12', sentCount: '-1' }), {
    dateKey: '2026-06-12',
    sentCount: 0
  });

  const state = { dateKey: '2026-06-12', sentCount: 2 };
  assert.equal(getAutoMessageDailySentCount(state, '2026-06-12'), 2);
  assert.equal(getAutoMessageDailySentCount(state, '2026-06-13'), 0);
  assert.deepEqual(
    incrementAutoMessageDailySentCount(state, { amount: 2, dateKey: '2026-06-12' }),
    {
      dateKey: '2026-06-12',
      sentCount: 4
    }
  );
});
