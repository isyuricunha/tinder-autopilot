const storageLocal = () => {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    return null;
  }
  return chrome.storage.local;
};

const getExtensionStorageValue = (key) =>
  new Promise((resolve, reject) => {
    const storage = storageLocal();
    if (!storage) {
      resolve(undefined);
      return;
    }

    storage.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result ? result[key] : undefined);
    });
  });

const setExtensionStorageValue = (key, value) =>
  new Promise((resolve, reject) => {
    const storage = storageLocal();
    if (!storage) {
      resolve(false);
      return;
    }

    storage.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(true);
    });
  });

const removeExtensionStorageValue = (key) =>
  new Promise((resolve, reject) => {
    const storage = storageLocal();
    if (!storage) {
      resolve(false);
      return;
    }

    storage.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(true);
    });
  });

export { getExtensionStorageValue, setExtensionStorageValue, removeExtensionStorageValue };
