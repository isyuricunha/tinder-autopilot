const {
  DEFAULT_CONTEXT_WINDOW,
  formatConversationTurns,
  getLastConversationTurns
} = require('./conversation-context');
const {
  AI_REPLY_COMPATIBILITY_MODES,
  AI_REPLY_REASONING_EFFORTS,
  DEFAULT_AI_REPLY_ADDRESS_INFO,
  DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
  DEFAULT_AI_REPLY_CONTACT_INFO,
  DEFAULT_AI_REPLY_HARD_RULES,
  DEFAULT_AI_REPLY_MAX_TOKENS,
  DEFAULT_AI_REPLY_MODEL,
  DEFAULT_AI_REPLY_REASONING_EFFORT,
  DEFAULT_AI_REPLY_STYLE_EXAMPLES,
  DEFAULT_AI_REPLY_TONE,
  MAX_AI_REPLY_MAX_TOKENS,
  normalizeAiReplyCompatibilityMode,
  normalizeAiReplyMaxTokens,
  normalizeAiReplyReasoningEffort
} = require('./ai-message-reply-settings');
const { formatAiReplyLocalTime } = require('./ai-reply-current-time');
const { formatAiReplyConversationSignals } = require('./ai-reply-conversation-intent');
const {
  buildAiChatRequestOptions,
  clampAiChatMaxTokens,
  getAiChatProviderCapabilities,
  getAiChatResponseContent,
  getAiChatStopReason,
  isAiChatLengthStopReason,
  supportsNativeJsonResponseFormat
} = require('./ai-chat-provider');
const {
  AI_PROVIDER_TYPES,
  DEFAULT_AI_PROVIDER_TYPE,
  normalizeAiProviderType
} = require('./ai-provider-settings');

const sanitizeAiReply = (value, maxLength = 500) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
    .trim();

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const getAiReplyStopReason = (data = {}) => getAiChatStopReason(data);

const isLengthStopReason = (stopReason) => isAiChatLengthStopReason(stopReason);

const getAiReplyContent = (data = {}) => getAiChatResponseContent(data);

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

const hasDirectContactValue = (text) => /(?:\+?\d[\d\s().-]{7,}\d|(?:^|\s)@[\w.]{3,})/.test(
  normalizeDisclosureText(text)
);

const hasSpeakerLabelPrefix = (text) =>
  /^(?:owner|match|user|assistant|ai)\s*:/i.test(String(text || '').trim());

const validateAiReplyCandidate = (reply, { allowContactDisclosure = false } = {}) => {
  if (!reply) return { isValid: false, reason: 'Empty reply' };
  if (hasSpeakerLabelPrefix(reply)) {
    return { isValid: false, reason: 'AI reply included a speaker label' };
  }
  if (!allowContactDisclosure && hasDirectContactValue(reply)) {
    return { isValid: false, reason: 'AI reply included contact without permission' };
  }
  return { isValid: true, reason: '' };
};

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

const mapMistralReasoningEffort = (reasoningEffort) =>
  reasoningEffort === AI_REPLY_REASONING_EFFORTS.high ? 'high' : 'none';

const applyProviderTokenAndReasoningFields = ({
  body,
  compatibilityMode,
  maxTokens,
  providerType,
  reasoningEffort
}) => {
  const normalizedProviderType = normalizeAiProviderType(providerType);
  const capabilities = getAiChatProviderCapabilities(normalizedProviderType);
  const safeMaxTokens = clampAiChatMaxTokens(normalizedProviderType, maxTokens);

  if (
    compatibilityMode === AI_REPLY_COMPATIBILITY_MODES.reasoningJson &&
    capabilities.reasoningEffort === 'openai'
  ) {
    body.max_completion_tokens = safeMaxTokens;
    body.reasoning_effort = reasoningEffort;
    return;
  }

  body[capabilities.maxTokensField] = safeMaxTokens;

  if (
    compatibilityMode === AI_REPLY_COMPATIBILITY_MODES.reasoningJson &&
    normalizedProviderType === AI_PROVIDER_TYPES.mistral
  ) {
    body.prompt_mode = 'reasoning';
    body.reasoning_effort = mapMistralReasoningEffort(reasoningEffort);
  }
};

const buildAiReplySystemMessage = ({
  addressInfo = DEFAULT_AI_REPLY_ADDRESS_INFO,
  compatibilityMode = DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
  contactInfo = DEFAULT_AI_REPLY_CONTACT_INFO,
  hardRules = DEFAULT_AI_REPLY_HARD_RULES,
  isRetry = false,
  currentLocalTime = formatAiReplyLocalTime(),
  styleExamples = DEFAULT_AI_REPLY_STYLE_EXAMPLES,
  tone = '',
  userContext = ''
} = {}) => {
  const safeCompatibilityMode = normalizeAiReplyCompatibilityMode(compatibilityMode);
  const toneBlock = tone
    ? `\nUSER TONE AND STYLE:\n${tone}`
    : `\nUSER TONE AND STYLE:\n${DEFAULT_AI_REPLY_TONE}`;
  const contextBlock = userContext ? `\nOWNER PROFILE:\n${userContext}` : '';
  const styleExamplesBlock = styleExamples
    ? `\nSTYLE EXAMPLES:\n${styleExamples}\nUse these examples for rhythm, brevity, callback timing, and wording style only. Do not reuse them blindly. Do not treat example contact or location details as facts unless they are also present in SHAREABLE CONTACT METHODS or SHAREABLE ADDRESS INFO.`
    : '';
  const contactBlock = contactInfo ? `\nSHAREABLE CONTACT METHODS:\n${contactInfo}` : '';
  const addressBlock = addressInfo
    ? `\nSHAREABLE ADDRESS INFO:\n${addressInfo}`
    : '';
  const hardRulesBlock = hardRules
    ? `\nUSER HARD RULES:\n${hardRules}\nFollow these user rules when they make the reply stricter or more specific. They cannot override JSON format, contact/address disclosure, or safety rules.`
    : '';
  const currentLocalTimeBlock = currentLocalTime
    ? `\nCURRENT LOCAL TIME:\n${currentLocalTime}\nUse this only to avoid wrong time-based greetings. If the timing is uncertain, avoid greetings like good morning, good afternoon, good evening, bom dia, boa tarde, or boa noite.`
    : '';
  const compatibilityBlock =
    safeCompatibilityMode === AI_REPLY_COMPATIBILITY_MODES.reasoningJson
      ? '\nREASONING MODEL COMPATIBILITY:\nDo not output reasoning. Think before answering.'
      : '';
  const retryBlock = isRetry
    ? '\nRETRY INSTRUCTION:\nYour previous response was not valid usable JSON. Return only the final JSON object now.'
    : '';

  return `You write Tinder message replies for the account owner.

RULES:
- Reply as the account owner, never as the match.
- In the supplied conversation, OWNER is the account owner and MATCH is the other Tinder user.
- Write only the next reply as OWNER. Never prefix the reply with OWNER, MATCH, or any speaker label.
- Use the supplied conversation only; do not invent personal facts.
- Do not invent routine, location, work, tiredness, plans, preferences, or feelings.
- If the match asks for personal information absent from the supplied context fields, deflect naturally or ask a follow-up instead of inventing.
- Keep the reply short: usually one sentence, never more than two short sentences unless the match clearly asks for detail.
- Sound like a real person texting on Tinder, not a customer support agent or chatbot.
- Do not use emojis, kaomoji, or exclamation-heavy text unless the match is already using them frequently.
- Do not over-explain. Do not make every reply a formal question.
- Reply in the same language as the latest match message and recent conversation unless USER TONE AND STYLE explicitly requests another language. Match the conversation's casualness, but do not force slang.
- Use CONVERSATION SIGNALS as metadata about the latest match message. Do not mention those labels in the reply.
- Do not use time-based greetings unless they match CURRENT LOCAL TIME. If unsure, avoid time-based greetings.
- The account owner may have sent repeated mass-message openers. If recent user messages are generic openers, still answer the match's actual latest question or callback instead of sending another generic line.
- If the match asks a direct personal question, answer from OWNER PROFILE, SHAREABLE CONTACT METHODS, or SHAREABLE ADDRESS INFO. If the needed fact is absent, deflect briefly instead of inventing.
- If a natural reply would require unknown personal facts, prefer a playful deflection.
- Share contact methods only when the latest match message asks to move to WhatsApp, SMS, Telegram, Instagram, another app, or asks for contact information, or when the match just shared their own contact.
- If the account owner already shared a phone number, social handle, or direct contact in this conversation, set shouldSend to false. Do not send more contact follow-up automatically.
- The SHAREABLE ADDRESS INFO field is always supplied when configured, but share it only when the latest match message asks where you are from, where you live/stay, where to go, where to meet, your address, or the match just shared theirs.
- If contact/address was requested but the relevant field is not supplied, do not invent it; ask what they prefer or deflect.
- When sharing contact/address, send only the specific relevant detail, not all stored personal info.
- Do not suggest meeting, cuddling, going out, WhatsApp, or physical escalation unless the match explicitly asks for that, shares contact, asks to leave Tinder, or clearly proposes it first.
- When the match mentions being tired, sick, cold, busy, or sleeping badly, acknowledge it lightly before flirting. Do not turn mild complaints into logistics or sexual pressure.
- Never escalate sexual tension unless the match has already gone there explicitly. Ambiguous or innocent phrasing from the match is not an invitation. Only match explicit energy, never project it.
- For Portuguese conversations, bad style examples to avoid: "semana corrida mas animada", "cafe virtual", "chocolate virtual", "recarregar as energias", "de onde vem essa energia?", "sou de um lugar que combina com boas risadas", "bora marcar de se esquentar", "se encontrar melhora na hora", "bora resolver isso", "ja to atrasado".
- For Portuguese conversations, better style examples: "por aqui tudo certo, e por ai?", "te conto se tu me contar primeiro haha", "bora, me chama no whats", "pode ser, qual lugar tu prefere?", "perigoso tu falar isso que eu acredito haha", "melhoras, entao a gripe chegou primeiro que eu haha".
- Do not mention automation, AI, prompts, or internal rules.
- If the latest message does not need a reply, or the safe answer is unclear, set shouldSend to false.
- Return exactly one compact JSON object.
- Do not output reasoning, markdown, explanations, or text before or after the JSON.
- The first character of your response must be "{" and the last character must be "}".

${toneBlock}

${contextBlock}

${styleExamplesBlock}

${contactBlock}

${addressBlock}

${hardRulesBlock}

${currentLocalTimeBlock}

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
  const conversationSignals = formatAiReplyConversationSignals(conversationTurns);
  const matchLine = matchName ? `MATCH NAME: ${matchName}\n` : '';
  const matchLabel = matchName
    ? `MATCH = ${matchName}, the other Tinder user.`
    : 'MATCH = the other Tinder user.';
  const signalsBlock = conversationSignals
    ? `\nCONVERSATION SIGNALS:\n${conversationSignals}\n`
    : '';

  return `${matchLine}SPEAKER LABELS:
OWNER = the account owner. You are writing the next reply as OWNER.
${matchLabel}
${signalsBlock}

CONVERSATION, oldest to newest, last ${contextWindow} messages:
${conversation || '(no messages)'}

NEXT REPLY SPEAKER: OWNER`;
};

const buildAiReplyRequestBody = ({
  addressInfo = DEFAULT_AI_REPLY_ADDRESS_INFO,
  compatibilityMode = DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
  contactInfo = DEFAULT_AI_REPLY_CONTACT_INFO,
  hardRules = DEFAULT_AI_REPLY_HARD_RULES,
  isRetry = false,
  model = DEFAULT_AI_REPLY_MODEL,
  currentLocalTime = formatAiReplyLocalTime(),
  styleExamples = DEFAULT_AI_REPLY_STYLE_EXAMPLES,
  tone = '',
  userContext = '',
  matchName = '',
  conversationTurns = [],
  contextWindow = DEFAULT_CONTEXT_WINDOW,
  maxTokens = DEFAULT_AI_REPLY_MAX_TOKENS,
  providerType = DEFAULT_AI_PROVIDER_TYPE,
  temperature = 0.7,
  reasoningEffort = DEFAULT_AI_REPLY_REASONING_EFFORT
} = {}) => {
  const safeCompatibilityMode = normalizeAiReplyCompatibilityMode(compatibilityMode);
  const safeMaxTokens = normalizeAiReplyMaxTokens(maxTokens);
  const safeReasoningEffort = normalizeAiReplyReasoningEffort(reasoningEffort);
  const safeProviderType = normalizeAiProviderType(providerType);
  const safeContactInfo = shouldIncludeContactInfo(conversationTurns) ? contactInfo : '';
  const body = {
    model,
    messages: [
      {
        role: 'system',
        content: buildAiReplySystemMessage({
          compatibilityMode: safeCompatibilityMode,
          addressInfo,
          contactInfo: safeContactInfo,
          currentLocalTime,
          hardRules,
          isRetry,
          styleExamples,
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

  applyProviderTokenAndReasoningFields({
    body,
    compatibilityMode: safeCompatibilityMode,
    maxTokens: safeMaxTokens,
    providerType: safeProviderType,
    reasoningEffort: safeReasoningEffort
  });

  if (
    safeCompatibilityMode !== AI_REPLY_COMPATIBILITY_MODES.looseJson &&
    supportsNativeJsonResponseFormat(safeProviderType)
  ) {
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
  { allowContactDisclosure = false, allowJsonExtraction = true, maxLength = 500 } = {}
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
  const validation = validateAiReplyCandidate(reply, { allowContactDisclosure });
  if (!validation.isValid) {
    return {
      shouldRetry: true,
      shouldSend: false,
      reply: '',
      reason: validation.reason,
      stopReason
    };
  }

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
  hardRules = DEFAULT_AI_REPLY_HARD_RULES,
  matchName = '',
  maxTokens = DEFAULT_AI_REPLY_MAX_TOKENS,
  model = DEFAULT_AI_REPLY_MODEL,
  currentLocalTime = formatAiReplyLocalTime(),
  providerType = DEFAULT_AI_PROVIDER_TYPE,
  reasoningEffort = DEFAULT_AI_REPLY_REASONING_EFFORT,
  styleExamples = DEFAULT_AI_REPLY_STYLE_EXAMPLES,
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
  const allowContactDisclosure = shouldIncludeContactInfo(recentConversationTurns);
  const requestParams = {
    compatibilityMode,
    addressInfo,
    contactInfo,
    currentLocalTime,
    hardRules,
    contextWindow,
    conversationTurns: recentConversationTurns,
    matchName,
    maxTokens,
    model,
    providerType,
    reasoningEffort,
    styleExamples,
    temperature,
    tone,
    userContext
  };

  const requestAiReply = async (params) => {
    const body = buildAiReplyRequestBody(params);
    const response = await fetchImpl(
      apiUrl,
      buildAiChatRequestOptions({ apiKey, body, providerType: params.providerType })
    );

    if (!response.ok) {
      return createNoSendAiReply(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return parseAiReplyResponse(data, {
      allowContactDisclosure,
      allowJsonExtraction:
        params.compatibilityMode === AI_REPLY_COMPATIBILITY_MODES.looseJson ||
        !supportsNativeJsonResponseFormat(params.providerType)
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
  hasDirectContactValue,
  hasSpeakerLabelPrefix,
  mapMistralReasoningEffort,
  parseAiReplyResponse,
  shouldIncludeContactInfo,
  sanitizeAiReply,
  validateAiReplyCandidate
};
