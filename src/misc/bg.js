const BACKGROUND_FETCH_MESSAGE_TYPE = 'TinderAutopilot/backgroundFetch';
const REQUEST_TIMEOUT_MS = 30000;

const fetchResponse = async (request) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(request.url, { ...request.options, signal: controller.signal });
    const body = await response.text();
    return [{ body, status: response.status, statusText: response.statusText }, null];
  } catch (error) {
    const message = controller.signal.aborted
      ? `Background request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds`
      : error?.message || String(error);
    return [null, { message }];
  } finally {
    clearTimeout(timer);
  }
};

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request?.type !== BACKGROUND_FETCH_MESSAGE_TYPE) return false;
  if (!request.url) {
    sendResponse([null, { message: 'Missing request URL' }]);
    return false;
  }

  fetchResponse(request).then(sendResponse);
  return true;
});
