const DEFAULT_AI_REPLY_TONE =
  'Natural, concise, warm, playful when appropriate, and written in Brazilian Portuguese.';
const DEFAULT_AI_REPLY_USER_CONTEXT = '';
const DEFAULT_AI_REPLY_CONTEXT_WINDOW = 5;
const DEFAULT_AI_REPLY_MODEL = 'gpt-4o-mini';
const DEFAULT_AI_REPLY_MAX_TOKENS = 768;
const DEFAULT_AI_REPLY_COMPATIBILITY_MODE = 'standardJson';
const MIN_AI_REPLY_CONTEXT_WINDOW = 1;
const MAX_AI_REPLY_CONTEXT_WINDOW = 10;
const MIN_AI_REPLY_MAX_TOKENS = 128;
const MAX_AI_REPLY_MAX_TOKENS = 4096;

const AI_REPLY_COMPATIBILITY_MODES = {
  standardJson: 'standardJson',
  reasoningJson: 'reasoningJson',
  looseJson: 'looseJson'
};

const AI_REPLY_SETTING_KEYS = {
  apiUrl: 'aiApiUrl',
  compatibilityMode: 'aiReplyCompatibilityMode',
  contextWindow: 'aiReplyContextWindow',
  maxTokens: 'aiReplyMaxTokens',
  model: 'aiModel',
  tone: 'aiReplyTone',
  userContext: 'aiReplyUserContext'
};

const normalizeAiReplyContextWindow = (value, defaultValue = DEFAULT_AI_REPLY_CONTEXT_WINDOW) => {
  const parsedValue = parseInt(value, 10);
  const safeValue = Number.isFinite(parsedValue) ? parsedValue : defaultValue;
  return Math.min(MAX_AI_REPLY_CONTEXT_WINDOW, Math.max(MIN_AI_REPLY_CONTEXT_WINDOW, safeValue));
};

const normalizeAiReplyMaxTokens = (value, defaultValue = DEFAULT_AI_REPLY_MAX_TOKENS) => {
  const parsedValue = parseInt(value, 10);
  const safeValue = Number.isFinite(parsedValue) ? parsedValue : defaultValue;
  return Math.min(MAX_AI_REPLY_MAX_TOKENS, Math.max(MIN_AI_REPLY_MAX_TOKENS, safeValue));
};

const normalizeAiReplyCompatibilityMode = (
  value,
  defaultValue = DEFAULT_AI_REPLY_COMPATIBILITY_MODE
) => {
  const mode = String(value || '').trim();
  return Object.values(AI_REPLY_COMPATIBILITY_MODES).includes(mode) ? mode : defaultValue;
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
  const maxTokens = normalizeAiReplyMaxTokens(
    readSettingValue(readSetting, AI_REPLY_SETTING_KEYS.maxTokens, DEFAULT_AI_REPLY_MAX_TOKENS)
  );
  const compatibilityMode = normalizeAiReplyCompatibilityMode(
    readSettingValue(
      readSetting,
      AI_REPLY_SETTING_KEYS.compatibilityMode,
      DEFAULT_AI_REPLY_COMPATIBILITY_MODE
    )
  );

  return {
    apiUrl,
    compatibilityMode,
    contextWindow,
    maxTokens,
    model,
    tone,
    userContext
  };
};

module.exports = {
  AI_REPLY_COMPATIBILITY_MODES,
  AI_REPLY_SETTING_KEYS,
  DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
  DEFAULT_AI_REPLY_CONTEXT_WINDOW,
  DEFAULT_AI_REPLY_MAX_TOKENS,
  DEFAULT_AI_REPLY_MODEL,
  DEFAULT_AI_REPLY_TONE,
  DEFAULT_AI_REPLY_USER_CONTEXT,
  MAX_AI_REPLY_MAX_TOKENS,
  MAX_AI_REPLY_CONTEXT_WINDOW,
  MIN_AI_REPLY_MAX_TOKENS,
  MIN_AI_REPLY_CONTEXT_WINDOW,
  normalizeAiReplyCompatibilityMode,
  normalizeAiReplyContextWindow,
  normalizeAiReplyMaxTokens,
  readAiReplySettings
};
