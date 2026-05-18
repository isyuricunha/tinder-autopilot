const test = require('node:test');
const assert = require('node:assert/strict');
const { createLocalStorage } = require('./helpers/local-storage');
const {
  getJsonSetting,
  getRawStorageValue,
  getSetting,
  getToggleState,
  removeRawStorageValue,
  setJsonSetting,
  setRawStorageValue,
  setSetting,
  setToggleState,
  storageKey
} = require('../src/misc/settings-store');

test('settings-store namespaces project settings', () => {
  global.localStorage = createLocalStorage();

  setSetting('bioBlacklist', 'spam');

  assert.equal(storageKey('bioBlacklist'), 'TinderAutopilot/bioBlacklist');
  assert.equal(getSetting('bioBlacklist'), 'spam');
  assert.equal(getRawStorageValue('bioBlacklist', 'missing'), 'missing');
});

test('settings-store reads and writes JSON settings', () => {
  global.localStorage = createLocalStorage();

  setJsonSetting('ProfileData', { id: 'me' });

  assert.deepEqual(getJsonSetting('ProfileData'), { id: 'me' });
});

test('settings-store handles toggle and raw storage helpers', () => {
  global.localStorage = createLocalStorage();

  setToggleState('.tinderAutopilotBioFilter', true);
  setRawStorageValue('legacy-key', 'value');

  assert.equal(getToggleState('.tinderAutopilotBioFilter'), true);
  assert.equal(getRawStorageValue('legacy-key'), 'value');

  removeRawStorageValue('legacy-key');
  assert.equal(getRawStorageValue('legacy-key', 'fallback'), 'fallback');
});
