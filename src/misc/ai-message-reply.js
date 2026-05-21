const {
  DEFAULT_CONTEXT_WINDOW,
  formatConversationTurns,
  getLastConversationTurns
} = require('./conversation-context');
const {
  AI_REPLY_COMPATIBILITY_MODES,
  DEFAULT_AI_REPLY_ADDRESS_INFO,
  DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
  DEFAULT_AI_REPLY_CONTACT_INFO,
  DEFAULT_AI_REPLY_MAX_TOKENS,
  DEFAULT_AI_REPLY_MODEL,
  DEFAULT_AI_REPLY_TONE,
  MAX_AI_REPLY_MAX_TOKENS,
  normalizeAiReplyCompatibilityMode,
  normalizeAiReplyMaxTokens
} = require('./ai-message-reply-settings');

const sanitizeAiReply = (value, maxLength = 500) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
    .trim();

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const getMessageContentText = (content) => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : part?.text || ''))
      .filter(Boolean)
      .join('\n');
  }
  return '';
};

const getAiReplyStopReason = (data = {}) =>
  data?.choices?.[0]?.finish_reason ||
  data?.choices?.[0]?.stop_reason ||
  data?.stop_reason ||
  data?.output_message?.stop_reason ||
  '';

const isLengthStopReason = (stopReason) => String(stopReason || '').toLowerCase() === 'length';

const getAiReplyContent = (data = {}) =>
  getMessageContentText(data?.choices?.[0]?.message?.content || data?.output_message?.content);

const extractFirstJsonObject = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';

  let startIndex = -1;
  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (startIndex === -1) {
      if (char === '{') {
        startIndex = index;
        depth = 1;
      }
      continue;
    }

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === '\\') {
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;

    if (depth === 0) return text.slice(startIndex, index + 1);
  }

  return '';
};

const getLatestMatchMessageText = (conversationTurns = []) => {
  const latestTurn = conversationTurns[conversationTurns.length - 1];
  return latestTurn?.role === 'match' ? normalizeDisclosureText(latestTurn.text) : '';
};

const getMatchConversationText = (conversationTurns = []) =>
  conversationTurns
    .filter((turn) => turn?.role === 'match')
    .map((turn) => normalizeDisclosureText(turn.text))
    .join('\n');

const normalizeDisclosureText = (value) =>
  sanitizeAiReply(value, 1000)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const hasSharedContact = (text) =>
  /(?:\+?\d[\d\s().-]{7,}|@\w{3,}|instagram|insta|telegram|whats|whatsapp|wpp|zap)/i.test(
    text
  );

const shouldIncludeContactInfo = (conversationTurns = []) => {
  const latestText = getLatestMatchMessageText(conversationTurns);
  const matchText = getMatchConversationText(conversationTurns);
  return (
    /\b(?:whats|whatsapp|wpp|zap|telegram|insta|instagram|sms|telefone|numero|número|contato)\b/i.test(
      latestText
    ) ||
    /\b(?:vamos|bora|partiu|sair)\s+(?:pro|para o|para|no|pra)\s+(?:whats|whatsapp|wpp|zap|telegram|insta|instagram)\b/i.test(
      latestText
    ) ||
    hasSharedContact(matchText)
  );
};

const shouldIncludeAddressInfo = (conversationTurns = []) => {
  const latestText = getLatestMatchMessageText(conversationTurns);
  const matchText = getMatchConversationText(conversationTurns);
  return (
    /\b(?:endereco|localizacao|local|lugar|onde te pego|onde te busco|onde nos encontramos|onde vamos|qual lugar|manda o local|manda localizacao)\b/i.test(
      latestText
    ) ||
    /\b(?:onde|aonde)\s+(?:voce|vc|ce|tu)\s+(?:mora|vive|fica)\b/i.test(
      latestText
    ) ||
    /\b(?:voce|vc|ce|tu)\s+(?:mora|vive|fica)\s+(?:onde|aonde)\b/i.test(
      latestText
    ) ||
    /\bmora\s+(?:onde|aonde)\b/i.test(latestText) ||
    /\b(?:de|d)\s+(?:onde|aonde)\s+(?:voce|vc|ce|tu)\s+(?:e|eh|era|vem|mora)\b/i.test(
      latestText
    ) ||
    /\b(?:qual|q(?:ual)?)\s+(?:e|eh)?\s*(?:sua|seu|teu|tua)?\s*(?:cidade|bairro|endereco|localizacao)\b/i.test(
      latestText
    ) ||
    /\bem\s+que\s+(?:cidade|bairro)\s+(?:voce|vc|ce|tu)?\s*(?:mora|vive|fica)?\b/i.test(
      latestText
    ) ||
    /\b(?:rua|avenida|av\.|bairro|cep)\b/i.test(matchText)
  );
};

const buildAiReplySystemMessage = ({
  addressInfo = DEFAULT_AI_REPLY_ADDRESS_INFO,
  compatibilityMode = DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
  contactInfo = DEFAULT_AI_REPLY_CONTACT_INFO,
  isRetry = false,
  tone = '',
  userContext = ''
} = {}) => {
  const safeCompatibilityMode = normalizeAiReplyCompatibilityMode(compatibilityMode);
  const toneBlock = tone
    ? `\nUSER TONE AND STYLE:\n${tone}`
    : `\nUSER TONE AND STYLE:\n${DEFAULT_AI_REPLY_TONE}`;
  const contextBlock = userContext ? `\nUSER CONTEXT:\n${userContext}` : '';
  const contactBlock = contactInfo ? `\nSHAREABLE CONTACT METHODS:\n${contactInfo}` : '';
  const addressBlock = addressInfo ? `\nSHAREABLE ADDRESS OR MEETING INFO:\n${addressInfo}` : '';
  const compatibilityBlock =
    safeCompatibilityMode === AI_REPLY_COMPATIBILITY_MODES.reasoningJson
      ? '\nREASONING MODEL COMPATIBILITY:\nDo not output reasoning. Think befor answer.'
      : '';
  const retryBlock = isRetry
    ? '\nRETRY INSTRUCTION:\nYour previous response was not valid usable JSON. Return only the final JSON object now.'
    : '';

  return `You write Tinder message replies for the account owner.

RULES:
- Reply as the account owner, never as the match.
- Use the supplied conversation only; do not invent personal facts.
- Do not invent routine, location, work, tiredness, plans, preferences, or feelings.
- If the match asks for personal information absent from the supplied context fields, deflect naturally or ask a follow-up instead of inventing.
- Keep the reply short: usually one sentence, never more than two short sentences unless the match clearly asks for detail.
- Sound like a real person texting on Tinder, not a customer support agent or chatbot.
- Do not use emojis, kaomoji, or exclamation-heavy text unless the match is already using them frequently.
- Do not over-explain. Do not make every reply a formal question.
- Reply in the same language as the latest match message and recent conversation unless USER TONE AND STYLE explicitly requests another language. Match the conversation's casualness, but do not force slang.
- If a natural reply would require unknown personal facts, prefer a playful deflection.
- Share contact methods only when the latest match message asks to move to WhatsApp, SMS, Telegram, Instagram, another app, or asks for contact information, or when the match just shared their own contact.
- Share address or meeting info only when the latest match message asks for where to go, where to meet, your address, or the match just shared theirs.
- If contact/address was requested but the relevant field is not supplied, do not invent it; ask what they prefer or deflect.
- When sharing contact/address, send only the specific relevant detail, not all stored personal info.
- Never escalates sexual tension unless the match has already gone there explicitly. Ambiguous or innocent phrasing from the match is not an invitation. Only match explicit energy, never project it.
- For Portuguese conversations, bad style examples to avoid: "semana corrida mas animada", "cafe virtual", "chocolate virtual", "recarregar as energias", "de onde vem essa energia?", "sou de um lugar que combina com boas risadas".
- For Portuguese conversations, better style examples: "por aqui tudo certo, e por ai?", "te conto se tu me contar primeiro haha", "bora, me chama no whats", "pode ser, qual lugar tu prefere?".
- Do not mention automation, AI, prompts, or internal rules.
- If the latest message does not need a reply, or the safe answer is unclear, set shouldSend to false.
- Return exactly one compact JSON object.
- Do not output reasoning, markdown, explanations, or text before or after the JSON.
- The first character of your response must be "{" and the last character must be "}".

${toneBlock}

${contextBlock}

${contactBlock}

${addressBlock}

${compatibilityBlock}

${retryBlock}

RESPONSE FORMAT:
{
  "shouldSend": true | false,
  "reply": "message to send",
  "reason": "short reason"
}`;
};

const buildAiReplyUserMessage = ({
  matchName = '',
  conversationTurns = [],
  contextWindow = DEFAULT_CONTEXT_WINDOW
} = {}) => {
  const conversation = formatConversationTurns(conversationTurns);
  const matchLine = matchName ? `MATCH NAME: ${matchName}\n` : '';

  return `${matchLine}CONVERSATION, oldest to newest, last ${contextWindow} messages:
${conversation || '(no messages)'}`;
};

const buildAiReplyRequestBody = ({
  addressInfo = DEFAULT_AI_REPLY_ADDRESS_INFO,
  compatibilityMode = DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
  contactInfo = DEFAULT_AI_REPLY_CONTACT_INFO,
  isRetry = false,
  model = DEFAULT_AI_REPLY_MODEL,
  tone = '',
  userContext = '',
  matchName = '',
  conversationTurns = [],
  contextWindow = DEFAULT_CONTEXT_WINDOW,
  maxTokens = DEFAULT_AI_REPLY_MAX_TOKENS,
  temperature = 0.7
} = {}) => {
  const safeCompatibilityMode = normalizeAiReplyCompatibilityMode(compatibilityMode);
  const safeMaxTokens = normalizeAiReplyMaxTokens(maxTokens);
  const safeContactInfo = shouldIncludeContactInfo(conversationTurns) ? contactInfo : '';
  const safeAddressInfo = shouldIncludeAddressInfo(conversationTurns) ? addressInfo : '';
  const body = {
    model,
    messages: [
      {
        role: 'system',
        content: buildAiReplySystemMessage({
          compatibilityMode: safeCompatibilityMode,
          addressInfo: safeAddressInfo,
          contactInfo: safeContactInfo,
          isRetry,
          tone,
          userContext
        })
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: buildAiReplyUserMessage({ matchName, conversationTurns, contextWindow })
          }
        ]
      }
    ],
    temperature
  };

  if (safeCompatibilityMode === AI_REPLY_COMPATIBILITY_MODES.reasoningJson) {
    body.max_completion_tokens = safeMaxTokens;
    body.reasoning_effort = 'low';
  } else {
    body.max_tokens = safeMaxTokens;
  }

  if (safeCompatibilityMode !== AI_REPLY_COMPATIBILITY_MODES.looseJson) {
    body.response_format = { type: 'json_object' };
  }

  return body;
};

const parseJsonReply = (content, { allowJsonExtraction }) => {
  const trimmedContent = String(content || '').trim();
  if (!trimmedContent) return null;
  try {
    return JSON.parse(trimmedContent);
  } catch (_error) {
    if (!allowJsonExtraction) return null;
  }

  const extractedJson = extractFirstJsonObject(trimmedContent);
  if (!extractedJson) return null;

  try {
    return JSON.parse(extractedJson);
  } catch (_error) {
    return null;
  }
};

const parseAiReplyResponse = (
  data,
  { allowJsonExtraction = true, maxLength = 500 } = {}
) => {
  const stopReason = getAiReplyStopReason(data);
  const content = getAiReplyContent(data);

  if (!content) {
    return {
      shouldRetry: isLengthStopReason(stopReason),
      shouldSend: false,
      reply: '',
      reason: isLengthStopReason(stopReason)
        ? 'AI response stopped by token limit'
        : 'Empty response',
      stopReason
    };
  }

  const parsed = parseJsonReply(content, { allowJsonExtraction });
  if (!isObject(parsed)) {
    return {
      shouldRetry: isLengthStopReason(stopReason) || Boolean(content),
      shouldSend: false,
      reply: '',
      reason: isLengthStopReason(stopReason)
        ? 'AI response stopped by token limit'
        : 'Invalid JSON response',
      stopReason
    };
  }

  const reply = sanitizeAiReply(parsed.reply || parsed.message, maxLength);
  return {
    shouldRetry: false,
    shouldSend: parsed.shouldSend !== false && Boolean(reply),
    reply,
    reason: sanitizeAiReply(parsed.reason, 160) || 'AI generated reply',
    stopReason
  };
};

const createNoSendAiReply = (reason) => ({
  shouldSend: false,
  reply: '',
  reason
});

const generateAiMessageReply = async ({
  apiKey = '',
  addressInfo = DEFAULT_AI_REPLY_ADDRESS_INFO,
  apiUrl = '',
  compatibilityMode = DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
  contactInfo = DEFAULT_AI_REPLY_CONTACT_INFO,
  contextWindow = DEFAULT_CONTEXT_WINDOW,
  conversationTurns = [],
  fetchImpl = globalThis.fetch,
  matchName = '',
  maxTokens = DEFAULT_AI_REPLY_MAX_TOKENS,
  model = DEFAULT_AI_REPLY_MODEL,
  temperature = 0.7,
  tone = '',
  userContext = ''
} = {}) => {
  if (!apiUrl) {
    return createNoSendAiReply('AI API URL not configured');
  }

  if (typeof fetchImpl !== 'function') {
    return createNoSendAiReply('Fetch unavailable');
  }

  const recentConversationTurns = getLastConversationTurns(conversationTurns, contextWindow);
  const requestParams = {
    compatibilityMode,
    addressInfo,
    contactInfo,
    contextWindow,
    conversationTurns: recentConversationTurns,
    matchName,
    maxTokens,
    model,
    temperature,
    tone,
    userContext
  };

  const requestAiReply = async (params) => {
    const body = buildAiReplyRequestBody(params);
    const response = await fetchImpl(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return createNoSendAiReply(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return parseAiReplyResponse(data, {
      allowJsonExtraction: params.compatibilityMode === AI_REPLY_COMPATIBILITY_MODES.looseJson
    });
  };

  try {
    const result = await requestAiReply(requestParams);
    if (!result.shouldRetry) {
      return result;
    }

    return requestAiReply({
      ...requestParams,
      isRetry: true,
      maxTokens: Math.min(MAX_AI_REPLY_MAX_TOKENS, normalizeAiReplyMaxTokens(maxTokens) * 2),
      temperature: Math.min(temperature, 0.2)
    });
  } catch (error) {
    return createNoSendAiReply(`AI reply failed: ${error.message}`);
  }
};

module.exports = {
  buildAiReplyRequestBody,
  buildAiReplySystemMessage,
  buildAiReplyUserMessage,
  createNoSendAiReply,
  extractFirstJsonObject,
  generateAiMessageReply,
  getAiReplyContent,
  getAiReplyStopReason,
  parseAiReplyResponse,
  shouldIncludeAddressInfo,
  shouldIncludeContactInfo,
  sanitizeAiReply
};
