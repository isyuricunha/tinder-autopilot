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
  DEFAULT_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES,
  DEFAULT_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY,
  DEFAULT_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE,
  DEFAULT_AI_REPLY_DELAY_SECONDS,
  DEFAULT_AI_REPLY_HARD_RULES,
  DEFAULT_AI_REPLY_MAX_TOKENS,
  DEFAULT_AI_REPLY_MODEL,
  DEFAULT_AI_REPLY_REASONING_EFFORT,
  DEFAULT_AI_REPLY_STYLE_EXAMPLES,
  DEFAULT_AI_REPLY_TONE,
  DEFAULT_AI_REPLY_USER_CONTEXT,
  MAX_AI_REPLY_CONTEXT_WINDOW,
  MAX_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES,
  MAX_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY,
  MAX_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE,
  MAX_AI_REPLY_DELAY_SECONDS,
  MAX_AI_REPLY_MAX_TOKENS,
  MIN_AI_REPLY_CONTEXT_WINDOW,
  MIN_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES,
  MIN_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY,
  MIN_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE,
  MIN_AI_REPLY_DELAY_SECONDS,
  MIN_AI_REPLY_MAX_TOKENS,
  normalizeAiReplyContinuousIntervalMinutes,
  normalizeAiReplyContinuousMaxPerMatchPerDay,
  normalizeAiReplyContinuousMaxSentPerCycle,
  normalizeAiReplyCompatibilityMode,
  normalizeAiReplyContextWindow,
  normalizeAiReplyDelaySeconds,
  normalizeAiReplyMaxTokens,
  normalizeAiReplyReasoningEffort,
  readAiReplySettings
} = require('../src/misc/ai-message-reply-settings');
const {
  AI_PROVIDER_SETTING_KEY,
  AI_PROVIDER_TYPES
} = require('../src/misc/ai-provider-settings');

test('AI reply settings expose safe defaults', () => {
  assert.equal(typeof DEFAULT_AI_REPLY_TONE, 'string');
  assert.equal(DEFAULT_AI_REPLY_TONE.length > 0, true);
  assert.equal(DEFAULT_AI_REPLY_TONE.includes('same language as the conversation'), true);
  assert.equal(DEFAULT_AI_REPLY_TONE.includes('Brazilian Portuguese'), false);
  assert.equal(DEFAULT_AI_REPLY_USER_CONTEXT, '');
  assert.equal(DEFAULT_AI_REPLY_STYLE_EXAMPLES, '');
  assert.equal(DEFAULT_AI_REPLY_CONTACT_INFO, '');
  assert.equal(DEFAULT_AI_REPLY_ADDRESS_INFO, '');
  assert.equal(DEFAULT_AI_REPLY_HARD_RULES, '');
  assert.equal(DEFAULT_AI_REPLY_CONTEXT_WINDOW, 10);
  assert.equal(DEFAULT_AI_REPLY_MAX_TOKENS, 2048);
  assert.equal(DEFAULT_AI_REPLY_DELAY_SECONDS, 4);
  assert.equal(DEFAULT_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES, 10);
  assert.equal(DEFAULT_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE, 5);
  assert.equal(DEFAULT_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY, 3);
  assert.equal(DEFAULT_AI_REPLY_COMPATIBILITY_MODE, AI_REPLY_COMPATIBILITY_MODES.standardJson);
  assert.equal(DEFAULT_AI_REPLY_MODEL, 'gpt-4o-mini');
  assert.equal(DEFAULT_AI_REPLY_REASONING_EFFORT, AI_REPLY_REASONING_EFFORTS.low);
});

test('normalizeAiReplyContextWindow clamps invalid and out-of-range values', () => {
  assert.equal(normalizeAiReplyContextWindow('abc'), DEFAULT_AI_REPLY_CONTEXT_WINDOW);
  assert.equal(normalizeAiReplyContextWindow(0), MIN_AI_REPLY_CONTEXT_WINDOW);
  assert.equal(MAX_AI_REPLY_CONTEXT_WINDOW, 60);
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

test('normalize continuous AI reply settings clamps invalid and out-of-range values', () => {
  assert.equal(
    normalizeAiReplyContinuousIntervalMinutes('abc'),
    DEFAULT_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES
  );
  assert.equal(
    normalizeAiReplyContinuousIntervalMinutes(0),
    MIN_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES
  );
  assert.equal(
    normalizeAiReplyContinuousIntervalMinutes(999),
    MAX_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES
  );
  assert.equal(normalizeAiReplyContinuousIntervalMinutes(15), 15);

  assert.equal(
    normalizeAiReplyContinuousMaxSentPerCycle('abc'),
    DEFAULT_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE
  );
  assert.equal(
    normalizeAiReplyContinuousMaxSentPerCycle(0),
    MIN_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE
  );
  assert.equal(
    normalizeAiReplyContinuousMaxSentPerCycle(999),
    MAX_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE
  );
  assert.equal(normalizeAiReplyContinuousMaxSentPerCycle(7), 7);

  assert.equal(
    normalizeAiReplyContinuousMaxPerMatchPerDay('abc'),
    DEFAULT_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY
  );
  assert.equal(
    normalizeAiReplyContinuousMaxPerMatchPerDay(0),
    MIN_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY
  );
  assert.equal(
    normalizeAiReplyContinuousMaxPerMatchPerDay(999),
    MAX_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY
  );
  assert.equal(normalizeAiReplyContinuousMaxPerMatchPerDay(2), 2);
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
    [AI_PROVIDER_SETTING_KEY]: AI_PROVIDER_TYPES.openAiCompatible,
    [AI_REPLY_SETTING_KEYS.apiUrl]: ' https://example.test/chat ',
    [AI_REPLY_SETTING_KEYS.compatibilityMode]: AI_REPLY_COMPATIBILITY_MODES.reasoningJson,
    [AI_REPLY_SETTING_KEYS.contextWindow]: '99',
    [AI_REPLY_SETTING_KEYS.maxTokens]: '99999',
    [AI_REPLY_SETTING_KEYS.model]: ' custom-model ',
    [AI_REPLY_SETTING_KEYS.reasoningEffort]: AI_REPLY_REASONING_EFFORTS.high,
    [AI_REPLY_SETTING_KEYS.addressInfo]: ' Rua Teste 123 ',
    [AI_REPLY_SETTING_KEYS.contactInfo]: ' WhatsApp +55 11 99999-9999 ',
    [AI_REPLY_SETTING_KEYS.continuousIntervalMinutes]: '999',
    [AI_REPLY_SETTING_KEYS.continuousMaxPerMatchPerDay]: '999',
    [AI_REPLY_SETTING_KEYS.continuousMaxSentPerCycle]: '999',
    [AI_REPLY_SETTING_KEYS.hardRules]: ' never use emojis ',
    [AI_REPLY_SETTING_KEYS.replyDelaySeconds]: '999',
    [AI_REPLY_SETTING_KEYS.styleExamples]: ' Match: oi -> Owner: opa ',
    [AI_REPLY_SETTING_KEYS.tone]: ' concise ',
    [AI_REPLY_SETTING_KEYS.userContext]: ' works late '
  };

  assert.deepEqual(readAiReplySettings((key, fallback) => settings[key] ?? fallback), {
    addressInfo: 'Rua Teste 123',
    apiUrl: 'https://example.test/chat',
    compatibilityMode: AI_REPLY_COMPATIBILITY_MODES.reasoningJson,
    contactInfo: 'WhatsApp +55 11 99999-9999',
    continuousIntervalMinutes: MAX_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES,
    continuousMaxPerMatchPerDay: MAX_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY,
    continuousMaxSentPerCycle: MAX_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE,
    hardRules: 'never use emojis',
    contextWindow: MAX_AI_REPLY_CONTEXT_WINDOW,
    maxTokens: MAX_AI_REPLY_MAX_TOKENS,
    model: 'custom-model',
    providerType: AI_PROVIDER_TYPES.openAiCompatible,
    reasoningEffort: AI_REPLY_REASONING_EFFORTS.high,
    replyDelaySeconds: MAX_AI_REPLY_DELAY_SECONDS,
    styleExamples: 'Match: oi -> Owner: opa',
    tone: 'concise',
    userContext: 'works late'
  });
});

test('readAiReplySettings ignores custom URLs for official providers', () => {
  const settings = {
    [AI_PROVIDER_SETTING_KEY]: AI_PROVIDER_TYPES.nvidiaNim,
    [AI_REPLY_SETTING_KEYS.apiUrl]: ' https://bifrost.yuricunha.com/v1 '
  };

  const result = readAiReplySettings((key, fallback) => settings[key] ?? fallback);

  assert.equal(result.apiUrl, 'https://integrate.api.nvidia.com/v1');
  assert.equal(result.providerType, AI_PROVIDER_TYPES.nvidiaNim);
});

test('readAiReplySettings falls back to safe defaults', () => {
  assert.deepEqual(readAiReplySettings(), {
    addressInfo: DEFAULT_AI_REPLY_ADDRESS_INFO,
    apiUrl: 'https://api.openai.com/v1',
    compatibilityMode: DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
    contactInfo: DEFAULT_AI_REPLY_CONTACT_INFO,
    continuousIntervalMinutes: DEFAULT_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES,
    continuousMaxPerMatchPerDay: DEFAULT_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY,
    continuousMaxSentPerCycle: DEFAULT_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE,
    hardRules: DEFAULT_AI_REPLY_HARD_RULES,
    contextWindow: DEFAULT_AI_REPLY_CONTEXT_WINDOW,
    maxTokens: DEFAULT_AI_REPLY_MAX_TOKENS,
    model: DEFAULT_AI_REPLY_MODEL,
    providerType: AI_PROVIDER_TYPES.openAi,
    reasoningEffort: DEFAULT_AI_REPLY_REASONING_EFFORT,
    replyDelaySeconds: DEFAULT_AI_REPLY_DELAY_SECONDS,
    styleExamples: DEFAULT_AI_REPLY_STYLE_EXAMPLES,
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
