const test = require('node:test');
const assert = require('node:assert/strict');
const {
  DEFAULT_AI_REPLY_CONTEXT_WINDOW,
  DEFAULT_AI_REPLY_TONE,
  DEFAULT_AI_REPLY_USER_CONTEXT,
  MAX_AI_REPLY_CONTEXT_WINDOW,
  MIN_AI_REPLY_CONTEXT_WINDOW,
  normalizeAiReplyContextWindow
} = require('../src/misc/ai-message-reply-settings');

test('AI reply settings expose safe defaults', () => {
  assert.equal(typeof DEFAULT_AI_REPLY_TONE, 'string');
  assert.equal(DEFAULT_AI_REPLY_TONE.length > 0, true);
  assert.equal(DEFAULT_AI_REPLY_USER_CONTEXT, '');
  assert.equal(DEFAULT_AI_REPLY_CONTEXT_WINDOW, 5);
});

test('normalizeAiReplyContextWindow clamps invalid and out-of-range values', () => {
  assert.equal(normalizeAiReplyContextWindow('abc'), DEFAULT_AI_REPLY_CONTEXT_WINDOW);
  assert.equal(normalizeAiReplyContextWindow(0), MIN_AI_REPLY_CONTEXT_WINDOW);
  assert.equal(normalizeAiReplyContextWindow(99), MAX_AI_REPLY_CONTEXT_WINDOW);
  assert.equal(normalizeAiReplyContextWindow(7), 7);
});
