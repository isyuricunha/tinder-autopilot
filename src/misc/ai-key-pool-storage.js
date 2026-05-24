import {
  getExtensionStorageValue,
  setExtensionStorageValue
} from './extension-storage';
import {
  AI_API_KEY_STORAGE_KEY,
  AI_KEY_POOL_STATE_STORAGE_KEY,
  AI_KEY_POOL_STORAGE_KEY,
  markAiKeyResult,
  normalizeAiKeyPool,
  normalizeAiKeyPoolState,
  selectAiKey
} from './ai-key-pool';

const loadAiKeyPool = async () =>
  normalizeAiKeyPool((await getExtensionStorageValue(AI_KEY_POOL_STORAGE_KEY)) || []);

const saveAiKeyPool = async (keyPool) =>
  setExtensionStorageValue(AI_KEY_POOL_STORAGE_KEY, normalizeAiKeyPool(keyPool));

const loadAiKeyPoolState = async () =>
  normalizeAiKeyPoolState(
    (await getExtensionStorageValue(AI_KEY_POOL_STATE_STORAGE_KEY)) || {}
  );

const saveAiKeyPoolState = async (state) =>
  setExtensionStorageValue(AI_KEY_POOL_STATE_STORAGE_KEY, normalizeAiKeyPoolState(state));

const selectAiApiKeyForRequest = async ({ providerType }) => {
  const [fallbackApiKey, keyPool, state] = await Promise.all([
    getExtensionStorageValue(AI_API_KEY_STORAGE_KEY),
    loadAiKeyPool(),
    loadAiKeyPoolState()
  ]);
  const selection = selectAiKey({
    fallbackApiKey,
    keyPool,
    providerType,
    state
  });

  if (selection.selectedKey?.source === 'pool') {
    await saveAiKeyPoolState(selection.state).catch(() => false);
  }

  return selection;
};

const markSelectedAiApiKeyResult = async ({ selectedKey, status }) => {
  if (!selectedKey || selectedKey.source !== 'pool') return normalizeAiKeyPoolState();

  try {
    const state = await loadAiKeyPoolState();
    const nextState = markAiKeyResult({
      selectedKey,
      state,
      status
    });
    await saveAiKeyPoolState(nextState);
    return nextState;
  } catch {
    return normalizeAiKeyPoolState();
  }
};

export {
  loadAiKeyPool,
  loadAiKeyPoolState,
  markSelectedAiApiKeyResult,
  saveAiKeyPool,
  saveAiKeyPoolState,
  selectAiApiKeyForRequest
};
