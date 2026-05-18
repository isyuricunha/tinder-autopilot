const test = require('node:test');
const assert = require('node:assert/strict');
const { buildTinderApiDefaultOptions } = require('../src/misc/tinder-api-options');

test('buildTinderApiDefaultOptions builds Tinder headers from current token values', () => {
  const options = buildTinderApiDefaultOptions({
    apiToken: 'token-1',
    persistentDeviceId: 'device-1'
  });

  assert.deepEqual(options, {
    headers: {
      referrer: 'https://tinder.com/',
      referrerPolicy: 'origin',
      accept: 'application/json; charset=UTF-8',
      'persistent-device-id': 'device-1',
      platform: 'web',
      'X-Auth-Token': 'token-1'
    },
    method: 'GET'
  });
});
