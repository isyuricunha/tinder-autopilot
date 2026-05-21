const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AI_REPLY_COMPATIBILITY_MODES,
  AI_REPLY_SETTING_KEYS,
  DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
  DEFAULT_AI_REPLY_CONTEXT_WINDOW,
  DEFAULT_AI_REPLY_MAX_TOKENS,
  DEFAULT_AI_REPLY_MODEL,
  DEFAULT_AI_REPLY_TONE,
  DEFAULT_AI_REPLY_USER_CONTEXT,
  MAX_AI_REPLY_CONTEXT_WINDOW,
  MAX_AI_REPLY_MAX_TOKENS,
  MIN_AI_REPLY_CONTEXT_WINDOW,
  MIN_AI_REPLY_MAX_TOKENS,
  normalizeAiReplyCompatibilityMode,
  normalizeAiReplyContextWindow,
  normalizeAiReplyMaxTokens,
  readAiReplySettings
} = require('../src/misc/ai-message-reply-settings');

test('AI reply settings expose safe defaults', () => {
  assert.equal(typeof DEFAULT_AI_REPLY_TONE, 'string');
  assert.equal(DEFAULT_AI_REPLY_TONE.length > 0, true);
  assert.equal(DEFAULT_AI_REPLY_USER_CONTEXT, '');
  assert.equal(DEFAULT_AI_REPLY_CONTEXT_WINDOW, 5);
  assert.equal(DEFAULT_AI_REPLY_MAX_TOKENS, 768);
  assert.equal(DEFAULT_AI_REPLY_COMPATIBILITY_MODE, AI_REPLY_COMPATIBILITY_MODES.standardJson);
  assert.equal(DEFAULT_AI_REPLY_MODEL, 'gpt-4o-mini');
});

test('normalizeAiReplyContextWindow clamps invalid and out-of-range values', () => {
  assert.equal(normalizeAiReplyContextWindow('abc'), DEFAULT_AI_REPLY_CONTEXT_WINDOW);
  assert.equal(normalizeAiReplyContextWindow(0), MIN_AI_REPLY_CONTEXT_WINDOW);
  assert.equal(normalizeAiReplyContextWindow(99), MAX_AI_REPLY_CONTEXT_WINDOW);
  assert.equal(normalizeAiReplyContextWindow(7), 7);
});

test('normalizeAiReplyMaxTokens clamps invalid and out-of-range values', () => {
  assert.equal(normalizeAiReplyMaxTokens('abc'), DEFAULT_AI_REPLY_MAX_TOKENS);
  assert.equal(normalizeAiReplyMaxTokens(1), MIN_AI_REPLY_MAX_TOKENS);
  assert.equal(normalizeAiReplyMaxTokens(99999), MAX_AI_REPLY_MAX_TOKENS);
  assert.equal(normalizeAiReplyMaxTokens(1024), 1024);
});

test('normalizeAiReplyCompatibilityMode accepts only known modes', () => {
  assert.equal(
    normalizeAiReplyCompatibilityMode(AI_REPLY_COMPATIBILITY_MODES.reasoningJson),
    AI_REPLY_COMPATIBILITY_MODES.reasoningJson
  );
  assert.equal(normalizeAiReplyCompatibilityMode('unknown'), DEFAULT_AI_REPLY_COMPATIBILITY_MODE);
});

test('readAiReplySettings reads and normalizes stored values', () => {
  const settings = {
    [AI_REPLY_SETTING_KEYS.apiUrl]: ' https://example.test/chat ',
    [AI_REPLY_SETTING_KEYS.compatibilityMode]: AI_REPLY_COMPATIBILITY_MODES.reasoningJson,
    [AI_REPLY_SETTING_KEYS.contextWindow]: '99',
    [AI_REPLY_SETTING_KEYS.maxTokens]: '99999',
    [AI_REPLY_SETTING_KEYS.model]: ' custom-model ',
    [AI_REPLY_SETTING_KEYS.tone]: ' concise ',
    [AI_REPLY_SETTING_KEYS.userContext]: ' works late '
  };

  assert.deepEqual(readAiReplySettings((key, fallback) => settings[key] ?? fallback), {
    apiUrl: 'https://example.test/chat',
    compatibilityMode: AI_REPLY_COMPATIBILITY_MODES.reasoningJson,
    contextWindow: MAX_AI_REPLY_CONTEXT_WINDOW,
    maxTokens: MAX_AI_REPLY_MAX_TOKENS,
    model: 'custom-model',
    tone: 'concise',
    userContext: 'works late'
  });
});

test('readAiReplySettings falls back to safe defaults', () => {
  assert.deepEqual(readAiReplySettings(), {
    apiUrl: '',
    compatibilityMode: DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
    contextWindow: DEFAULT_AI_REPLY_CONTEXT_WINDOW,
    maxTokens: DEFAULT_AI_REPLY_MAX_TOKENS,
    model: DEFAULT_AI_REPLY_MODEL,
    tone: DEFAULT_AI_REPLY_TONE,
    userContext: DEFAULT_AI_REPLY_USER_CONTEXT
  });
});
