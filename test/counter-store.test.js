const test = require('node:test');
const assert = require('node:assert/strict');
const { createLocalStorage } = require('./helpers/local-storage');
const {
  getCounter,
  incrementCounter,
  readCounters,
  resetCounters,
  setCounter
} = require('../src/misc/counter-store');

test('counter-store reads, writes, increments, and resets counters', () => {
  global.localStorage = createLocalStorage();

  setCounter('likeCount', 2);
  assert.equal(getCounter('likeCount'), 2);
  assert.equal(incrementCounter('likeCount'), 3);
  assert.deepEqual(readCounters(), {
    likeCount: 3,
    deslikeCount: 0
  });

  resetCounters();
  assert.deepEqual(readCounters(), {
    likeCount: 0,
    deslikeCount: 0
  });
});
