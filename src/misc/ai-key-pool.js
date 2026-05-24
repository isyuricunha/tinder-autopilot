const {
  DEFAULT_AI_PROVIDER_TYPE,
  normalizeAiProviderType
} = require('./ai-provider-settings');
const { normalizeAiApiKeyInput } = require('./ai-api-key-utils');

const AI_API_KEY_STORAGE_KEY = 'TinderAutopilot/aiApiKey';
const AI_KEY_POOL_STORAGE_KEY = 'TinderAutopilot/aiKeyPool';
const AI_KEY_POOL_STATE_STORAGE_KEY = 'TinderAutopilot/aiKeyPoolState';

const AUTH_FAILURE_COOLDOWN_MS = 30 * 60 * 1000;
const RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000;
const TRANSIENT_FAILURE_COOLDOWN_MS = 60 * 1000;

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const stableHash = (value = '') => {
  let hash = 2166136261;
  const text = String(value);

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
};

const getKeyValueFromTextLine = (line) => {
  const parts = String(line || '')
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 1 ? parts[1] : parts[0] || '';
};

const normalizeAiKeyPoolEntry = (entry, index = 0) => {
  const source = isPlainObject(entry) ? entry : { value: entry };
  const providerType = normalizeAiProviderType(source.providerType, DEFAULT_AI_PROVIDER_TYPE);
  const value = normalizeAiApiKeyInput(source.value || source.apiKey || source.key);
  if (!value) return null;

  const id =
    String(source.id || '')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .trim() || `ai_key_${stableHash(`${providerType}|${value}`)}`;

  return {
    enabled: source.enabled !== false,
    id,
    label: String(source.label || `Key ${index + 1}`).trim() || `Key ${index + 1}`,
    providerType,
    value
  };
};

const normalizeAiKeyPool = (value = []) => {
  const entries = Array.isArray(value) ? value : [];
  const usedIds = new Set();

  return entries.reduce((normalized, entry, index) => {
    const normalizedEntry = normalizeAiKeyPoolEntry(entry, index);
    if (!normalizedEntry) return normalized;

    let id = normalizedEntry.id;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${normalizedEntry.id}_${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);

    normalized.push({ ...normalizedEntry, id });
    return normalized;
  }, []);
};

const parseAiKeyPoolText = ({ providerType = DEFAULT_AI_PROVIDER_TYPE, text = '' } = {}) => {
  const normalizedProviderType = normalizeAiProviderType(providerType);
  const entries = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line, index) => ({
      label: `Key ${index + 1}`,
      providerType: normalizedProviderType,
      value: getKeyValueFromTextLine(line)
    }));

  return normalizeAiKeyPool(entries);
};

const formatAiKeyPoolText = ({ keyPool = [], providerType = DEFAULT_AI_PROVIDER_TYPE } = {}) => {
  const normalizedProviderType = normalizeAiProviderType(providerType);
  return normalizeAiKeyPool(keyPool)
    .filter((entry) => entry.providerType === normalizedProviderType)
    .map((entry) => entry.value)
    .join('\n');
};

const normalizeIndexMap = (value = {}) =>
  Object.entries(isPlainObject(value) ? value : {}).reduce((indexMap, [key, index]) => {
    const providerType = normalizeAiProviderType(String(key || '').split(':')[0], '');
    if (!providerType || Object.prototype.hasOwnProperty.call(indexMap, providerType)) {
      return indexMap;
    }

    return {
      ...indexMap,
      [providerType]: Math.max(0, Math.floor(Number(index) || 0))
    };
  }, {});

const normalizeAiKeyPoolState = (value = {}) => {
  const source = isPlainObject(value) ? value : {};
  const nextIndexByProvider = isPlainObject(source.nextIndexByProvider)
    ? source.nextIndexByProvider
    : source.nextIndexByScopeProvider;
  const cooldownUntilByKeyId = isPlainObject(source.cooldownUntilByKeyId)
    ? source.cooldownUntilByKeyId
    : {};

  return {
    cooldownUntilByKeyId: Object.fromEntries(
      Object.entries(cooldownUntilByKeyId)
        .map(([key, timestamp]) => [key, Number(timestamp)])
        .filter(([key, timestamp]) => key && Number.isFinite(timestamp) && timestamp > 0)
    ),
    nextIndexByProvider: normalizeIndexMap(nextIndexByProvider)
  };
};

const isEntryCoolingDown = ({ entry, now, state }) => {
  const cooldownUntil = Number(state.cooldownUntilByKeyId[entry.id] || 0);
  return cooldownUntil > now;
};

const selectAiKey = ({
  fallbackApiKey = '',
  keyPool = [],
  now = Date.now(),
  providerType = DEFAULT_AI_PROVIDER_TYPE,
  state = {}
} = {}) => {
  const normalizedProviderType = normalizeAiProviderType(providerType);
  const normalizedPool = normalizeAiKeyPool(keyPool);
  const normalizedState = normalizeAiKeyPoolState(state);
  const candidates = normalizedPool.filter(
    (entry) => entry.providerType === normalizedProviderType && entry.enabled !== false
  );
  const activeCandidates = candidates.filter(
    (entry) => !isEntryCoolingDown({ entry, now, state: normalizedState })
  );
  const safeFallbackApiKey = normalizeAiApiKeyInput(fallbackApiKey);

  if (!activeCandidates.length) {
    return {
      apiKey: safeFallbackApiKey,
      keyCount: candidates.length,
      selectedKey: safeFallbackApiKey
        ? {
            id: 'single-api-key',
            label: 'Single API Key',
            providerType: normalizedProviderType,
            source: 'single'
          }
        : null,
      state: normalizedState
    };
  }

  const index = normalizedState.nextIndexByProvider[normalizedProviderType] || 0;
  const selectedEntry = activeCandidates[index % activeCandidates.length];
  const nextState = {
    ...normalizedState,
    nextIndexByProvider: {
      ...normalizedState.nextIndexByProvider,
      [normalizedProviderType]: (index + 1) % activeCandidates.length
    }
  };

  return {
    apiKey: selectedEntry.value,
    keyCount: candidates.length,
    selectedKey: {
      id: selectedEntry.id,
      label: selectedEntry.label,
      providerType: normalizedProviderType,
      source: 'pool'
    },
    state: nextState
  };
};

const getAiKeyCooldownMsForStatus = (status) => {
  const statusCode = Number(status);
  if (!Number.isFinite(statusCode)) return TRANSIENT_FAILURE_COOLDOWN_MS;
  if (statusCode >= 200 && statusCode < 400) return 0;
  if (statusCode === 401 || statusCode === 403) return AUTH_FAILURE_COOLDOWN_MS;
  if (statusCode === 408 || statusCode === 429) return RATE_LIMIT_COOLDOWN_MS;
  if (statusCode >= 500 && statusCode <= 599) return TRANSIENT_FAILURE_COOLDOWN_MS;
  return 0;
};

const markAiKeyResult = ({
  now = Date.now(),
  selectedKey = null,
  state = {},
  status
} = {}) => {
  const normalizedState = normalizeAiKeyPoolState(state);
  if (!selectedKey || selectedKey.source !== 'pool' || !selectedKey.id) {
    return normalizedState;
  }

  const cooldownMs = getAiKeyCooldownMsForStatus(status);
  const cooldownUntilByKeyId = { ...normalizedState.cooldownUntilByKeyId };

  if (cooldownMs > 0) {
    cooldownUntilByKeyId[selectedKey.id] = now + cooldownMs;
  } else {
    delete cooldownUntilByKeyId[selectedKey.id];
  }

  return {
    ...normalizedState,
    cooldownUntilByKeyId
  };
};

module.exports = {
  AI_API_KEY_STORAGE_KEY,
  AI_KEY_POOL_STATE_STORAGE_KEY,
  AI_KEY_POOL_STORAGE_KEY,
  formatAiKeyPoolText,
  getAiKeyCooldownMsForStatus,
  markAiKeyResult,
  normalizeAiKeyPool,
  normalizeAiKeyPoolState,
  parseAiKeyPoolText,
  selectAiKey
};
