const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ANTHROPIC_VERSION,
  buildAiChatRequestOptions,
  buildAiModelsApiUrl,
  buildAiModelsRequestOptions,
  buildAnthropicRequestBody,
  getAiChatResponseContent,
  getAiChatStopReason,
  isAiChatLengthStopReason,
  normalizeProviderMessages
} = require('../src/misc/ai-chat-provider');
const { AI_PROVIDER_TYPES } = require('../src/misc/ai-provider-settings');

test('buildAiChatRequestOptions keeps OpenAI-compatible providers unchanged', () => {
  const body = {
    model: 'custom-model',
    messages: [{ role: 'user', content: 'Hello' }],
    response_format: { type: 'json_object' },
    max_tokens: 256
  };
  const options = buildAiChatRequestOptions({
    apiKey: 'secret',
    body,
    providerType: AI_PROVIDER_TYPES.mistral
  });

  assert.equal(options.method, 'POST');
  assert.equal(options.headers.Authorization, 'Bearer secret');
  assert.equal(options.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(options.body), body);
});

test('buildAiChatRequestOptions converts OpenAI body to Anthropic Messages API', () => {
  const options = buildAiChatRequestOptions({
    apiKey: 'secret',
    body: {
      model: 'claude-sonnet',
      messages: [
        { role: 'system', content: 'Reply as JSON.' },
        { role: 'user', content: [{ type: 'text', text: 'MATCH: oi' }] }
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 512,
      reasoning_effort: 'high',
      temperature: 0.2
    },
    providerType: AI_PROVIDER_TYPES.anthropic
  });
  const body = JSON.parse(options.body);

  assert.equal(options.method, 'POST');
  assert.equal(options.headers['x-api-key'], 'secret');
  assert.equal(options.headers['anthropic-version'], ANTHROPIC_VERSION);
  assert.equal(options.headers.Authorization, undefined);
  assert.equal(body.model, 'claude-sonnet');
  assert.equal(body.system, 'Reply as JSON.');
  assert.deepEqual(body.messages, [{ role: 'user', content: 'MATCH: oi' }]);
  assert.equal(body.max_tokens, 512);
  assert.equal(body.temperature, 0.2);
  assert.equal(body.response_format, undefined);
  assert.equal(body.reasoning_effort, undefined);
});

test('normalizeProviderMessages merges adjacent same-role messages for Anthropic', () => {
  assert.deepEqual(
    normalizeProviderMessages([
      { role: 'user', content: 'one' },
      { role: 'user', content: 'two' },
      { role: 'assistant', content: 'three' }
    ]),
    [
      { role: 'user', content: 'one\n\ntwo' },
      { role: 'assistant', content: 'three' }
    ]
  );
});

test('buildAnthropicRequestBody accepts max_tokens fallback', () => {
  const body = buildAnthropicRequestBody({
    model: 'claude-haiku',
    messages: [{ role: 'user', content: 'Hello' }],
    max_tokens: 128
  });

  assert.equal(body.max_tokens, 128);
  assert.deepEqual(body.messages, [{ role: 'user', content: 'Hello' }]);
});

test('AI chat response helpers support OpenAI and Anthropic response shapes', () => {
  assert.equal(
    getAiChatResponseContent({ choices: [{ message: { content: 'openai text' } }] }),
    'openai text'
  );
  assert.equal(
    getAiChatResponseContent({ content: [{ type: 'text', text: 'anthropic text' }] }),
    'anthropic text'
  );
  assert.equal(getAiChatStopReason({ choices: [{ finish_reason: 'length' }] }), 'length');
  assert.equal(getAiChatStopReason({ stop_reason: 'max_tokens' }), 'max_tokens');
  assert.equal(isAiChatLengthStopReason('length'), true);
  assert.equal(isAiChatLengthStopReason('max_tokens'), true);
  assert.equal(isAiChatLengthStopReason('stop'), false);
});

test('model list helpers build provider-specific URLs and headers', () => {
  assert.equal(
    buildAiModelsApiUrl({
      apiUrl: 'https://api.anthropic.com/v1/messages',
      providerType: AI_PROVIDER_TYPES.anthropic
    }),
    'https://api.anthropic.com/v1/models'
  );
  assert.equal(
    buildAiModelsApiUrl({
      apiUrl: 'https://integrate.api.nvidia.com/v1/chat/completions',
      providerType: AI_PROVIDER_TYPES.nvidiaNim
    }),
    'https://integrate.api.nvidia.com/v1/models'
  );

  const anthropicOptions = buildAiModelsRequestOptions({
    apiKey: 'secret',
    providerType: AI_PROVIDER_TYPES.anthropic
  });
  assert.equal(anthropicOptions.headers['x-api-key'], 'secret');
  assert.equal(anthropicOptions.headers['anthropic-version'], ANTHROPIC_VERSION);
  assert.equal(anthropicOptions.headers.Authorization, undefined);
});
