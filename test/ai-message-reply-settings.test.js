const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AI_REPLY_COMPATIBILITY_MODES,
  AI_REPLY_REASONING_EFFORTS,
  AI_REPLY_SETTING_KEYS,
  DEFAULT_AI_REPLY_ADDRESS_INFO,
  DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
  DEFAULT_AI_REPLY_CONTACT_INFO,
  DEFAULT_AI_REPLY_CONTEXT_WINDOW,
  DEFAULT_AI_REPLY_DELAY_SECONDS,
  DEFAULT_AI_REPLY_MAX_TOKENS,
  DEFAULT_AI_REPLY_MODEL,
  DEFAULT_AI_REPLY_REASONING_EFFORT,
  DEFAULT_AI_REPLY_TONE,
  DEFAULT_AI_REPLY_USER_CONTEXT,
  MAX_AI_REPLY_CONTEXT_WINDOW,
  MAX_AI_REPLY_DELAY_SECONDS,
  MAX_AI_REPLY_MAX_TOKENS,
  MIN_AI_REPLY_CONTEXT_WINDOW,
  MIN_AI_REPLY_DELAY_SECONDS,
  MIN_AI_REPLY_MAX_TOKENS,
  normalizeAiReplyCompatibilityMode,
  normalizeAiReplyContextWindow,
  normalizeAiReplyDelaySeconds,
  normalizeAiReplyMaxTokens,
  normalizeAiReplyReasoningEffort,
  readAiReplySettings
} = require('../src/misc/ai-message-reply-settings');

test('AI reply settings expose safe defaults', () => {
  assert.equal(typeof DEFAULT_AI_REPLY_TONE, 'string');
  assert.equal(DEFAULT_AI_REPLY_TONE.length > 0, true);
  assert.equal(DEFAULT_AI_REPLY_TONE.includes('same language as the conversation'), true);
  assert.equal(DEFAULT_AI_REPLY_TONE.includes('Brazilian Portuguese'), false);
  assert.equal(DEFAULT_AI_REPLY_USER_CONTEXT, '');
  assert.equal(DEFAULT_AI_REPLY_CONTACT_INFO, '');
  assert.equal(DEFAULT_AI_REPLY_ADDRESS_INFO, '');
  assert.equal(DEFAULT_AI_REPLY_CONTEXT_WINDOW, 10);
  assert.equal(DEFAULT_AI_REPLY_MAX_TOKENS, 2048);
  assert.equal(DEFAULT_AI_REPLY_DELAY_SECONDS, 4);
  assert.equal(DEFAULT_AI_REPLY_COMPATIBILITY_MODE, AI_REPLY_COMPATIBILITY_MODES.standardJson);
  assert.equal(DEFAULT_AI_REPLY_MODEL, 'gpt-4o-mini');
  assert.equal(DEFAULT_AI_REPLY_REASONING_EFFORT, AI_REPLY_REASONING_EFFORTS.low);
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

test('normalizeAiReplyDelaySeconds clamps invalid and out-of-range values', () => {
  assert.equal(normalizeAiReplyDelaySeconds('abc'), DEFAULT_AI_REPLY_DELAY_SECONDS);
  assert.equal(normalizeAiReplyDelaySeconds(-1), MIN_AI_REPLY_DELAY_SECONDS);
  assert.equal(normalizeAiReplyDelaySeconds(999), MAX_AI_REPLY_DELAY_SECONDS);
  assert.equal(normalizeAiReplyDelaySeconds(8), 8);
});

test('normalizeAiReplyCompatibilityMode accepts only known modes', () => {
  assert.equal(
    normalizeAiReplyCompatibilityMode(AI_REPLY_COMPATIBILITY_MODES.reasoningJson),
    AI_REPLY_COMPATIBILITY_MODES.reasoningJson
  );
  assert.equal(normalizeAiReplyCompatibilityMode('unknown'), DEFAULT_AI_REPLY_COMPATIBILITY_MODE);
});

test('normalizeAiReplyReasoningEffort accepts only known efforts', () => {
  assert.equal(
    normalizeAiReplyReasoningEffort(AI_REPLY_REASONING_EFFORTS.high),
    AI_REPLY_REASONING_EFFORTS.high
  );
  assert.equal(normalizeAiReplyReasoningEffort('unknown'), DEFAULT_AI_REPLY_REASONING_EFFORT);
});

test('readAiReplySettings reads and normalizes stored values', () => {
  const settings = {
    [AI_REPLY_SETTING_KEYS.apiUrl]: ' https://example.test/chat ',
    [AI_REPLY_SETTING_KEYS.compatibilityMode]: AI_REPLY_COMPATIBILITY_MODES.reasoningJson,
    [AI_REPLY_SETTING_KEYS.contextWindow]: '99',
    [AI_REPLY_SETTING_KEYS.maxTokens]: '99999',
    [AI_REPLY_SETTING_KEYS.model]: ' custom-model ',
    [AI_REPLY_SETTING_KEYS.reasoningEffort]: AI_REPLY_REASONING_EFFORTS.high,
    [AI_REPLY_SETTING_KEYS.addressInfo]: ' Rua Teste 123 ',
    [AI_REPLY_SETTING_KEYS.contactInfo]: ' WhatsApp +55 11 99999-9999 ',
    [AI_REPLY_SETTING_KEYS.replyDelaySeconds]: '999',
    [AI_REPLY_SETTING_KEYS.tone]: ' concise ',
    [AI_REPLY_SETTING_KEYS.userContext]: ' works late '
  };

  assert.deepEqual(readAiReplySettings((key, fallback) => settings[key] ?? fallback), {
    addressInfo: 'Rua Teste 123',
    apiUrl: 'https://example.test/chat',
    compatibilityMode: AI_REPLY_COMPATIBILITY_MODES.reasoningJson,
    contactInfo: 'WhatsApp +55 11 99999-9999',
    contextWindow: MAX_AI_REPLY_CONTEXT_WINDOW,
    maxTokens: MAX_AI_REPLY_MAX_TOKENS,
    model: 'custom-model',
    reasoningEffort: AI_REPLY_REASONING_EFFORTS.high,
    replyDelaySeconds: MAX_AI_REPLY_DELAY_SECONDS,
    tone: 'concise',
    userContext: 'works late'
  });
});

test('readAiReplySettings falls back to safe defaults', () => {
  assert.deepEqual(readAiReplySettings(), {
    addressInfo: DEFAULT_AI_REPLY_ADDRESS_INFO,
    apiUrl: '',
    compatibilityMode: DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
    contactInfo: DEFAULT_AI_REPLY_CONTACT_INFO,
    contextWindow: DEFAULT_AI_REPLY_CONTEXT_WINDOW,
    maxTokens: DEFAULT_AI_REPLY_MAX_TOKENS,
    model: DEFAULT_AI_REPLY_MODEL,
    reasoningEffort: DEFAULT_AI_REPLY_REASONING_EFFORT,
    replyDelaySeconds: DEFAULT_AI_REPLY_DELAY_SECONDS,
    tone: DEFAULT_AI_REPLY_TONE,
    userContext: DEFAULT_AI_REPLY_USER_CONTEXT
  });
});

test('readAiReplySettings falls back to legacy shared model', () => {
  const settings = {
    [AI_REPLY_SETTING_KEYS.legacyModel]: ' legacy-model '
  };

  assert.equal(
    readAiReplySettings((key, fallback) => settings[key] ?? fallback).model,
    'legacy-model'
  );
});
