const DEFAULT_AI_REPLY_TONE =
  'Natural, concise, warm, playful when appropriate, and written in Brazilian Portuguese.';
const DEFAULT_AI_REPLY_USER_CONTEXT = '';
const DEFAULT_AI_REPLY_CONTEXT_WINDOW = 5;
const DEFAULT_AI_REPLY_MODEL = 'gpt-4o-mini';
const MIN_AI_REPLY_CONTEXT_WINDOW = 1;
const MAX_AI_REPLY_CONTEXT_WINDOW = 10;

const AI_REPLY_SETTING_KEYS = {
  apiUrl: 'aiApiUrl',
  contextWindow: 'aiReplyContextWindow',
  model: 'aiModel',
  tone: 'aiReplyTone',
  userContext: 'aiReplyUserContext'
};

const normalizeAiReplyContextWindow = (value, defaultValue = DEFAULT_AI_REPLY_CONTEXT_WINDOW) => {
  const parsedValue = parseInt(value, 10);
  const safeValue = Number.isFinite(parsedValue) ? parsedValue : defaultValue;
  return Math.min(MAX_AI_REPLY_CONTEXT_WINDOW, Math.max(MIN_AI_REPLY_CONTEXT_WINDOW, safeValue));
};

const readSettingValue = (readSetting, key, defaultValue) =>
  typeof readSetting === 'function' ? readSetting(key, defaultValue) : defaultValue;

const readAiReplySettings = (readSetting) => {
  const apiUrl = readSettingValue(readSetting, AI_REPLY_SETTING_KEYS.apiUrl, '').trim();
  const model =
    readSettingValue(readSetting, AI_REPLY_SETTING_KEYS.model, DEFAULT_AI_REPLY_MODEL).trim() ||
    DEFAULT_AI_REPLY_MODEL;
  const tone =
    readSettingValue(readSetting, AI_REPLY_SETTING_KEYS.tone, DEFAULT_AI_REPLY_TONE).trim() ||
    DEFAULT_AI_REPLY_TONE;
  const userContext = readSettingValue(
    readSetting,
    AI_REPLY_SETTING_KEYS.userContext,
    DEFAULT_AI_REPLY_USER_CONTEXT
  ).trim();
  const contextWindow = normalizeAiReplyContextWindow(
    readSettingValue(
      readSetting,
      AI_REPLY_SETTING_KEYS.contextWindow,
      DEFAULT_AI_REPLY_CONTEXT_WINDOW
    )
  );

  return {
    apiUrl,
    contextWindow,
    model,
    tone,
    userContext
  };
};

module.exports = {
  AI_REPLY_SETTING_KEYS,
  DEFAULT_AI_REPLY_CONTEXT_WINDOW,
  DEFAULT_AI_REPLY_MODEL,
  DEFAULT_AI_REPLY_TONE,
  DEFAULT_AI_REPLY_USER_CONTEXT,
  MAX_AI_REPLY_CONTEXT_WINDOW,
  MIN_AI_REPLY_CONTEXT_WINDOW,
  normalizeAiReplyContextWindow,
  readAiReplySettings
};
