const { DEFAULT_CONTEXT_WINDOW, formatConversationTurns } = require('./conversation-context');
const { DEFAULT_AI_REPLY_TONE } = require('./ai-message-reply-settings');

const DEFAULT_AI_REPLY_MODEL = 'gpt-4o-mini';

const sanitizeAiReply = (value, maxLength = 500) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
    .trim();

const buildAiReplySystemMessage = ({ tone = '', userContext = '' } = {}) => {
  const toneBlock = tone
    ? `\nUSER TONE AND STYLE:\n${tone}`
    : `\nUSER TONE AND STYLE:\n${DEFAULT_AI_REPLY_TONE}`;
  const contextBlock = userContext ? `\nUSER CONTEXT:\n${userContext}` : '';

  return `You write Tinder message replies for the account owner.

RULES:
- Reply as the account owner, never as the match.
- Use the supplied conversation only; do not invent personal facts.
- Keep the reply short unless the conversation clearly asks for detail.
- Do not mention automation, AI, prompts, or internal rules.
- If the latest message does not need a reply, or the safe answer is unclear, set shouldSend to false.
- Return only valid JSON.${toneBlock}${contextBlock}

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
  model = DEFAULT_AI_REPLY_MODEL,
  tone = '',
  userContext = '',
  matchName = '',
  conversationTurns = [],
  contextWindow = DEFAULT_CONTEXT_WINDOW,
  maxTokens = 160,
  temperature = 0.7
} = {}) => ({
  model,
  messages: [
    {
      role: 'system',
      content: buildAiReplySystemMessage({ tone, userContext })
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
  response_format: { type: 'json_object' },
  max_tokens: maxTokens,
  temperature
});

const parseAiReplyResponse = (data, { maxLength = 500 } = {}) => {
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    return { shouldSend: false, reply: '', reason: 'Empty response' };
  }

  try {
    const parsed = JSON.parse(content);
    const reply = sanitizeAiReply(parsed.reply || parsed.message, maxLength);
    return {
      shouldSend: parsed.shouldSend !== false && Boolean(reply),
      reply,
      reason: sanitizeAiReply(parsed.reason, 160) || 'AI generated reply'
    };
  } catch (_error) {
    return { shouldSend: false, reply: '', reason: 'Invalid JSON response' };
  }
};

module.exports = {
  buildAiReplyRequestBody,
  buildAiReplySystemMessage,
  buildAiReplyUserMessage,
  parseAiReplyResponse,
  sanitizeAiReply
};
