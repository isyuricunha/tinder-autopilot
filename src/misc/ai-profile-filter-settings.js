const {
  getAiProviderDefaultApiUrl,
  readAiProviderSettings
} = require('./ai-provider-settings');

const DEFAULT_AI_PROFILE_MODEL = 'gpt-4o-mini';
const DEFAULT_AI_PROFILE_REASONING_EFFORT = 'medium';

const AI_REASONING_EFFORTS = {
  low: 'low',
  medium: 'medium',
  high: 'high'
};

const AI_PROFILE_SETTING_KEYS = {
  apiUrl: 'aiApiUrl',
  filterRules: 'aiFilterRules',
  legacyModel: 'aiModel',
  legacyReasoningEffort: 'aiReasoningEffort',
  model: 'aiProfileModel',
  reasoningEffort: 'aiProfileReasoningEffort',
  useVision: 'aiUseVision'
};

const normalizeAiReasoningEffort = (
  value,
  defaultValue = DEFAULT_AI_PROFILE_REASONING_EFFORT
) => {
  const effort = String(value || '').trim();
  return Object.values(AI_REASONING_EFFORTS).includes(effort) ? effort : defaultValue;
};

const readSettingValue = (readSetting, key, defaultValue = '') =>
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

const readAiProfileFilterSettings = (readSetting) => {
  const { providerType } = readAiProviderSettings(readSetting);
  const apiUrl = String(
    readSettingValue(readSetting, AI_PROFILE_SETTING_KEYS.apiUrl, '') || ''
  ).trim();
  const reasoningEffort = readTextSettingWithLegacy({
    readSetting,
    key: AI_PROFILE_SETTING_KEYS.reasoningEffort,
    legacyKey: AI_PROFILE_SETTING_KEYS.legacyReasoningEffort,
    defaultValue: DEFAULT_AI_PROFILE_REASONING_EFFORT
  });

  return {
    apiUrl: apiUrl || getAiProviderDefaultApiUrl(providerType),
    filterRules: String(readSettingValue(readSetting, AI_PROFILE_SETTING_KEYS.filterRules, '') || '').trim(),
    model: readTextSettingWithLegacy({
      readSetting,
      key: AI_PROFILE_SETTING_KEYS.model,
      legacyKey: AI_PROFILE_SETTING_KEYS.legacyModel,
      defaultValue: DEFAULT_AI_PROFILE_MODEL
    }),
    reasoningEffort: normalizeAiReasoningEffort(reasoningEffort),
    useVision: readSettingValue(readSetting, AI_PROFILE_SETTING_KEYS.useVision, '') === 'true'
  };
};

module.exports = {
  AI_PROFILE_SETTING_KEYS,
  AI_REASONING_EFFORTS,
  DEFAULT_AI_PROFILE_MODEL,
  DEFAULT_AI_PROFILE_REASONING_EFFORT,
  normalizeAiReasoningEffort,
  readAiProfileFilterSettings
};
