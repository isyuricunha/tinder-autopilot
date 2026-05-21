const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildAiReplyRequestBody,
  buildAiReplySystemMessage,
  buildAiReplyUserMessage,
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

test('sanitizeAiReply trims whitespace and caps long replies', () => {
  assert.equal(sanitizeAiReply('  oi   tudo bem?  '), 'oi tudo bem?');
  assert.equal(sanitizeAiReply('abcdef', 3), 'abc');
});
