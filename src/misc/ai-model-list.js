const {
  buildAiModelsApiUrl,
  buildAiModelsRequestOptions
} = require('./ai-chat-provider');
const {
  AI_PROVIDER_TYPES,
  DEFAULT_AI_PROVIDER_TYPE,
  normalizeAiProviderType
} = require('./ai-provider-settings');
const { fetchWithBackgroundFallback } = require('./background-fetch');

const NVIDIA_NIM_MODEL_SUGGESTIONS = [
  'meta/llama-3.1-70b-instruct',
  'meta/llama-3.1-8b-instruct',
  'meta/llama-3.3-70b-instruct',
  'mistralai/mistral-7b-instruct-v0.3',
  'mistralai/mistral-nemotron',
  'mistralai/mixtral-8x7b-instruct',
  'nvidia/llama-3.1-nemotron-nano-8b-v1',
  'nvidia/llama-3.1-nemotron-ultra-253b-v1',
  'nvidia/llama-3.3-nemotron-super-49b-v1',
  'nvidia/llama-3.3-nemotron-super-49b-v1.5',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3-coder-480b-a35b-instruct',
  'qwen/qwen3-next-80b-a3b-instruct',
  'qwen/qwen3-next-80b-a3b-thinking'
];

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
  fetchImpl = fetchWithBackgroundFallback,
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
    if (
      normalizeAiProviderType(providerType) === AI_PROVIDER_TYPES.nvidiaNim &&
      [404, 405].includes(response.status)
    ) {
      return NVIDIA_NIM_MODEL_SUGGESTIONS;
    }

    const error = new Error(`Model list request failed: ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }

  return normalizeAiModelListResponse(await response.json());
};

module.exports = {
  NVIDIA_NIM_MODEL_SUGGESTIONS,
  buildAiModelsApiUrl,
  fetchAiModelList,
  normalizeAiModelListResponse
};
