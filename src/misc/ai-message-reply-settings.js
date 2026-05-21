const DEFAULT_AI_REPLY_TONE =
  'Natural, concise, warm, playful when appropriate, and written in Brazilian Portuguese.';
const DEFAULT_AI_REPLY_USER_CONTEXT = '';
const DEFAULT_AI_REPLY_CONTEXT_WINDOW = 5;
const MIN_AI_REPLY_CONTEXT_WINDOW = 1;
const MAX_AI_REPLY_CONTEXT_WINDOW = 10;

const normalizeAiReplyContextWindow = (value, defaultValue = DEFAULT_AI_REPLY_CONTEXT_WINDOW) => {
  const parsedValue = parseInt(value, 10);
  const safeValue = Number.isFinite(parsedValue) ? parsedValue : defaultValue;
  return Math.min(MAX_AI_REPLY_CONTEXT_WINDOW, Math.max(MIN_AI_REPLY_CONTEXT_WINDOW, safeValue));
};

module.exports = {
  DEFAULT_AI_REPLY_CONTEXT_WINDOW,
  DEFAULT_AI_REPLY_TONE,
  DEFAULT_AI_REPLY_USER_CONTEXT,
  MAX_AI_REPLY_CONTEXT_WINDOW,
  MIN_AI_REPLY_CONTEXT_WINDOW,
  normalizeAiReplyContextWindow
};
