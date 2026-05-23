const test = require('node:test');
const assert = require('node:assert/strict');
const {
  classifyAiReplyConversationIntent,
  formatAiReplyConversationSignals
} = require('../src/misc/ai-reply-conversation-intent');

test('classifyAiReplyConversationIntent detects location question variants', () => {
  [
    'aonde tu mora?',
    'mora aonde?',
    'mora onde?',
    'de onde tu é?',
    'vc é de onde?'
  ].forEach((text) => {
    assert.equal(
      classifyAiReplyConversationIntent([{ role: 'match', text }]).asksForLocation,
      true
    );
  });
});

test('classifyAiReplyConversationIntent detects operational reply signals', () => {
  const intent = classifyAiReplyConversationIntent([
    { role: 'user', text: 'bom dia' },
    { role: 'match', text: 'to gripada e cansada, trabalha com o que?' }
  ]);

  assert.equal(intent.asksAboutWork, true);
  assert.equal(intent.mentionsTiredSickColdBusyOrSleep, true);
});

test('formatAiReplyConversationSignals emits compact latest-message metadata', () => {
  const signals = formatAiReplyConversationSignals([
    { role: 'match', text: 'me passa teu whats?' }
  ]);

  assert.equal(signals.includes('asks about contact'), true);
});
