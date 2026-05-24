const {
  AI_PROVIDER_TYPES,
  DEFAULT_AI_PROVIDER_TYPE,
  normalizeAiProviderType
} = require('./ai-provider-settings');

const ANTHROPIC_VERSION = '2023-06-01';
const CHAT_COMPLETIONS_SUFFIX = '/chat/completions';
const MESSAGES_SUFFIX = '/messages';
const MODELS_SUFFIX = '/models';
const NVIDIA_NIM_HOSTED_MAX_OUTPUT_TOKENS = 2048;

const AI_CHAT_PROVIDER_CAPABILITIES = {
  [AI_PROVIDER_TYPES.anthropic]: {
    maxTokensField: 'max_tokens',
    maxOutputTokens: null,
    nativeJsonResponseFormat: false,
    reasoningEffort: 'none'
  },
  [AI_PROVIDER_TYPES.mistral]: {
    maxTokensField: 'max_tokens',
    maxOutputTokens: null,
    nativeJsonResponseFormat: true,
    reasoningEffort: 'mistral'
  },
  [AI_PROVIDER_TYPES.nvidiaNim]: {
    maxTokensField: 'max_tokens',
    maxOutputTokens: NVIDIA_NIM_HOSTED_MAX_OUTPUT_TOKENS,
    nativeJsonResponseFormat: false,
    reasoningEffort: 'none'
  },
  [AI_PROVIDER_TYPES.openAi]: {
    maxTokensField: 'max_tokens',
    maxOutputTokens: null,
    nativeJsonResponseFormat: true,
    reasoningEffort: 'openai'
  },
  [AI_PROVIDER_TYPES.openAiCompatible]: {
    maxTokensField: 'max_tokens',
    maxOutputTokens: null,
    nativeJsonResponseFormat: true,
    reasoningEffort: 'openai'
  }
};

const getAiChatProviderCapabilities = (providerType = DEFAULT_AI_PROVIDER_TYPE) =>
  AI_CHAT_PROVIDER_CAPABILITIES[normalizeAiProviderType(providerType)] ||
  AI_CHAT_PROVIDER_CAPABILITIES[DEFAULT_AI_PROVIDER_TYPE];

const clampAiChatMaxTokens = (providerType, maxTokens) => {
  const capabilities = getAiChatProviderCapabilities(providerType);
  const safeMaxTokens = Math.max(1, parseInt(maxTokens, 10) || 1);
  return capabilities.maxOutputTokens
    ? Math.min(capabilities.maxOutputTokens, safeMaxTokens)
    : safeMaxTokens;
};

const supportsNativeJsonResponseFormat = (providerType = DEFAULT_AI_PROVIDER_TYPE) =>
  Boolean(getAiChatProviderCapabilities(providerType).nativeJsonResponseFormat);

const isAnthropicProvider = (providerType) =>
  normalizeAiProviderType(providerType) === AI_PROVIDER_TYPES.anthropic;

const getAiProviderChatEndpointSuffix = (providerType = DEFAULT_AI_PROVIDER_TYPE) =>
  isAnthropicProvider(providerType) ? MESSAGES_SUFFIX : CHAT_COMPLETIONS_SUFFIX;

const normalizeAiProviderEndpointUrl = ({
  apiUrl = '',
  endpointSuffix = CHAT_COMPLETIONS_SUFFIX
} = {}) => {
  const candidateUrl = String(apiUrl || '').trim();
  if (!candidateUrl) return '';

  try {
    const url = new URL(candidateUrl);
    const normalizedPath = url.pathname.replace(/\/+$/, '');
    const path = normalizedPath === '/' ? '' : normalizedPath;
    const suffixes = [MODELS_SUFFIX, MESSAGES_SUFFIX, CHAT_COMPLETIONS_SUFFIX];

    if (path.endsWith(endpointSuffix)) {
      url.pathname = path;
    } else {
      const matchingSuffix = suffixes.find((suffix) => path.endsWith(suffix));
      const basePath = matchingSuffix ? path.slice(0, -matchingSuffix.length) : path;
      const versionedBasePath = basePath || '/v1';
      url.pathname = `${versionedBasePath}${endpointSuffix}`;
    }

    url.search = '';
    url.hash = '';
    return url.toString();
  } catch (_error) {
    return '';
  }
};

const buildAiChatApiUrl = ({
  apiUrl = '',
  providerType = DEFAULT_AI_PROVIDER_TYPE
} = {}) =>
  normalizeAiProviderEndpointUrl({
    apiUrl,
    endpointSuffix: getAiProviderChatEndpointSuffix(providerType)
  });

const asTextContent = (content) => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  return content
    .map((part) => {
      if (typeof part === 'string') return part;
      if (part?.type === 'text') return part.text || '';
      if (part?.text) return part.text;
      return '';
    })
    .filter(Boolean)
    .join('\n');
};

const normalizeProviderMessages = (messages = []) => {
  const normalizedMessages = [];

  messages.forEach((message) => {
    const role = message?.role === 'assistant' ? 'assistant' : 'user';
    const content = asTextContent(message?.content);
    if (!content) return;

    const previousMessage = normalizedMessages[normalizedMessages.length - 1];
    if (previousMessage?.role === role) {
      previousMessage.content = `${previousMessage.content}\n\n${content}`;
      return;
    }

    normalizedMessages.push({ role, content });
  });

  return normalizedMessages;
};

const buildAnthropicRequestBody = (body = {}) => {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const systemMessages = messages
    .filter((message) => message?.role === 'system')
    .map((message) => asTextContent(message.content))
    .filter(Boolean);
  const conversationMessages = normalizeProviderMessages(
    messages.filter((message) => message?.role !== 'system')
  );
  const maxTokens = body.max_tokens || body.max_completion_tokens || 1024;

  const anthropicBody = {
    model: body.model,
    max_tokens: maxTokens,
    messages: conversationMessages
  };

  if (systemMessages.length) {
    anthropicBody.system = systemMessages.join('\n\n');
  }

  if (body.temperature !== undefined) {
    anthropicBody.temperature = body.temperature;
  }

  return anthropicBody;
};

const buildProviderChatRequestBody = (
  body = {},
  providerType = DEFAULT_AI_PROVIDER_TYPE
) => {
  const providerBody = { ...body };
  const normalizedProviderType = normalizeAiProviderType(providerType);

  if (!supportsNativeJsonResponseFormat(normalizedProviderType)) {
    delete providerBody.response_format;
  }

  ['max_tokens', 'max_completion_tokens'].forEach((fieldName) => {
    if (providerBody[fieldName] === undefined) return;
    providerBody[fieldName] = clampAiChatMaxTokens(
      normalizedProviderType,
      providerBody[fieldName]
    );
  });

  return providerBody;
};

const buildAiChatHeaders = ({
  apiKey = '',
  providerType = DEFAULT_AI_PROVIDER_TYPE
} = {}) => {
  if (isAnthropicProvider(providerType)) {
    return {
      'Content-Type': 'application/json',
      'anthropic-version': ANTHROPIC_VERSION,
      ...(apiKey ? { 'x-api-key': apiKey } : {})
    };
  }

  return {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
  };
};

const buildAiChatRequestOptions = ({
  apiKey = '',
  body = {},
  providerType = DEFAULT_AI_PROVIDER_TYPE
} = {}) => {
  const normalizedProviderType = normalizeAiProviderType(providerType);
  const providerBody = isAnthropicProvider(normalizedProviderType)
    ? buildAnthropicRequestBody(body)
    : buildProviderChatRequestBody(body, normalizedProviderType);

  return {
    method: 'POST',
    headers: buildAiChatHeaders({ apiKey, providerType: normalizedProviderType }),
    body: JSON.stringify(providerBody)
  };
};

const getAiChatResponseContent = (data = {}) => {
  const openAiContent = data?.choices?.[0]?.message?.content || data?.output_message?.content;
  const openAiText = asTextContent(openAiContent);
  if (openAiText) return openAiText;

  if (Array.isArray(data?.content)) {
    return data.content
      .map((part) => (part?.type === 'text' ? part.text || '' : part?.text || ''))
      .filter(Boolean)
      .join('\n');
  }

  return '';
};

const getAiChatStopReason = (data = {}) =>
  data?.choices?.[0]?.finish_reason ||
  data?.choices?.[0]?.stop_reason ||
  data?.stop_reason ||
  data?.output_message?.stop_reason ||
  '';

const isAiChatLengthStopReason = (stopReason) => {
  const normalizedReason = String(stopReason || '').toLowerCase();
  return normalizedReason === 'length' || normalizedReason === 'max_tokens';
};

const buildAiModelsApiUrl = (params = {}) => {
  const apiUrl = typeof params === 'string' ? params : params.apiUrl || '';
  return normalizeAiProviderEndpointUrl({
    apiUrl,
    endpointSuffix: MODELS_SUFFIX
  });
};

const buildAiModelsRequestOptions = ({
  apiKey = '',
  providerType = DEFAULT_AI_PROVIDER_TYPE
} = {}) => {
  if (isAnthropicProvider(providerType)) {
    return {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'anthropic-version': ANTHROPIC_VERSION,
        ...(apiKey ? { 'x-api-key': apiKey } : {})
      }
    };
  }

  return {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
    }
  };
};

module.exports = {
  AI_CHAT_PROVIDER_CAPABILITIES,
  ANTHROPIC_VERSION,
  asTextContent,
  buildAiChatApiUrl,
  buildAiChatHeaders,
  buildAiChatRequestOptions,
  buildAiModelsApiUrl,
  buildAiModelsRequestOptions,
  buildAnthropicRequestBody,
  buildProviderChatRequestBody,
  clampAiChatMaxTokens,
  getAiChatProviderCapabilities,
  getAiChatResponseContent,
  getAiChatStopReason,
  isAiChatLengthStopReason,
  isAnthropicProvider,
  normalizeProviderMessages,
  supportsNativeJsonResponseFormat
};
