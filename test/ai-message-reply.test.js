const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildAiReplyRequestBody,
  buildAiReplySystemMessage,
  buildAiReplyUserMessage,
  createNoSendAiReply,
  extractFirstJsonObject,
  generateAiMessageReply,
  hasDirectContactValue,
  hasSpeakerLabelPrefix,
  parseAiReplyResponse,
  shouldIncludeContactInfo,
  sanitizeAiReply,
  validateAiReplyCandidate
} = require('../src/misc/ai-message-reply');
const {
  AI_REPLY_COMPATIBILITY_MODES,
  AI_REPLY_REASONING_EFFORTS
} = require('../src/misc/ai-message-reply-settings');
const { AI_PROVIDER_TYPES } = require('../src/misc/ai-provider-settings');

test('buildAiReplySystemMessage includes tone and user context instructions', () => {
  const message = buildAiReplySystemMessage({
    addressInfo: 'Rua Teste 123',
    contactInfo: 'WhatsApp +55 11 99999-9999',
    hardRules: 'Never ask two questions in one reply.',
    currentLocalTime: 'Thursday, 2026-05-21, 22:07, America/Sao_Paulo',
    styleExamples: 'Match: oi -> Owner: opa',
    tone: 'Playful, direct, Brazilian Portuguese.',
    userContext: 'I live in Sao Paulo and prefer casual dates.'
  });

  assert.equal(message.includes('Reply as the account owner'), true);
  assert.equal(message.includes('OWNER is the account owner'), true);
  assert.equal(message.includes('Write only the next reply as OWNER'), true);
  assert.equal(message.includes('Do not invent routine'), true);
  assert.equal(message.includes('Do not use emojis'), true);
  assert.equal(message.includes('Use CONVERSATION SIGNALS as metadata'), true);
  assert.equal(message.includes('Share contact methods only when'), true);
  assert.equal(message.includes('already shared a phone number'), true);
  assert.equal(message.includes('SHAREABLE ADDRESS INFO field is always supplied'), true);
  assert.equal(message.includes('SHAREABLE ADDRESS INFO'), true);
  assert.equal(message.includes('OWNER PROFILE'), true);
  assert.equal(message.includes('STYLE EXAMPLES'), true);
  assert.equal(message.includes('USER HARD RULES'), true);
  assert.equal(message.includes('Do not treat example contact or location details as facts'), true);
  assert.equal(message.includes('repeated mass-message openers'), true);
  assert.equal(message.includes('Do not suggest meeting'), true);
  assert.equal(message.includes('same language as the latest match message'), true);
  assert.equal(message.includes('For Portuguese conversations, bad style examples to avoid'), true);
  assert.equal(message.includes('cafe virtual'), true);
  assert.equal(message.includes('bora marcar de se esquentar'), true);
  assert.equal(message.includes('Playful, direct'), true);
  assert.equal(message.includes('I live in Sao Paulo'), true);
  assert.equal(message.includes('Match: oi -> Owner: opa'), true);
  assert.equal(message.includes('Never ask two questions'), true);
  assert.equal(message.includes('CURRENT LOCAL TIME'), true);
  assert.equal(message.includes('Thursday, 2026-05-21, 22:07'), true);
  assert.equal(message.includes('Do not use time-based greetings unless'), true);
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
  assert.equal(message.includes('SPEAKER LABELS'), true);
  assert.equal(message.includes('OWNER = the account owner'), true);
  assert.equal(message.includes('MATCH = Ana'), true);
  assert.equal(message.includes('OWNER: Bom dia'), true);
  assert.equal(message.includes('MATCH: Dormiu bem?'), true);
  assert.equal(message.includes('NEXT REPLY SPEAKER: OWNER'), true);
});

test('buildAiReplyUserMessage includes local conversation signals when useful', () => {
  const message = buildAiReplyUserMessage({
    matchName: 'Ana',
    conversationTurns: [{ role: 'match', text: 'vc é de onde?' }]
  });

  assert.equal(message.includes('CONVERSATION SIGNALS'), true);
  assert.equal(message.includes('asks about location'), true);
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
    maxTokens: 1024,
    reasoningEffort: AI_REPLY_REASONING_EFFORTS.high
  });
  assert.equal(reasoningBody.max_completion_tokens, 1024);
  assert.equal(reasoningBody.reasoning_effort, AI_REPLY_REASONING_EFFORTS.high);
  assert.equal(reasoningBody.max_tokens, undefined);
  assert.equal(reasoningBody.response_format.type, 'json_object');

  const looseBody = buildAiReplyRequestBody({
    compatibilityMode: AI_REPLY_COMPATIBILITY_MODES.looseJson,
    maxTokens: 512
  });
  assert.equal(looseBody.max_tokens, 512);
  assert.equal(looseBody.response_format, undefined);
});

test('buildAiReplyRequestBody adapts JSON and token fields for Mistral and NVIDIA NIM', () => {
  const mistralBody = buildAiReplyRequestBody({
    compatibilityMode: AI_REPLY_COMPATIBILITY_MODES.reasoningJson,
    maxTokens: 32768,
    providerType: AI_PROVIDER_TYPES.mistral,
    reasoningEffort: AI_REPLY_REASONING_EFFORTS.medium
  });
  assert.equal(mistralBody.max_tokens, 32768);
  assert.equal(mistralBody.max_completion_tokens, undefined);
  assert.equal(mistralBody.prompt_mode, 'reasoning');
  assert.equal(mistralBody.reasoning_effort, 'none');
  assert.deepEqual(mistralBody.response_format, { type: 'json_object' });

  const mistralHighReasoningBody = buildAiReplyRequestBody({
    compatibilityMode: AI_REPLY_COMPATIBILITY_MODES.reasoningJson,
    providerType: AI_PROVIDER_TYPES.mistral,
    reasoningEffort: AI_REPLY_REASONING_EFFORTS.high
  });
  assert.equal(mistralHighReasoningBody.reasoning_effort, 'high');

  const nimBody = buildAiReplyRequestBody({
    maxTokens: 65536,
    providerType: AI_PROVIDER_TYPES.nvidiaNim
  });
  assert.equal(nimBody.max_tokens, 65536);
  assert.equal(nimBody.max_completion_tokens, undefined);
  assert.equal(nimBody.response_format, undefined);
});

test('buildAiReplyRequestBody always includes address info and gates contact info', () => {
  const neutralBody = buildAiReplyRequestBody({
    contactInfo: 'WhatsApp +55 11 99999-9999',
    addressInfo: 'Rua Teste 123',
    conversationTurns: [{ role: 'match', text: 'Dormiu bem?' }]
  });
  assert.equal(neutralBody.messages[0].content.includes('WhatsApp +55'), false);
  assert.equal(neutralBody.messages[0].content.includes('Rua Teste 123'), true);

  const contactBody = buildAiReplyRequestBody({
    contactInfo: 'WhatsApp +55 11 99999-9999',
    conversationTurns: [{ role: 'match', text: 'Vamos sair daqui e ir pro whats?' }]
  });
  assert.equal(contactBody.messages[0].content.includes('WhatsApp +55'), true);

  const locationBody = buildAiReplyRequestBody({
    addressInfo: 'Santa Catarina',
    conversationTurns: [{ role: 'match', text: 'kkkkkk você é de onde mesmo?' }]
  });
  assert.equal(locationBody.messages[0].content.includes('Santa Catarina'), true);
});

test('contact disclosure detector requires relevant match context', () => {
  assert.equal(
    shouldIncludeContactInfo([{ role: 'match', text: 'Me passa teu whats?' }]),
    true
  );
  assert.equal(
    shouldIncludeContactInfo([{ role: 'match', text: 'Bom dia, tudo bem?' }]),
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

test('parseAiReplyResponse blocks unsafe AI reply candidates', () => {
  assert.equal(hasSpeakerLabelPrefix('OWNER: oi'), true);
  assert.equal(hasDirectContactValue('me chama no @teste'), true);
  assert.deepEqual(validateAiReplyCandidate('opa'), { isValid: true, reason: '' });

  assert.deepEqual(
    parseAiReplyResponse({
      choices: [
        {
          message: {
            content: JSON.stringify({
              shouldSend: true,
              reply: 'OWNER: oi',
              reason: 'bad prefix'
            })
          }
        }
      ]
    }),
    {
      shouldRetry: true,
      shouldSend: false,
      reply: '',
      reason: 'AI reply included a speaker label',
      stopReason: ''
    }
  );

  assert.deepEqual(
    parseAiReplyResponse({
      choices: [
        {
          message: {
            content: JSON.stringify({
              shouldSend: true,
              reply: 'me chama no @teste',
              reason: 'bad contact'
            })
          }
        }
      ]
    }),
    {
      shouldRetry: true,
      shouldSend: false,
      reply: '',
      reason: 'AI reply included contact without permission',
      stopReason: ''
    }
  );

  assert.equal(
    parseAiReplyResponse(
      {
        choices: [
          {
            message: {
              content: JSON.stringify({
                shouldSend: true,
                reply: 'me chama no @teste',
                reason: 'allowed contact'
              })
            }
          }
        ]
      },
      { allowContactDisclosure: true }
    ).shouldSend,
    true
  );
});

test('parseAiReplyResponse supports Anthropic message responses', () => {
  const parsedReply = parseAiReplyResponse({
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          shouldSend: true,
          reply: 'opa, tudo certo por aqui',
          reason: 'Answers greeting'
        })
      }
    ],
    stop_reason: 'end_turn'
  });

  assert.equal(parsedReply.shouldSend, true);
  assert.equal(parsedReply.reply, 'opa, tudo certo por aqui');
  assert.equal(parsedReply.stopReason, 'end_turn');

  assert.deepEqual(parseAiReplyResponse({ stop_reason: 'max_tokens' }), {
    shouldRetry: true,
    shouldSend: false,
    reply: '',
    reason: 'AI response stopped by token limit',
    stopReason: 'max_tokens'
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
    currentLocalTime: 'Thursday, 2026-05-21, 22:07, America/Sao_Paulo',
    contactInfo: 'Telegram @me',
    addressInfo: 'Only share if asked where to meet.',
    hardRules: 'Never use emojis.',
    styleExamples: 'Match: oi -> Owner: opa',
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
  assert.equal(body.messages[0].content.includes('Only share if asked where to meet.'), true);
  assert.equal(body.messages[0].content.includes('Never use emojis.'), true);
  assert.equal(body.messages[0].content.includes('Match: oi -> Owner: opa'), true);
  assert.equal(body.messages[0].content.includes('Thursday, 2026-05-21, 22:07'), true);
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

test('generateAiMessageReply converts requests for Anthropic provider', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              shouldSend: true,
              reply: 'te conto se tu me contar primeiro haha',
              reason: 'Deflects location'
            })
          }
        ],
        stop_reason: 'end_turn'
      })
    };
  };

  const result = await generateAiMessageReply({
    apiKey: 'secret-key',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    conversationTurns: [{ role: 'match', text: 'tu mora onde?' }],
    fetchImpl,
    matchName: 'Ana',
    model: 'claude-sonnet',
    providerType: AI_PROVIDER_TYPES.anthropic
  });

  assert.equal(result.shouldSend, true);
  assert.equal(result.reply, 'te conto se tu me contar primeiro haha');
  assert.equal(calls[0].url, 'https://api.anthropic.com/v1/messages');
  assert.equal(calls[0].options.headers['x-api-key'], 'secret-key');
  assert.equal(calls[0].options.headers.Authorization, undefined);

  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.model, 'claude-sonnet');
  assert.equal(body.system.includes('You write Tinder message replies'), true);
  assert.equal(body.messages[0].role, 'user');
  assert.equal(body.messages[0].content.includes('MATCH NAME: Ana'), true);
  assert.equal(body.messages[0].content.includes('CONVERSATION SIGNALS'), true);
  assert.equal(body.messages[0].content.includes('asks about location'), true);
  assert.equal(body.messages[0].content.includes('MATCH: tu mora onde?'), true);
  assert.equal(body.response_format, undefined);
});

test('generateAiMessageReply extracts JSON for providers without native JSON mode', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({
        choices: [
          {
            finish_reason: 'stop',
            message: {
              content: 'Here is the JSON: {"shouldSend":true,"reply":"opa","reason":"ok"}'
            }
          }
        ]
      })
    };
  };

  const result = await generateAiMessageReply({
    apiUrl: 'https://integrate.api.nvidia.com/v1/chat/completions',
    conversationTurns: [{ role: 'match', text: 'oi' }],
    fetchImpl,
    providerType: AI_PROVIDER_TYPES.nvidiaNim
  });

  assert.equal(result.shouldSend, true);
  assert.equal(result.reply, 'opa');
  assert.equal(JSON.parse(calls[0].options.body).response_format, undefined);
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
