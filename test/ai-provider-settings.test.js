const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AI_PROVIDER_DEFAULT_API_URLS,
  AI_PROVIDER_SETTING_KEY,
  AI_PROVIDER_TYPES,
  DEFAULT_AI_PROVIDER_TYPE,
  getAiProviderDefaultApiUrl,
  isKnownAiProviderDefaultApiUrl,
  normalizeAiProviderType,
  readAiProviderSettings
} = require('../src/misc/ai-provider-settings');

test('AI provider settings expose safe defaults', () => {
  assert.equal(DEFAULT_AI_PROVIDER_TYPE, AI_PROVIDER_TYPES.openAiCompatible);
  assert.equal(
    AI_PROVIDER_DEFAULT_API_URLS[AI_PROVIDER_TYPES.openAiCompatible],
    'https://api.openai.com/v1/chat/completions'
  );
  assert.equal(
    AI_PROVIDER_DEFAULT_API_URLS[AI_PROVIDER_TYPES.anthropic],
    'https://api.anthropic.com/v1/messages'
  );
  assert.equal(
    AI_PROVIDER_DEFAULT_API_URLS[AI_PROVIDER_TYPES.nvidiaNim],
    'https://integrate.api.nvidia.com/v1/chat/completions'
  );
});

test('normalizeAiProviderType accepts only known providers', () => {
  assert.equal(normalizeAiProviderType(AI_PROVIDER_TYPES.mistral), AI_PROVIDER_TYPES.mistral);
  assert.equal(normalizeAiProviderType('unknown'), DEFAULT_AI_PROVIDER_TYPE);
});

test('provider default URLs are readable and detectable', () => {
  assert.equal(
    getAiProviderDefaultApiUrl(AI_PROVIDER_TYPES.mistral),
    'https://api.mistral.ai/v1/chat/completions'
  );
  assert.equal(isKnownAiProviderDefaultApiUrl('https://api.mistral.ai/v1/chat/completions/'), true);
  assert.equal(isKnownAiProviderDefaultApiUrl('https://example.test/custom/chat'), false);
});

test('readAiProviderSettings reads and normalizes stored provider', () => {
  const settings = {
    [AI_PROVIDER_SETTING_KEY]: AI_PROVIDER_TYPES.anthropic
  };

  assert.deepEqual(readAiProviderSettings((key, fallback) => settings[key] ?? fallback), {
    providerType: AI_PROVIDER_TYPES.anthropic
  });
  assert.deepEqual(readAiProviderSettings(), {
    providerType: DEFAULT_AI_PROVIDER_TYPE
  });
});
