const STORAGE_PREFIX = 'TinderAutopilot/';
const DEBUG_SETTING_KEY = 'debug';

const storageKey = (key) => `${STORAGE_PREFIX}${key}`;

const getRawStorageValue = (key, defaultValue = '') => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? defaultValue : value;
  } catch {
    return defaultValue;
  }
};

const setRawStorageValue = (key, value) => {
  localStorage.setItem(key, String(value));
};

const removeRawStorageValue = (key) => {
  localStorage.removeItem(key);
};

const getRawJsonStorageValue = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? defaultValue : JSON.parse(value);
  } catch {
    return defaultValue;
  }
};

const setRawJsonStorageValue = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getSetting = (key, defaultValue = '') => getRawStorageValue(storageKey(key), defaultValue);

const setSetting = (key, value) => {
  setRawStorageValue(storageKey(key), value);
};

const removeSetting = (key) => {
  removeRawStorageValue(storageKey(key));
};

const getJsonSetting = (key, defaultValue = null) =>
  getRawJsonStorageValue(storageKey(key), defaultValue);

const setJsonSetting = (key, value) => {
  setRawJsonStorageValue(storageKey(key), value);
};

const getToggleState = (selector) => getSetting(`toggleState/${selector}`) === 'true';

const setToggleState = (selector, isEnabled) => {
  setSetting(`toggleState/${selector}`, String(Boolean(isEnabled)));
};

const isDebugEnabled = () => getSetting(DEBUG_SETTING_KEY, 'false') === 'true';

module.exports = {
  STORAGE_PREFIX,
  storageKey,
  getRawStorageValue,
  setRawStorageValue,
  removeRawStorageValue,
  getRawJsonStorageValue,
  setRawJsonStorageValue,
  getSetting,
  setSetting,
  removeSetting,
  getJsonSetting,
  setJsonSetting,
  getToggleState,
  setToggleState,
  isDebugEnabled
};
