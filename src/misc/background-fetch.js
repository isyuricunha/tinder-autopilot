const BACKGROUND_FETCH_MESSAGE_TYPE = 'TinderAutopilot/backgroundFetch';

const getChromeRuntime = () => globalThis.chrome?.runtime;

const isBackgroundFetchAvailable = () => {
  const runtime = getChromeRuntime();
  return Boolean(runtime && typeof runtime.sendMessage === 'function');
};

const createResponseFromBackgroundMessage = (messageResponse) => {
  if (!messageResponse) {
    throw new Error('Empty response from background request');
  }

  const [response, error] = messageResponse;
  if (response === null) {
    throw new Error(error?.message || String(error || 'Background request failed'));
  }

  const body = response.body ? new Blob([response.body]) : undefined;
  return new Response(body, {
    status: response.status,
    statusText: response.statusText
  });
};

const fetchViaBackground = (url, options = {}) =>
  new Promise((resolve, reject) => {
    const runtime = getChromeRuntime();
    if (!runtime || typeof runtime.sendMessage !== 'function') {
      reject(new Error('Background fetch unavailable'));
      return;
    }

    runtime.sendMessage(
      {
        type: BACKGROUND_FETCH_MESSAGE_TYPE,
        url,
        options
      },
      (messageResponse) => {
        if (runtime.lastError) {
          reject(new Error(runtime.lastError.message));
          return;
        }

        try {
          resolve(createResponseFromBackgroundMessage(messageResponse));
        } catch (error) {
          reject(error);
        }
      }
    );
  });

const fetchWithBackgroundFallback = (url, options = {}) => {
  if (isBackgroundFetchAvailable()) {
    return fetchViaBackground(url, options);
  }

  if (typeof globalThis.fetch !== 'function') {
    return Promise.reject(new Error('Fetch unavailable'));
  }

  return globalThis.fetch(url, options);
};

module.exports = {
  BACKGROUND_FETCH_MESSAGE_TYPE,
  createResponseFromBackgroundMessage,
  fetchViaBackground,
  fetchWithBackgroundFallback,
  isBackgroundFetchAvailable
};
