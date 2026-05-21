const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildAiReplyRequestBody,
  buildAiReplySystemMessage,
  buildAiReplyUserMessage,
  createNoSendAiReply,
  extractFirstJsonObject,
  generateAiMessageReply,
  parseAiReplyResponse,
  shouldIncludeAddressInfo,
  shouldIncludeContactInfo,
  sanitizeAiReply
} = require('../src/misc/ai-message-reply');
const { AI_REPLY_COMPATIBILITY_MODES } = require('../src/misc/ai-message-reply-settings');

test('buildAiReplySystemMessage includes tone and user context instructions', () => {
  const message = buildAiReplySystemMessage({
    addressInfo: 'Rua Teste 123',
    contactInfo: 'WhatsApp +55 11 99999-9999',
    tone: 'Playful, direct, Brazilian Portuguese.',
    userContext: 'I live in Sao Paulo and prefer casual dates.'
  });

  assert.equal(message.includes('Reply as the account owner'), true);
  assert.equal(message.includes('Do not invent routine'), true);
  assert.equal(message.includes('Do not use emojis'), true);
  assert.equal(message.includes('Share contact methods only when'), true);
  assert.equal(message.includes('Share address or meeting info only when'), true);
  assert.equal(message.includes('same language as the latest match message'), true);
  assert.equal(message.includes('For Portuguese conversations, bad style examples to avoid'), true);
  assert.equal(message.includes('cafe virtual'), true);
  assert.equal(message.includes('Playful, direct'), true);
  assert.equal(message.includes('I live in Sao Paulo'), true);
  assert.equal(message.includes('WhatsApp +55 11 99999-9999'), true);
  assert.equal(message.includes('Rua Teste 123'), true);
});

test('buildAiReplyUserMessage formats recent conversation turns', () => {
  const message = buildAiReplyUserMessage({
    matchName: 'Ana',
    contextWindow: 2,
    conversationTurns: [
      { role: 'user', text: 'Bom dia' },
      { role: 'match', text: 'Dormiu bem?' }
    ]
  });

  assert.equal(message.includes('MATCH NAME: Ana'), true);
  assert.equal(message.includes('USER: Bom dia'), true);
  assert.equal(message.includes('MATCH: Dormiu bem?'), true);
});

test('buildAiReplyRequestBody creates an OpenAI-compatible JSON response request', () => {
  const body = buildAiReplyRequestBody({
    model: 'gpt-4o-mini',
    tone: 'Short replies.',
    conversationTurns: [{ role: 'match', text: 'Oi' }]
  });

  assert.equal(body.model, 'gpt-4o-mini');
  assert.equal(body.response_format.type, 'json_object');
  assert.equal(body.max_tokens, 2048);
  assert.equal(body.messages[0].role, 'system');
  assert.equal(body.messages[1].content[0].type, 'text');
});

test('buildAiReplyRequestBody supports reasoning and loose JSON compatibility modes', () => {
  const reasoningBody = buildAiReplyRequestBody({
    compatibilityMode: AI_REPLY_COMPATIBILITY_MODES.reasoningJson,
    maxTokens: 1024
  });
  assert.equal(reasoningBody.max_completion_tokens, 1024);
  assert.equal(reasoningBody.reasoning_effort, 'low');
  assert.equal(reasoningBody.max_tokens, undefined);
  assert.equal(reasoningBody.response_format.type, 'json_object');

  const looseBody = buildAiReplyRequestBody({
    compatibilityMode: AI_REPLY_COMPATIBILITY_MODES.looseJson,
    maxTokens: 512
  });
  assert.equal(looseBody.max_tokens, 512);
  assert.equal(looseBody.response_format, undefined);
});

test('buildAiReplyRequestBody only includes contact and address info when requested', () => {
  const neutralBody = buildAiReplyRequestBody({
    contactInfo: 'WhatsApp +55 11 99999-9999',
    addressInfo: 'Rua Teste 123',
    conversationTurns: [{ role: 'match', text: 'Dormiu bem?' }]
  });
  assert.equal(neutralBody.messages[0].content.includes('WhatsApp +55'), false);
  assert.equal(neutralBody.messages[0].content.includes('Rua Teste 123'), false);

  const contactBody = buildAiReplyRequestBody({
    contactInfo: 'WhatsApp +55 11 99999-9999',
    conversationTurns: [{ role: 'match', text: 'Vamos sair daqui e ir pro whats?' }]
  });
  assert.equal(contactBody.messages[0].content.includes('WhatsApp +55'), true);

  const addressBody = buildAiReplyRequestBody({
    addressInfo: 'Rua Teste 123',
    conversationTurns: [{ role: 'match', text: 'Qual lugar tu prefere?' }]
  });
  assert.equal(addressBody.messages[0].content.includes('Rua Teste 123'), true);
});

test('contact and address disclosure detectors require relevant match context', () => {
  assert.equal(
    shouldIncludeContactInfo([{ role: 'match', text: 'Me passa teu whats?' }]),
    true
  );
  assert.equal(
    shouldIncludeContactInfo([{ role: 'match', text: 'Bom dia, tudo bem?' }]),
    false
  );
  assert.equal(
    shouldIncludeAddressInfo([{ role: 'match', text: 'Manda o local pra eu ir' }]),
    true
  );
  assert.equal(
    shouldIncludeAddressInfo([{ role: 'match', text: 'de onde vc era?' }]),
    true
  );
  assert.equal(
    shouldIncludeAddressInfo([{ role: 'match', text: 'aonde tu mora?' }]),
    true
  );
  assert.equal(
    shouldIncludeAddressInfo([{ role: 'match', text: 'mora onde?' }]),
    true
  );
  assert.equal(
    shouldIncludeAddressInfo([{ role: 'match', text: 'em que bairro voce fica?' }]),
    true
  );
  assert.equal(
    shouldIncludeAddressInfo([{ role: 'match', text: 'de onde vem essa energia?' }]),
    false
  );
});

test('parseAiReplyResponse returns sendable replies only from valid JSON', () => {
  const parsedReply = parseAiReplyResponse({
    choices: [
      {
        message: {
          content: JSON.stringify({
            shouldSend: true,
            reply: 'Bom dia! Dormi bem e voce?',
            reason: 'Answers question'
          })
        }
      }
    ]
  });
  assert.equal(parsedReply.shouldSend, true);
  assert.equal(parsedReply.reply, 'Bom dia! Dormi bem e voce?');
  assert.equal(parsedReply.reason, 'Answers question');
  assert.equal(parsedReply.shouldRetry, false);

  assert.deepEqual(parseAiReplyResponse({ choices: [] }), {
    shouldRetry: false,
    shouldSend: false,
    reply: '',
    reason: 'Empty response',
    stopReason: ''
  });
  assert.deepEqual(parseAiReplyResponse({ choices: [{ message: { content: 'not json' } }] }), {
    shouldRetry: true,
    shouldSend: false,
    reply: '',
    reason: 'Invalid JSON response',
    stopReason: ''
  });
});

test('parseAiReplyResponse extracts JSON from loose provider output and detects length stops', () => {
  assert.equal(
    extractFirstJsonObject('prefix {"shouldSend":true,"reply":"Oi","reason":"ok"} suffix'),
    '{"shouldSend":true,"reply":"Oi","reason":"ok"}'
  );

  const looseReply = parseAiReplyResponse(
    {
      choices: [
        {
          finish_reason: 'stop',
          message: {
            content: 'Sure: {"shouldSend":true,"reply":"Oi!","reason":"Greeting"}'
          }
        }
      ]
    },
    { allowJsonExtraction: true }
  );
  assert.equal(looseReply.shouldSend, true);
  assert.equal(looseReply.reply, 'Oi!');

  assert.deepEqual(parseAiReplyResponse({ choices: [{ finish_reason: 'length' }] }), {
    shouldRetry: true,
    shouldSend: false,
    reply: '',
    reason: 'AI response stopped by token limit',
    stopReason: 'length'
  });
});

test('createNoSendAiReply creates a guarded no-send fallback', () => {
  assert.deepEqual(createNoSendAiReply('Missing config'), {
    shouldSend: false,
    reply: '',
    reason: 'Missing config'
  });
});

test('generateAiMessageReply calls the AI API with recent context only', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                shouldSend: true,
                reply: 'Bom dia! Dormi bem, e voce?',
                reason: 'Answers latest question'
              })
            }
          }
        ]
      })
    };
  };

  const result = await generateAiMessageReply({
    apiKey: 'secret-key',
    apiUrl: 'https://example.test/chat',
    contextWindow: 2,
    conversationTurns: [
      { role: 'user', text: 'Old user message' },
      { role: 'match', text: 'Old match message' },
      { role: 'user', text: 'Bom dia' },
      { role: 'match', text: 'Dormiu bem?' }
    ],
    fetchImpl,
    matchName: 'Ana',
    model: 'custom-model',
    contactInfo: 'Telegram @me',
    addressInfo: 'Only share if asked where to meet.',
    tone: 'Short, warm replies.',
    userContext: 'Use Brazilian Portuguese.'
  });

  assert.equal(result.shouldSend, true);
  assert.equal(result.reply, 'Bom dia! Dormi bem, e voce?');
  assert.equal(result.reason, 'Answers latest question');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://example.test/chat');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer secret-key');

  const body = JSON.parse(calls[0].options.body);
  const prompt = body.messages[1].content[0].text;
  assert.equal(body.model, 'custom-model');
  assert.equal(body.messages[0].content.includes('Telegram @me'), false);
  assert.equal(body.messages[0].content.includes('Only share if asked where to meet.'), false);
  assert.equal(prompt.includes('MATCH NAME: Ana'), true);
  assert.equal(prompt.includes('Bom dia'), true);
  assert.equal(prompt.includes('Dormiu bem?'), true);
  assert.equal(prompt.includes('Old user message'), false);
});

test('generateAiMessageReply retries once when the provider stops by token length', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) {
      return {
        ok: true,
        json: async () => ({ choices: [{ finish_reason: 'length' }] })
      };
    }

    return {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                shouldSend: true,
                reply: 'Te conto se voce me contar primeiro haha',
                reason: 'Deflects missing location'
              })
            }
          }
        ]
      })
    };
  };

  const result = await generateAiMessageReply({
    apiUrl: 'https://example.test/chat',
    compatibilityMode: AI_REPLY_COMPATIBILITY_MODES.reasoningJson,
    conversationTurns: [{ role: 'match', text: 'De onde voce era?' }],
    fetchImpl,
    maxTokens: 768
  });

  assert.equal(result.shouldSend, true);
  assert.equal(result.reply, 'Te conto se voce me contar primeiro haha');
  assert.equal(calls.length, 2);

  const firstBody = JSON.parse(calls[0].options.body);
  const retryBody = JSON.parse(calls[1].options.body);
  assert.equal(firstBody.max_completion_tokens, 768);
  assert.equal(retryBody.max_completion_tokens, 1536);
  assert.equal(retryBody.messages[0].content.includes('RETRY INSTRUCTION'), true);
});

test('generateAiMessageReply returns no-send on missing config and API failures', async () => {
  let called = false;
  const unusedFetch = async () => {
    called = true;
  };

  assert.deepEqual(await generateAiMessageReply({ fetchImpl: unusedFetch }), {
    shouldSend: false,
    reply: '',
    reason: 'AI API URL not configured'
  });
  assert.equal(called, false);

  assert.deepEqual(
    await generateAiMessageReply({
      apiUrl: 'https://example.test/chat',
      fetchImpl: null
    }),
    {
      shouldSend: false,
      reply: '',
      reason: 'Fetch unavailable'
    }
  );

  assert.deepEqual(
    await generateAiMessageReply({
      apiUrl: 'https://example.test/chat',
      fetchImpl: async () => ({ ok: false, status: 500 })
    }),
    {
      shouldSend: false,
      reply: '',
      reason: 'AI API error: 500'
    }
  );
});

test('sanitizeAiReply trims whitespace and caps long replies', () => {
  assert.equal(sanitizeAiReply('  oi   tudo bem?  '), 'oi tudo bem?');
  assert.equal(sanitizeAiReply('abcdef', 3), 'abc');
});
