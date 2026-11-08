const test = require('node:test');
const assert = require('node:assert/strict');
const { retryProfileDecision } = require('../src/misc/ai-profile-filter-retry');
const { AI_PROFILE_FILTER_CONNECTION, createAiProfileFilterFailure } = require('../src/misc/ai-profile-filter-result');
const { parseAiDecision } = require('../src/misc/ai-response-parser');

const decision = (content, finish_reason = 'stop') =>
  parseAiDecision({ choices: [{ finish_reason, message: { content } }] });
const truncated = decision('{"shouldSwipe":"yes","reason":"incomplete"}', 'length');

test('a complete rejection on retry takes precedence over a truncated approval', async () => {
  let requests = 0;
  const rejection = decision('{"shouldSwipe":"no","reason":"Rule matched"}');
  const result = await retryProfileDecision({
    isCancelled: () => false,
    request: async () => {
      requests += 1;
      return requests === 1 ? truncated : rejection;
    }
  });
  assert.equal(requests, 2);
  assert.deepEqual(result, rejection);
});

test('only three consecutive truncations permit a fallback Like', async () => {
  let requests = 0;
  const result = await retryProfileDecision({
    isCancelled: () => false,
    request: async () => {
      requests += 1;
      return truncated;
    }
  });
  assert.equal(requests, 3);
  assert.equal(result.isFallback, true);
  assert.equal(result.shouldSwipe, true);
});

test('a different response failure or cancellation stops further attempts', async () => {
  const invalid = decision('{"shouldSwipe":"yes"}');
  for (const cancel of [false, true]) {
    let requests = 0;
    const result = await retryProfileDecision({
      isCancelled: () => cancel && requests > 0,
      request: async () => {
        requests += 1;
        return requests === 1 ? truncated : invalid;
      }
    });
    assert.equal(requests, cancel ? 1 : 2);
    assert.equal(result.isFailure, true);
    assert.equal(result.reason, cancel ? 'Profile analysis cancelled' : invalid.reason);
  }
});

test('connection failures retry after a delay and accept a recovered response', async () => {
  const connection = createAiProfileFilterFailure('Failed to fetch', AI_PROFILE_FILTER_CONNECTION);
  const approval = decision('{"shouldSwipe":"yes","reason":"No rule matched"}');
  let requests = 0;
  const delays = [];
  const result = await retryProfileDecision({
    isCancelled: () => false,
    wait: async (ms) => delays.push(ms),
    request: async () => {
      requests += 1;
      return requests < 3 ? connection : approval;
    }
  });
  assert.deepEqual(delays, [600, 1200]);
  assert.equal(requests, 3);
  assert.deepEqual(result, approval);
});

test('connection failure among truncated results never authorizes a fallback Like', async () => {
  const connection = createAiProfileFilterFailure('Failed to fetch', AI_PROFILE_FILTER_CONNECTION);
  const responses = [truncated, connection, truncated];
  const result = await retryProfileDecision({
    isCancelled: () => false,
    wait: async () => {},
    request: async () => responses.shift()
  });
  assert.equal(responses.length, 0);
  assert.equal(result.isFailure, true);
  assert.match(result.reason, /provider connection/);
});
