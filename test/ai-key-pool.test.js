const test = require('node:test');
const assert = require('node:assert/strict');
const {
  formatAiKeyPoolText,
  getAiKeyCooldownMsForStatus,
  markAiKeyResult,
  normalizeAiKeyPool,
  normalizeAiKeyPoolState,
  parseAiKeyPoolText,
  selectAiKey
} = require('../src/misc/ai-key-pool');
const { AI_PROVIDER_TYPES } = require('../src/misc/ai-provider-settings');

test('normalizeAiKeyPool keeps valid provider keys and drops empty values', () => {
  const pool = normalizeAiKeyPool([
    {
      providerType: AI_PROVIDER_TYPES.mistral,
      value: '  key-main  '
    },
    { providerType: AI_PROVIDER_TYPES.mistral, value: '   ' }
  ]);

  assert.equal(pool.length, 1);
  assert.equal(pool[0].providerType, AI_PROVIDER_TYPES.mistral);
  assert.equal(pool[0].value, 'key-main');
});

test('selectAiKey falls back to the single API key when no provider pool exists', () => {
  const selection = selectAiKey({
    fallbackApiKey: 'single-key',
    keyPool: [],
    providerType: AI_PROVIDER_TYPES.openAi,
    state: {}
  });

  assert.equal(selection.apiKey, 'single-key');
  assert.equal(selection.selectedKey.source, 'single');
  assert.equal(selection.keyCount, 0);
});

test('selectAiKey rotates across all keys for the current provider', () => {
  const keyPool = normalizeAiKeyPool([
    {
      providerType: AI_PROVIDER_TYPES.openAi,
      value: 'openai-1'
    },
    {
      providerType: AI_PROVIDER_TYPES.openAi,
      value: 'openai-2'
    },
    {
      providerType: AI_PROVIDER_TYPES.nvidiaNim,
      value: 'nim-1'
    }
  ]);

  const first = selectAiKey({
    keyPool,
    providerType: AI_PROVIDER_TYPES.openAi,
    state: {}
  });
  const second = selectAiKey({
    keyPool,
    providerType: AI_PROVIDER_TYPES.openAi,
    state: first.state
  });
  const third = selectAiKey({
    keyPool,
    providerType: AI_PROVIDER_TYPES.openAi,
    state: second.state
  });
  const nim = selectAiKey({
    keyPool,
    providerType: AI_PROVIDER_TYPES.nvidiaNim,
    state: third.state
  });

  assert.equal(first.apiKey, 'openai-1');
  assert.equal(second.apiKey, 'openai-2');
  assert.equal(third.apiKey, 'openai-1');
  assert.equal(nim.apiKey, 'nim-1');
});

test('selectAiKey skips disabled and cooling keys', () => {
  const keyPool = normalizeAiKeyPool([
    {
      enabled: false,
      providerType: AI_PROVIDER_TYPES.openAi,
      value: 'disabled'
    },
    {
      id: 'cooling',
      providerType: AI_PROVIDER_TYPES.openAi,
      value: 'cooling'
    },
    {
      id: 'active',
      providerType: AI_PROVIDER_TYPES.openAi,
      value: 'active'
    }
  ]);
  const selection = selectAiKey({
    keyPool,
    now: 1000,
    providerType: AI_PROVIDER_TYPES.openAi,
    state: {
      cooldownUntilByKeyId: {
        cooling: 2000
      }
    }
  });

  assert.equal(selection.apiKey, 'active');
  assert.equal(selection.selectedKey.id, 'active');
  assert.equal(selection.keyCount, 2);
});

test('markAiKeyResult cools down pool keys only for retryable or auth failures', () => {
  const selectedKey = {
    id: 'key-1',
    providerType: AI_PROVIDER_TYPES.openAi,
    source: 'pool'
  };
  const rateLimited = markAiKeyResult({
    now: 1000,
    selectedKey,
    state: {},
    status: 429
  });

  assert.equal(rateLimited.cooldownUntilByKeyId['key-1'], 301000);
  assert.equal(getAiKeyCooldownMsForStatus(400), 0);

  const cleared = markAiKeyResult({
    now: 2000,
    selectedKey,
    state: rateLimited,
    status: 200
  });

  assert.equal(cleared.cooldownUntilByKeyId['key-1'], undefined);

  const singleKeyState = markAiKeyResult({
    now: 1000,
    selectedKey: { id: 'single-api-key', source: 'single' },
    state: {},
    status: 500
  });

  assert.deepEqual(singleKeyState.cooldownUntilByKeyId, {});
});

test('parseAiKeyPoolText and formatAiKeyPoolText use one key per line', () => {
  const pool = parseAiKeyPoolText({
    providerType: AI_PROVIDER_TYPES.nvidiaNim,
    text: `
      # one key per line
      nim-fast
      nim-backup
      old label | nim-from-old-format | ignored
    `
  });

  assert.deepEqual(
    pool.map((entry) => entry.value),
    ['nim-fast', 'nim-backup', 'nim-from-old-format']
  );
  assert.equal(
    formatAiKeyPoolText({ keyPool: pool, providerType: AI_PROVIDER_TYPES.nvidiaNim }),
    'nim-fast\nnim-backup\nnim-from-old-format'
  );
});

test('normalizeAiKeyPoolState migrates old scoped indexes to provider indexes', () => {
  const state = normalizeAiKeyPoolState({
    nextIndexByScopeProvider: {
      'openAi:aiReplies': 2
    }
  });

  assert.equal(state.nextIndexByProvider.openAi, 2);
  assert.equal(state.nextIndexByProvider['openAi:aiReplies'], undefined);
});
