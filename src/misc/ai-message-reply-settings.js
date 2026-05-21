const DEFAULT_AI_REPLY_TONE =
  'Reply in the same language as the conversation unless instructed otherwise. Short, casual, human, direct, and lightly playful only when the conversation invites it. No emojis by default. No virtual date suggestions. No dash or slash. Write like a human. Avoid polished assistant-like phrasing.';
const DEFAULT_AI_REPLY_USER_CONTEXT = '';
const DEFAULT_AI_REPLY_STYLE_EXAMPLES = '';
const DEFAULT_AI_REPLY_CONTACT_INFO = '';
const DEFAULT_AI_REPLY_ADDRESS_INFO = '';
const DEFAULT_AI_REPLY_HARD_RULES = '';
const DEFAULT_AI_REPLY_CONTEXT_WINDOW = 10;
const DEFAULT_AI_REPLY_MODEL = 'gpt-4o-mini';
const DEFAULT_AI_REPLY_MAX_TOKENS = 2048;
const DEFAULT_AI_REPLY_COMPATIBILITY_MODE = 'standardJson';
const DEFAULT_AI_REPLY_DELAY_SECONDS = 4;
const DEFAULT_AI_REPLY_REASONING_EFFORT = 'low';
const MIN_AI_REPLY_CONTEXT_WINDOW = 1;
const MAX_AI_REPLY_CONTEXT_WINDOW = 30;
const MIN_AI_REPLY_MAX_TOKENS = 128;
const MAX_AI_REPLY_MAX_TOKENS = 65536;
const MIN_AI_REPLY_DELAY_SECONDS = 0;
const MAX_AI_REPLY_DELAY_SECONDS = 60;

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
  legacyModel: 'aiModel',
  model: 'aiReplyModel',
  addressInfo: 'aiReplyAddressInfo',
  contactInfo: 'aiReplyContactInfo',
  hardRules: 'aiReplyHardRules',
  reasoningEffort: 'aiReplyReasoningEffort',
  replyDelaySeconds: 'aiReplyDelaySeconds',
  styleExamples: 'aiReplyStyleExamples',
  tone: 'aiReplyTone',
  userContext: 'aiReplyUserContext'
};

const AI_REPLY_REASONING_EFFORTS = {
  low: 'low',
  medium: 'medium',
  high: 'high'
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

const normalizeAiReplyDelaySeconds = (
  value,
  defaultValue = DEFAULT_AI_REPLY_DELAY_SECONDS
) => {
  const parsedValue = parseInt(value, 10);
  const safeValue = Number.isFinite(parsedValue) ? parsedValue : defaultValue;
  return Math.min(
    MAX_AI_REPLY_DELAY_SECONDS,
    Math.max(MIN_AI_REPLY_DELAY_SECONDS, safeValue)
  );
};

const normalizeAiReplyCompatibilityMode = (
  value,
  defaultValue = DEFAULT_AI_REPLY_COMPATIBILITY_MODE
) => {
  const mode = String(value || '').trim();
  return Object.values(AI_REPLY_COMPATIBILITY_MODES).includes(mode) ? mode : defaultValue;
};

const normalizeAiReplyReasoningEffort = (
  value,
  defaultValue = DEFAULT_AI_REPLY_REASONING_EFFORT
) => {
  const effort = String(value || '').trim();
  return Object.values(AI_REPLY_REASONING_EFFORTS).includes(effort) ? effort : defaultValue;
};

const readSettingValue = (readSetting, key, defaultValue) =>
  typeof readSetting === 'function' ? readSetting(key, defaultValue) : defaultValue;

const readTextSettingWithLegacy = ({
  readSetting,
  key,
  legacyKey,
  defaultValue = ''
}) => {
  const storedValue = String(readSettingValue(readSetting, key, '') || '').trim();
  if (storedValue) return storedValue;

  const legacyValue = String(readSettingValue(readSetting, legacyKey, '') || '').trim();
  return legacyValue || defaultValue;
};

const readAiReplySettings = (readSetting) => {
  const apiUrl = readSettingValue(readSetting, AI_REPLY_SETTING_KEYS.apiUrl, '').trim();
  const model = readTextSettingWithLegacy({
    readSetting,
    key: AI_REPLY_SETTING_KEYS.model,
    legacyKey: AI_REPLY_SETTING_KEYS.legacyModel,
    defaultValue: DEFAULT_AI_REPLY_MODEL
  });
  const tone =
    readSettingValue(readSetting, AI_REPLY_SETTING_KEYS.tone, DEFAULT_AI_REPLY_TONE).trim() ||
    DEFAULT_AI_REPLY_TONE;
  const userContext = readSettingValue(
    readSetting,
    AI_REPLY_SETTING_KEYS.userContext,
    DEFAULT_AI_REPLY_USER_CONTEXT
  ).trim();
  const styleExamples = readSettingValue(
    readSetting,
    AI_REPLY_SETTING_KEYS.styleExamples,
    DEFAULT_AI_REPLY_STYLE_EXAMPLES
  ).trim();
  const contactInfo = readSettingValue(
    readSetting,
    AI_REPLY_SETTING_KEYS.contactInfo,
    DEFAULT_AI_REPLY_CONTACT_INFO
  ).trim();
  const addressInfo = readSettingValue(
    readSetting,
    AI_REPLY_SETTING_KEYS.addressInfo,
    DEFAULT_AI_REPLY_ADDRESS_INFO
  ).trim();
  const hardRules = readSettingValue(
    readSetting,
    AI_REPLY_SETTING_KEYS.hardRules,
    DEFAULT_AI_REPLY_HARD_RULES
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
  const reasoningEffort = normalizeAiReplyReasoningEffort(
    readSettingValue(
      readSetting,
      AI_REPLY_SETTING_KEYS.reasoningEffort,
      DEFAULT_AI_REPLY_REASONING_EFFORT
    )
  );
  const replyDelaySeconds = normalizeAiReplyDelaySeconds(
    readSettingValue(
      readSetting,
      AI_REPLY_SETTING_KEYS.replyDelaySeconds,
      DEFAULT_AI_REPLY_DELAY_SECONDS
    )
  );

  return {
    addressInfo,
    apiUrl,
    compatibilityMode,
    contactInfo,
    hardRules,
    contextWindow,
    maxTokens,
    model,
    reasoningEffort,
    replyDelaySeconds,
    styleExamples,
    tone,
    userContext
  };
};

module.exports = {
  AI_REPLY_COMPATIBILITY_MODES,
  AI_REPLY_REASONING_EFFORTS,
  AI_REPLY_SETTING_KEYS,
  DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
  DEFAULT_AI_REPLY_ADDRESS_INFO,
  DEFAULT_AI_REPLY_CONTACT_INFO,
  DEFAULT_AI_REPLY_CONTEXT_WINDOW,
  DEFAULT_AI_REPLY_DELAY_SECONDS,
  DEFAULT_AI_REPLY_HARD_RULES,
  DEFAULT_AI_REPLY_MAX_TOKENS,
  DEFAULT_AI_REPLY_MODEL,
  DEFAULT_AI_REPLY_REASONING_EFFORT,
  DEFAULT_AI_REPLY_STYLE_EXAMPLES,
  DEFAULT_AI_REPLY_TONE,
  DEFAULT_AI_REPLY_USER_CONTEXT,
  MAX_AI_REPLY_DELAY_SECONDS,
  MAX_AI_REPLY_MAX_TOKENS,
  MAX_AI_REPLY_CONTEXT_WINDOW,
  MIN_AI_REPLY_DELAY_SECONDS,
  MIN_AI_REPLY_MAX_TOKENS,
  MIN_AI_REPLY_CONTEXT_WINDOW,
  normalizeAiReplyCompatibilityMode,
  normalizeAiReplyContextWindow,
  normalizeAiReplyDelaySeconds,
  normalizeAiReplyMaxTokens,
  normalizeAiReplyReasoningEffort,
  readAiReplySettings
};
