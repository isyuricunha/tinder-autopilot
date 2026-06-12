const test = require('node:test');
const assert = require('node:assert/strict');
const {
  clearMessengerMatchQueue,
  createMessengerSessionState,
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
