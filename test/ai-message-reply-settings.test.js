const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AI_REPLY_SETTING_KEYS,
  DEFAULT_AI_REPLY_CONTEXT_WINDOW,
  DEFAULT_AI_REPLY_MODEL,
  DEFAULT_AI_REPLY_TONE,
  DEFAULT_AI_REPLY_USER_CONTEXT,
  MAX_AI_REPLY_CONTEXT_WINDOW,
  MIN_AI_REPLY_CONTEXT_WINDOW,
  normalizeAiReplyContextWindow,
  readAiReplySettings
} = require('../src/misc/ai-message-reply-settings');

test('AI reply settings expose safe defaults', () => {
  assert.equal(typeof DEFAULT_AI_REPLY_TONE, 'string');
  assert.equal(DEFAULT_AI_REPLY_TONE.length > 0, true);
  assert.equal(DEFAULT_AI_REPLY_USER_CONTEXT, '');
  assert.equal(DEFAULT_AI_REPLY_CONTEXT_WINDOW, 5);
  assert.equal(DEFAULT_AI_REPLY_MODEL, 'gpt-4o-mini');
});

test('normalizeAiReplyContextWindow clamps invalid and out-of-range values', () => {
  assert.equal(normalizeAiReplyContextWindow('abc'), DEFAULT_AI_REPLY_CONTEXT_WINDOW);
  assert.equal(normalizeAiReplyContextWindow(0), MIN_AI_REPLY_CONTEXT_WINDOW);
  assert.equal(normalizeAiReplyContextWindow(99), MAX_AI_REPLY_CONTEXT_WINDOW);
  assert.equal(normalizeAiReplyContextWindow(7), 7);
});

test('readAiReplySettings reads and normalizes stored values', () => {
  const settings = {
    [AI_REPLY_SETTING_KEYS.apiUrl]: ' https://example.test/chat ',
    [AI_REPLY_SETTING_KEYS.contextWindow]: '99',
    [AI_REPLY_SETTING_KEYS.model]: ' custom-model ',
    [AI_REPLY_SETTING_KEYS.tone]: ' concise ',
    [AI_REPLY_SETTING_KEYS.userContext]: ' works late '
  };

  assert.deepEqual(readAiReplySettings((key, fallback) => settings[key] ?? fallback), {
    apiUrl: 'https://example.test/chat',
    contextWindow: MAX_AI_REPLY_CONTEXT_WINDOW,
    model: 'custom-model',
    tone: 'concise',
    userContext: 'works late'
  });
});

test('readAiReplySettings falls back to safe defaults', () => {
  assert.deepEqual(readAiReplySettings(), {
    apiUrl: '',
    contextWindow: DEFAULT_AI_REPLY_CONTEXT_WINDOW,
    model: DEFAULT_AI_REPLY_MODEL,
    tone: DEFAULT_AI_REPLY_TONE,
    userContext: DEFAULT_AI_REPLY_USER_CONTEXT
  });
});
