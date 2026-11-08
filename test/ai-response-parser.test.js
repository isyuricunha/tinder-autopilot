const test = require('node:test');
const assert = require('node:assert/strict');
const { parseAiDecision } = require('../src/misc/ai-response-parser');
const { isAiProfileFilterFailure } = require('../src/misc/ai-profile-filter-result');

test('parseAiDecision accepts yes responses', () => {
  const result = parseAiDecision({
    choices: [{ message: { content: '{"shouldSwipe":"yes","reason":"looks good"}' } }]
  });

  assert.deepEqual(result, { shouldSwipe: true, reason: 'looks good' });
});

test('parseAiDecision rejects no responses', () => {
  const result = parseAiDecision({
    choices: [{ message: { content: '{"shouldSwipe":"no","confidence":8}' } }]
  });

  assert.deepEqual(result, { shouldSwipe: false, reason: 'confidence: 8' });
});

test('parseAiDecision accepts Anthropic text content responses', () => {
  const result = parseAiDecision({
    content: [{ type: 'text', text: '{"shouldSwipe":"no","reason":"banned term"}' }]
  });

  assert.deepEqual(result, { shouldSwipe: false, reason: 'banned term' });
});

test('an approval without a reason or numeric confidence pauses the filter', () => {
  for (const content of ['{"shouldSwipe":"yes"}', '{"shouldSwipe":"yes","reason":" ","confidence":"?"}']) {
    const result = parseAiDecision({ choices: [{ message: { content } }] });
    assert.equal(isAiProfileFilterFailure(result), true);
    assert.equal(result.reason, 'AI decision omitted its reason');
  }
});

test('empty and malformed decisions pause the filter', () => {
  assert.equal(isAiProfileFilterFailure(parseAiDecision({})), true);
  const malformed = parseAiDecision({ choices: [{ message: { content: 'not json' } }] });
  assert.equal(isAiProfileFilterFailure(malformed), true);
});

test('parseAiDecision does not treat an unrecognized decision as a rejection', () => {
  const result = parseAiDecision({
    content: [{ type: 'text', text: '{"shouldSwipe":"unknown","reason":"gender not shown"}' }]
  });
  assert.equal(isAiProfileFilterFailure(result), true);
});

test('a truncated response cannot authorize a swipe even if the JSON is complete', () => {
  const result = parseAiDecision({
    stop_reason: 'max_tokens',
    content: [{ type: 'text', text: '{"shouldSwipe":"yes","reason":"looks good"}' }]
  });
  assert.equal(isAiProfileFilterFailure(result), true);
});
