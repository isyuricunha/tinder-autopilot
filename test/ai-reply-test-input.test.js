const test = require('node:test');
const assert = require('node:assert/strict');
const { parseAiReplyTestConversation } = require('../src/misc/ai-reply-test-input');

test('parseAiReplyTestConversation reads user and match lines', () => {
  assert.deepEqual(
    parseAiReplyTestConversation(`
      USER: oi
      MATCH: tudo bem?
      ME: tudo sim
      OWNER: e contigo?
    `),
    [
      { role: 'user', text: 'oi' },
      { role: 'match', text: 'tudo bem?' },
      { role: 'user', text: 'tudo sim' },
      { role: 'user', text: 'e contigo?' }
    ]
  );
});

test('parseAiReplyTestConversation appends unprefixed lines to the previous turn', () => {
  assert.deepEqual(
    parseAiReplyTestConversation(`
      MATCH: primeira linha
      segunda linha
      USER: resposta
    `),
    [
      { role: 'match', text: 'primeira linha\nsegunda linha' },
      { role: 'user', text: 'resposta' }
    ]
  );
});

test('parseAiReplyTestConversation ignores empty and unknown leading lines', () => {
  assert.deepEqual(parseAiReplyTestConversation('unknown\n\nMATCH: oi'), [
    { role: 'match', text: 'oi' }
  ]);
});
