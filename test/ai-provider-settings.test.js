const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AI_PROVIDER_DEFAULT_API_URLS,
  AI_PROVIDER_LABELS,
  AI_PROVIDER_SETTING_KEY,
  AI_PROVIDER_TYPES,
  DEFAULT_AI_PROVIDER_TYPE,
  canEditAiProviderApiUrl,
  getAiProviderLabel,
  getAiProviderDefaultApiUrl,
  isKnownAiProviderDefaultApiUrl,
  normalizeAiProviderType,
  resolveAiProviderControlApiUrl,
  resolveAiProviderApiUrl,
  readAiProviderSettings
} = require('../src/misc/ai-provider-settings');

test('AI provider settings expose safe defaults', () => {
  assert.equal(DEFAULT_AI_PROVIDER_TYPE, AI_PROVIDER_TYPES.openAi);
  assert.equal(
    AI_PROVIDER_DEFAULT_API_URLS[AI_PROVIDER_TYPES.openAi],
    'https://api.openai.com/v1'
  );
  assert.equal(
    AI_PROVIDER_DEFAULT_API_URLS[AI_PROVIDER_TYPES.anthropic],
    'https://api.anthropic.com/v1'
  );
  assert.equal(
    AI_PROVIDER_DEFAULT_API_URLS[AI_PROVIDER_TYPES.nvidiaNim],
    'https://integrate.api.nvidia.com/v1'
  );
  assert.equal(AI_PROVIDER_LABELS[AI_PROVIDER_TYPES.openAi], 'OpenAI');
  assert.equal(AI_PROVIDER_LABELS[AI_PROVIDER_TYPES.openAiCompatible], 'OpenAI-Compatible');
});

test('normalizeAiProviderType accepts only known providers', () => {
  assert.equal(normalizeAiProviderType(AI_PROVIDER_TYPES.mistral), AI_PROVIDER_TYPES.mistral);
  assert.equal(normalizeAiProviderType('unknown'), DEFAULT_AI_PROVIDER_TYPE);
});

test('provider default URLs are readable and detectable', () => {
  assert.equal(
    getAiProviderDefaultApiUrl(AI_PROVIDER_TYPES.mistral),
    'https://api.mistral.ai/v1'
  );
  assert.equal(isKnownAiProviderDefaultApiUrl('https://api.mistral.ai/v1/'), true);
  assert.equal(isKnownAiProviderDefaultApiUrl('https://api.mistral.ai/v1/chat/completions/'), true);
  assert.equal(isKnownAiProviderDefaultApiUrl('https://example.test/custom/chat'), false);
});

test('only OpenAI-compatible providers can use a custom API URL', () => {
  assert.equal(canEditAiProviderApiUrl(AI_PROVIDER_TYPES.openAiCompatible), true);
  assert.equal(canEditAiProviderApiUrl(AI_PROVIDER_TYPES.openAi), false);
  assert.equal(canEditAiProviderApiUrl(AI_PROVIDER_TYPES.mistral), false);
  assert.equal(canEditAiProviderApiUrl(AI_PROVIDER_TYPES.anthropic), false);
  assert.equal(canEditAiProviderApiUrl(AI_PROVIDER_TYPES.nvidiaNim), false);
});

test('resolveAiProviderApiUrl keeps custom URLs scoped to OpenAI-compatible APIs', () => {
  assert.equal(
    resolveAiProviderApiUrl({
      apiUrl: ' https://bifrost.yuricunha.com/v1 ',
      providerType: AI_PROVIDER_TYPES.openAiCompatible
    }),
    'https://bifrost.yuricunha.com/v1'
  );
  assert.equal(
    resolveAiProviderApiUrl({
      apiUrl: ' https://bifrost.yuricunha.com/v1 ',
      providerType: AI_PROVIDER_TYPES.nvidiaNim
    }),
    'https://integrate.api.nvidia.com/v1'
  );
  assert.equal(
    resolveAiProviderApiUrl({
      apiUrl: ' https://proxy.test/v1 ',
      providerType: AI_PROVIDER_TYPES.anthropic
    }),
    'https://api.anthropic.com/v1'
  );
  assert.equal(
    resolveAiProviderApiUrl({
      providerType: AI_PROVIDER_TYPES.openAiCompatible
    }),
    'https://api.openai.com/v1'
  );
});

test('resolveAiProviderControlApiUrl restores saved custom URLs when returning to OpenAI-compatible', () => {
  assert.equal(
    resolveAiProviderControlApiUrl({
      fieldApiUrl: 'https://integrate.api.nvidia.com/v1',
      preferStoredUrl: true,
      providerType: AI_PROVIDER_TYPES.openAiCompatible,
      storedApiUrl: 'https://bifrost.yuricunha.com/v1'
    }),
    'https://bifrost.yuricunha.com/v1'
  );
  assert.equal(
    resolveAiProviderControlApiUrl({
      fieldApiUrl: 'https://integrate.api.nvidia.com/v1',
      preferStoredUrl: true,
      providerType: AI_PROVIDER_TYPES.openAiCompatible,
      storedApiUrl: ''
    }),
    'https://api.openai.com/v1'
  );
  assert.equal(
    resolveAiProviderControlApiUrl({
      fieldApiUrl: 'https://custom.test/v1',
      providerType: AI_PROVIDER_TYPES.openAiCompatible,
      storedApiUrl: 'https://old.test/v1'
    }),
    'https://custom.test/v1'
  );
});

test('provider labels are readable and normalize unknown values', () => {
  assert.equal(getAiProviderLabel(AI_PROVIDER_TYPES.anthropic), 'Anthropic');
  assert.equal(getAiProviderLabel('unknown'), 'OpenAI');
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
