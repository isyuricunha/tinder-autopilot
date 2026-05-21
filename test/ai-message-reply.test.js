const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildAiReplyRequestBody,
  buildAiReplySystemMessage,
  buildAiReplyUserMessage,
  createNoSendAiReply,
  generateAiMessageReply,
  parseAiReplyResponse,
  sanitizeAiReply
} = require('../src/misc/ai-message-reply');

test('buildAiReplySystemMessage includes tone and user context instructions', () => {
  const message = buildAiReplySystemMessage({
    tone: 'Playful, direct, Brazilian Portuguese.',
    userContext: 'I live in Sao Paulo and prefer casual dates.'
  });

  assert.equal(message.includes('Reply as the account owner'), true);
  assert.equal(message.includes('Playful, direct'), true);
  assert.equal(message.includes('I live in Sao Paulo'), true);
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
  assert.equal(body.messages[0].role, 'system');
  assert.equal(body.messages[1].content[0].type, 'text');
});

test('parseAiReplyResponse returns sendable replies only from valid JSON', () => {
  assert.deepEqual(
    parseAiReplyResponse({
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
    }),
    {
      shouldSend: true,
      reply: 'Bom dia! Dormi bem e voce?',
      reason: 'Answers question'
    }
  );

  assert.deepEqual(parseAiReplyResponse({ choices: [] }), {
    shouldSend: false,
    reply: '',
    reason: 'Empty response'
  });
  assert.deepEqual(parseAiReplyResponse({ choices: [{ message: { content: 'not json' } }] }), {
    shouldSend: false,
    reply: '',
    reason: 'Invalid JSON response'
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
    tone: 'Short, warm replies.',
    userContext: 'Use Brazilian Portuguese.'
  });

  assert.deepEqual(result, {
    shouldSend: true,
    reply: 'Bom dia! Dormi bem, e voce?',
    reason: 'Answers latest question'
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://example.test/chat');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer secret-key');

  const body = JSON.parse(calls[0].options.body);
  const prompt = body.messages[1].content[0].text;
  assert.equal(body.model, 'custom-model');
  assert.equal(prompt.includes('MATCH NAME: Ana'), true);
  assert.equal(prompt.includes('Bom dia'), true);
  assert.equal(prompt.includes('Dormiu bem?'), true);
  assert.equal(prompt.includes('Old user message'), false);
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
