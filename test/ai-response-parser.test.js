const test = require('node:test');
const assert = require('node:assert/strict');
const { parseAiDecision } = require('../src/misc/ai-response-parser');

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

test('parseAiDecision defaults to swipe on empty or invalid responses', () => {
  assert.deepEqual(parseAiDecision({}), { shouldSwipe: true, reason: 'Empty response' });
  assert.deepEqual(
    parseAiDecision({ choices: [{ message: { content: 'not json' } }] }),
    { shouldSwipe: true, reason: 'Parse error' }
  );
});
