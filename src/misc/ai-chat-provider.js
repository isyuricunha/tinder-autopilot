const {
  AI_PROVIDER_TYPES,
  DEFAULT_AI_PROVIDER_TYPE,
  normalizeAiProviderType
} = require('./ai-provider-settings');

const ANTHROPIC_VERSION = '2023-06-01';
const CHAT_COMPLETIONS_SUFFIX = '/chat/completions';
const MESSAGES_SUFFIX = '/messages';
const MODELS_SUFFIX = '/models';

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
    maxOutputTokens: null,
    nativeJsonResponseFormat: false,
    reasoningEffort: 'none'
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
    : body;

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
  const providerType =
    typeof params === 'string' ? DEFAULT_AI_PROVIDER_TYPE : params.providerType;
  const trimmedUrl = String(apiUrl || '').trim();
  if (!trimmedUrl) return '';

  try {
    const url = new URL(trimmedUrl);
    const path = url.pathname.replace(/\/+$/, '');
    const suffixes = isAnthropicProvider(providerType)
      ? [MODELS_SUFFIX, MESSAGES_SUFFIX]
      : [MODELS_SUFFIX, CHAT_COMPLETIONS_SUFFIX];

    if (path.endsWith(MODELS_SUFFIX)) {
      url.pathname = path;
    } else {
      const matchingSuffix = suffixes.find((suffix) => path.endsWith(suffix));
      url.pathname = matchingSuffix
        ? path.slice(0, -matchingSuffix.length) + MODELS_SUFFIX
        : `${path}${MODELS_SUFFIX}`;
    }

    url.search = '';
    url.hash = '';
    return url.toString();
  } catch (_error) {
    return '';
  }
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
  buildAiChatHeaders,
  buildAiChatRequestOptions,
  buildAiModelsApiUrl,
  buildAiModelsRequestOptions,
  buildAnthropicRequestBody,
  clampAiChatMaxTokens,
  getAiChatProviderCapabilities,
  getAiChatResponseContent,
  getAiChatStopReason,
  isAiChatLengthStopReason,
  isAnthropicProvider,
  normalizeProviderMessages,
  supportsNativeJsonResponseFormat
};
