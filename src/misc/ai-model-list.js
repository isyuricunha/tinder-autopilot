const {
  buildAiModelsApiUrl,
  buildAiModelsRequestOptions
} = require('./ai-chat-provider');
const { DEFAULT_AI_PROVIDER_TYPE } = require('./ai-provider-settings');

const getModelId = (model) => {
  if (typeof model === 'string') return model.trim();
  if (!model || typeof model !== 'object') return '';
  return String(model.id || model.name || '').trim();
};

const normalizeAiModelListResponse = (data = {}) => {
  const candidates = Array.isArray(data)
    ? data
    : data.data || data.models || data.items || [];

  if (!Array.isArray(candidates)) return [];

  return Array.from(new Set(candidates.map(getModelId).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
};

const fetchAiModelList = async ({
  apiKey = '',
  apiUrl = '',
  fetchImpl = globalThis.fetch,
  providerType = DEFAULT_AI_PROVIDER_TYPE
} = {}) => {
  if (typeof fetchImpl !== 'function') {
    throw new Error('Fetch unavailable');
  }

  const modelsUrl = buildAiModelsApiUrl({ apiUrl, providerType });
  if (!modelsUrl) {
    throw new Error('AI API URL not configured');
  }

  const response = await fetchImpl(
    modelsUrl,
    buildAiModelsRequestOptions({ apiKey, providerType })
  );

  if (!response.ok) {
    throw new Error(`Model list request failed: ${response.status}`);
  }

  return normalizeAiModelListResponse(await response.json());
};

module.exports = {
  buildAiModelsApiUrl,
  fetchAiModelList,
  normalizeAiModelListResponse
};
