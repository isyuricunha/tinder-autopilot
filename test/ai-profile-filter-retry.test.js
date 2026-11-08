const test = require('node:test');
const assert = require('node:assert/strict');
const { retryTruncatedProfileDecision } = require('../src/misc/ai-profile-filter-retry');
const { parseAiDecision } = require('../src/misc/ai-response-parser');

const decision = (content, finish_reason = 'stop') =>
  parseAiDecision({ choices: [{ finish_reason, message: { content } }] });
const truncated = decision('{"shouldSwipe":"yes","reason":"incomplete"}', 'length');

test('a complete rejection on retry takes precedence over a truncated approval', async () => {
  const budgets = [];
  const rejection = decision('{"shouldSwipe":"no","reason":"Rule matched"}');
  const result = await retryTruncatedProfileDecision({
    maxTokens: 128,
    isCancelled: () => false,
    request: async (budget) => {
      budgets.push(budget);
      return budgets.length === 1 ? truncated : rejection;
    }
  });
  assert.deepEqual(budgets, [128, 512]);
  assert.deepEqual(result, rejection);
});

test('only three consecutive truncations permit a fallback Like', async () => {
  const budgets = [];
  const result = await retryTruncatedProfileDecision({
    maxTokens: 128,
    isCancelled: () => false,
    request: async (budget) => {
      budgets.push(budget);
      return truncated;
    }
  });
  assert.deepEqual(budgets, [128, 512, 2048]);
  assert.equal(result.isFallback, true);
  assert.equal(result.shouldSwipe, true);
});

test('a different response failure or cancellation stops further attempts', async () => {
  const invalid = decision('{"shouldSwipe":"yes"}');
  for (const cancel of [false, true]) {
    let requests = 0;
    const result = await retryTruncatedProfileDecision({
      maxTokens: 128,
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
