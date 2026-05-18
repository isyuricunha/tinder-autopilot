const STORAGE_PREFIX = 'TinderAutopilot/';
const DEBUG_SETTING_KEY = 'debug';

const storageKey = (key) => `${STORAGE_PREFIX}${key}`;

const getSetting = (key, defaultValue = '') => {
  try {
    const value = localStorage.getItem(storageKey(key));
    return value === null ? defaultValue : value;
  } catch {
    return defaultValue;
  }
};

const setSetting = (key, value) => {
  localStorage.setItem(storageKey(key), String(value));
};

const removeSetting = (key) => {
  localStorage.removeItem(storageKey(key));
};

const getJsonSetting = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(storageKey(key));
    return value === null ? defaultValue : JSON.parse(value);
  } catch {
    return defaultValue;
  }
};

const setJsonSetting = (key, value) => {
  localStorage.setItem(storageKey(key), JSON.stringify(value));
};

const getToggleState = (selector) => getSetting(`toggleState/${selector}`) === 'true';

const setToggleState = (selector, isEnabled) => {
  setSetting(`toggleState/${selector}`, String(Boolean(isEnabled)));
};

const isDebugEnabled = () => getSetting(DEBUG_SETTING_KEY, 'false') === 'true';

export {
  STORAGE_PREFIX,
  storageKey,
  getSetting,
  setSetting,
  removeSetting,
  getJsonSetting,
  setJsonSetting,
  getToggleState,
  setToggleState,
  isDebugEnabled
};
