const AI_PROVIDER_SETTING_KEY = 'aiProviderType';

const AI_PROVIDER_TYPES = {
  anthropic: 'anthropic',
  mistral: 'mistral',
  nvidiaNim: 'nvidiaNim',
  openAi: 'openAi',
  openAiCompatible: 'openAiCompatible'
};

const DEFAULT_AI_PROVIDER_TYPE = AI_PROVIDER_TYPES.openAi;

const AI_PROVIDER_DEFAULT_API_URLS = {
  [AI_PROVIDER_TYPES.anthropic]: 'https://api.anthropic.com/v1',
  [AI_PROVIDER_TYPES.mistral]: 'https://api.mistral.ai/v1',
  [AI_PROVIDER_TYPES.nvidiaNim]: 'https://integrate.api.nvidia.com/v1',
  [AI_PROVIDER_TYPES.openAi]: 'https://api.openai.com/v1',
  [AI_PROVIDER_TYPES.openAiCompatible]: 'https://api.openai.com/v1'
};

const AI_PROVIDER_KNOWN_API_URLS = {
  [AI_PROVIDER_TYPES.anthropic]: [
    'https://api.anthropic.com/v1',
    'https://api.anthropic.com/v1/messages'
  ],
  [AI_PROVIDER_TYPES.mistral]: [
    'https://api.mistral.ai/v1',
    'https://api.mistral.ai/v1/chat/completions'
  ],
  [AI_PROVIDER_TYPES.nvidiaNim]: [
    'https://integrate.api.nvidia.com/v1',
    'https://integrate.api.nvidia.com/v1/chat/completions'
  ],
  [AI_PROVIDER_TYPES.openAi]: [
    'https://api.openai.com/v1',
    'https://api.openai.com/v1/chat/completions'
  ],
  [AI_PROVIDER_TYPES.openAiCompatible]: [
    'https://api.openai.com/v1',
    'https://api.openai.com/v1/chat/completions'
  ]
};

const AI_PROVIDER_LABELS = {
  [AI_PROVIDER_TYPES.anthropic]: 'Anthropic',
  [AI_PROVIDER_TYPES.mistral]: 'Mistral AI',
  [AI_PROVIDER_TYPES.nvidiaNim]: 'NVIDIA NIM',
  [AI_PROVIDER_TYPES.openAi]: 'OpenAI',
  [AI_PROVIDER_TYPES.openAiCompatible]: 'OpenAI-Compatible'
};

const normalizeAiProviderType = (value, defaultValue = DEFAULT_AI_PROVIDER_TYPE) => {
  const providerType = String(value || '').trim();
  return Object.values(AI_PROVIDER_TYPES).includes(providerType)
    ? providerType
    : defaultValue;
};

const getAiProviderLabel = (providerType = DEFAULT_AI_PROVIDER_TYPE) =>
  AI_PROVIDER_LABELS[normalizeAiProviderType(providerType)] ||
  AI_PROVIDER_LABELS[DEFAULT_AI_PROVIDER_TYPE];

const getAiProviderDefaultApiUrl = (providerType = DEFAULT_AI_PROVIDER_TYPE) =>
  AI_PROVIDER_DEFAULT_API_URLS[normalizeAiProviderType(providerType)] ||
  AI_PROVIDER_DEFAULT_API_URLS[DEFAULT_AI_PROVIDER_TYPE];

const canEditAiProviderApiUrl = (providerType = DEFAULT_AI_PROVIDER_TYPE) =>
  normalizeAiProviderType(providerType) === AI_PROVIDER_TYPES.openAiCompatible;

const resolveAiProviderApiUrl = ({
  apiUrl = '',
  providerType = DEFAULT_AI_PROVIDER_TYPE
} = {}) => {
  const normalizedProviderType = normalizeAiProviderType(providerType);
  const trimmedApiUrl = String(apiUrl || '').trim();

  if (canEditAiProviderApiUrl(normalizedProviderType)) {
    return trimmedApiUrl || getAiProviderDefaultApiUrl(normalizedProviderType);
  }

  return getAiProviderDefaultApiUrl(normalizedProviderType);
};

const isKnownAiProviderDefaultApiUrl = (apiUrl = '') => {
  const normalizedUrl = String(apiUrl || '').trim().replace(/\/+$/, '');
  if (!normalizedUrl) return false;

  return Object.values(AI_PROVIDER_KNOWN_API_URLS)
    .flat()
    .some((knownUrl) => knownUrl.replace(/\/+$/, '') === normalizedUrl);
};

const resolveAiProviderControlApiUrl = ({
  fieldApiUrl = '',
  preferStoredUrl = false,
  providerType = DEFAULT_AI_PROVIDER_TYPE,
  storedApiUrl = ''
} = {}) => {
  const normalizedProviderType = normalizeAiProviderType(providerType);
  const trimmedFieldUrl = String(fieldApiUrl || '').trim();
  const trimmedStoredUrl = String(storedApiUrl || '').trim();
  const candidateApiUrl =
    canEditAiProviderApiUrl(normalizedProviderType) && preferStoredUrl
      ? trimmedStoredUrl || (isKnownAiProviderDefaultApiUrl(trimmedFieldUrl) ? '' : trimmedFieldUrl)
      : trimmedFieldUrl || trimmedStoredUrl;

  return resolveAiProviderApiUrl({
    apiUrl: candidateApiUrl,
    providerType: normalizedProviderType
  });
};

const readSettingValue = (readSetting, key, defaultValue = '') =>
  typeof readSetting === 'function' ? readSetting(key, defaultValue) : defaultValue;

const readAiProviderSettings = (readSetting) => ({
  providerType: normalizeAiProviderType(
    readSettingValue(readSetting, AI_PROVIDER_SETTING_KEY, DEFAULT_AI_PROVIDER_TYPE)
  )
});

module.exports = {
  AI_PROVIDER_DEFAULT_API_URLS,
  AI_PROVIDER_KNOWN_API_URLS,
  AI_PROVIDER_LABELS,
  AI_PROVIDER_SETTING_KEY,
  AI_PROVIDER_TYPES,
  DEFAULT_AI_PROVIDER_TYPE,
  canEditAiProviderApiUrl,
  getAiProviderLabel,
  getAiProviderDefaultApiUrl,
  isKnownAiProviderDefaultApiUrl,
  normalizeAiProviderType,
  resolveAiProviderControlApiUrl,
  resolveAiProviderApiUrl,
  readAiProviderSettings
};
