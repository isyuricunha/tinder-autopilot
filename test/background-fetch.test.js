const test = require('node:test');
const assert = require('node:assert/strict');
const {
  BACKGROUND_FETCH_MESSAGE_TYPE,
  createResponseFromBackgroundMessage,
  fetchViaBackground,
  fetchWithBackgroundFallback,
  isBackgroundFetchAvailable
} = require('../src/misc/background-fetch');

const withChromeRuntime = async (runtime, callback) => {
  const previousChrome = globalThis.chrome;
  globalThis.chrome = { runtime };

  try {
    return await callback();
  } finally {
    globalThis.chrome = previousChrome;
  }
};

test('createResponseFromBackgroundMessage restores a Response-like object', async () => {
  const response = createResponseFromBackgroundMessage([
    { body: '{"ok":true}', status: 201, statusText: 'Created' },
    null
  ]);

  assert.equal(response.status, 201);
  assert.equal(response.statusText, 'Created');
  assert.deepEqual(await response.json(), { ok: true });
});

test('createResponseFromBackgroundMessage throws serialized background errors', () => {
  assert.throws(
    () => createResponseFromBackgroundMessage([null, { message: 'Failed to fetch' }]),
    /Failed to fetch/
  );
  assert.throws(() => createResponseFromBackgroundMessage(null), /Empty response/);
});

test('fetchViaBackground sends a typed background fetch request', async () => {
  let sentRequest = null;
  const response = await withChromeRuntime(
    {
      sendMessage(request, callback) {
        sentRequest = request;
        callback([{ body: 'pong', status: 200, statusText: 'OK' }, null]);
      }
    },
    () =>
      fetchViaBackground('https://api.example.test/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: 'Bearer secret' },
        body: '{}'
      })
  );

  assert.equal(sentRequest.type, BACKGROUND_FETCH_MESSAGE_TYPE);
  assert.equal(sentRequest.url, 'https://api.example.test/v1/chat/completions');
  assert.equal(sentRequest.options.method, 'POST');
  assert.equal(await response.text(), 'pong');
});

test('fetchViaBackground rejects chrome runtime send errors', async () => {
  await assert.rejects(
    withChromeRuntime(
      {
        lastError: { message: 'Could not establish connection' },
        sendMessage(request, callback) {
          callback(null);
        }
      },
      () => fetchViaBackground('https://api.example.test/v1/models')
    ),
    /Could not establish connection/
  );
});

test('fetchWithBackgroundFallback uses normal fetch outside an extension runtime', async () => {
  const previousChrome = globalThis.chrome;
  const previousFetch = globalThis.fetch;
  globalThis.chrome = undefined;
  globalThis.fetch = async (url, options) =>
    new Response(JSON.stringify({ url, method: options.method }), { status: 200 });

  try {
    assert.equal(isBackgroundFetchAvailable(), false);
    const response = await fetchWithBackgroundFallback('https://api.example.test/v1/models', {
      method: 'GET'
    });
    assert.deepEqual(await response.json(), {
      url: 'https://api.example.test/v1/models',
      method: 'GET'
    });
  } finally {
    globalThis.chrome = previousChrome;
    globalThis.fetch = previousFetch;
  }
});
