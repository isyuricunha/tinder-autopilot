const OPENAI_CHAT_COMPLETIONS_SUFFIX = '/chat/completions';
const OPENAI_MODELS_SUFFIX = '/models';

const buildAiModelsApiUrl = (apiUrl = '') => {
  const trimmedUrl = String(apiUrl || '').trim();
  if (!trimmedUrl) return '';

  try {
    const url = new URL(trimmedUrl);
    const path = url.pathname.replace(/\/+$/, '');

    if (path.endsWith(OPENAI_MODELS_SUFFIX)) {
      url.pathname = path;
    } else if (path.endsWith(OPENAI_CHAT_COMPLETIONS_SUFFIX)) {
      url.pathname = path.slice(0, -OPENAI_CHAT_COMPLETIONS_SUFFIX.length) + OPENAI_MODELS_SUFFIX;
    } else {
      url.pathname = `${path}${OPENAI_MODELS_SUFFIX}`;
    }

    url.search = '';
    url.hash = '';
    return url.toString();
  } catch (_error) {
    return '';
  }
};

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
  fetchImpl = globalThis.fetch
} = {}) => {
  if (typeof fetchImpl !== 'function') {
    throw new Error('Fetch unavailable');
  }

  const modelsUrl = buildAiModelsApiUrl(apiUrl);
  if (!modelsUrl) {
    throw new Error('AI API URL not configured');
  }

  const response = await fetchImpl(modelsUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
    }
  });

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
