const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AI_PROFILE_SETTING_KEYS,
  AI_REASONING_EFFORTS,
  DEFAULT_AI_PROFILE_MODEL,
  DEFAULT_AI_PROFILE_REASONING_EFFORT,
  normalizeAiReasoningEffort,
  readAiProfileFilterSettings
} = require('../src/misc/ai-profile-filter-settings');
const {
  AI_PROVIDER_SETTING_KEY,
  AI_PROVIDER_TYPES
} = require('../src/misc/ai-provider-settings');

test('AI profile filter settings expose safe defaults', () => {
  assert.equal(DEFAULT_AI_PROFILE_MODEL, 'gpt-4o-mini');
  assert.equal(DEFAULT_AI_PROFILE_REASONING_EFFORT, AI_REASONING_EFFORTS.medium);
});

test('normalizeAiReasoningEffort accepts only known values', () => {
  assert.equal(normalizeAiReasoningEffort(AI_REASONING_EFFORTS.low), AI_REASONING_EFFORTS.low);
  assert.equal(normalizeAiReasoningEffort('unknown'), DEFAULT_AI_PROFILE_REASONING_EFFORT);
});

test('readAiProfileFilterSettings reads dedicated settings', () => {
  const settings = {
    [AI_PROFILE_SETTING_KEYS.apiUrl]: ' https://example.test/chat ',
    [AI_PROFILE_SETTING_KEYS.filterRules]: ' only verified profiles ',
    [AI_PROFILE_SETTING_KEYS.model]: ' profile-model ',
    [AI_PROFILE_SETTING_KEYS.reasoningEffort]: AI_REASONING_EFFORTS.high,
    [AI_PROFILE_SETTING_KEYS.useVision]: 'true'
  };

  assert.deepEqual(readAiProfileFilterSettings((key, fallback) => settings[key] ?? fallback), {
    apiUrl: 'https://example.test/chat',
    filterRules: 'only verified profiles',
    model: 'profile-model',
    reasoningEffort: AI_REASONING_EFFORTS.high,
    useVision: true
  });
});

test('readAiProfileFilterSettings falls back to legacy shared settings', () => {
  const settings = {
    [AI_PROVIDER_SETTING_KEY]: AI_PROVIDER_TYPES.anthropic,
    [AI_PROFILE_SETTING_KEYS.legacyModel]: ' legacy-model ',
    [AI_PROFILE_SETTING_KEYS.legacyReasoningEffort]: AI_REASONING_EFFORTS.low
  };

  assert.deepEqual(readAiProfileFilterSettings((key, fallback) => settings[key] ?? fallback), {
    apiUrl: 'https://api.anthropic.com/v1',
    filterRules: '',
    model: 'legacy-model',
    reasoningEffort: AI_REASONING_EFFORTS.low,
    useVision: false
  });
});
