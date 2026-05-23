const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildAiModelsApiUrl,
  fetchAiModelList,
  normalizeAiModelListResponse
} = require('../src/misc/ai-model-list');
const { AI_PROVIDER_TYPES } = require('../src/misc/ai-provider-settings');

test('buildAiModelsApiUrl derives OpenAI-compatible model endpoints', () => {
  assert.equal(
    buildAiModelsApiUrl('https://bifrost.yuricunha.com'),
    'https://bifrost.yuricunha.com/v1/models'
  );
  assert.equal(
    buildAiModelsApiUrl('https://bifrost.yuricunha.com/v1'),
    'https://bifrost.yuricunha.com/v1/models'
  );
  assert.equal(
    buildAiModelsApiUrl('https://api.openai.com/v1/chat/completions'),
    'https://api.openai.com/v1/models'
  );
  assert.equal(
    buildAiModelsApiUrl('https://example.test/api/models?x=1'),
    'https://example.test/api/models'
  );
  assert.equal(
    buildAiModelsApiUrl('https://example.test/openai'),
    'https://example.test/openai/models'
  );
  assert.equal(buildAiModelsApiUrl('not a url'), '');
});

test('normalizeAiModelListResponse supports common provider shapes', () => {
  assert.deepEqual(
    normalizeAiModelListResponse({
      data: [{ id: 'z-model' }, { id: 'a-model' }, { id: 'z-model' }]
    }),
    ['a-model', 'z-model']
  );
  assert.deepEqual(normalizeAiModelListResponse({ models: ['gpt-a', 'gpt-b'] }), [
    'gpt-a',
    'gpt-b'
  ]);
  assert.deepEqual(normalizeAiModelListResponse({ items: [{ name: 'named-model' }] }), [
    'named-model'
  ]);
  assert.deepEqual(normalizeAiModelListResponse({ data: null }), []);
});

test('fetchAiModelList calls the derived models endpoint with auth', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({ data: [{ id: 'gpt-4o-mini' }] })
    };
  };

  const models = await fetchAiModelList({
    apiKey: 'secret',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    fetchImpl
  });

  assert.deepEqual(models, ['gpt-4o-mini']);
  assert.equal(calls[0].url, 'https://api.openai.com/v1/models');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer secret');
});

test('fetchAiModelList supports Anthropic model list headers', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({ data: [{ id: 'claude-sonnet-4-20250514' }] })
    };
  };

  const models = await fetchAiModelList({
    apiKey: 'secret',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    fetchImpl,
    providerType: AI_PROVIDER_TYPES.anthropic
  });

  assert.deepEqual(models, ['claude-sonnet-4-20250514']);
  assert.equal(calls[0].url, 'https://api.anthropic.com/v1/models');
  assert.equal(calls[0].options.headers['x-api-key'], 'secret');
  assert.equal(calls[0].options.headers.Authorization, undefined);
});

test('fetchAiModelList rejects missing fetch, missing URL, and API errors', async () => {
  await assert.rejects(() => fetchAiModelList({ fetchImpl: null }), /Fetch unavailable/);
  await assert.rejects(
    () => fetchAiModelList({ apiUrl: '', fetchImpl: async () => ({ ok: true }) }),
    /AI API URL not configured/
  );
  await assert.rejects(
    () =>
      fetchAiModelList({
        apiUrl: 'https://example.test/chat/completions',
        fetchImpl: async () => ({ ok: false, status: 401 })
      }),
    /Model list request failed: 401/
  );
});
