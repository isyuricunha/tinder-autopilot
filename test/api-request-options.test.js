const test = require('node:test');
const assert = require('node:assert/strict');
const { buildRequestOptions } = require('../src/misc/api-request-options');

test('buildRequestOptions clones default GET options without mutating headers', () => {
  const defaults = {
    method: 'GET',
    headers: { accept: 'application/json' }
  };

  const options = buildRequestOptions(defaults);

  assert.deepEqual(options, defaults);
  assert.notEqual(options, defaults);
  assert.notEqual(options.headers, defaults.headers);
});

test('buildRequestOptions creates POST options for request bodies', () => {
  const defaults = {
    method: 'GET',
    headers: { accept: 'application/json' }
  };

  const options = buildRequestOptions(defaults, { message: 'hi' });

  assert.equal(options.method, 'POST');
  assert.equal(options.headers['content-type'], 'application/json');
  assert.equal(options.body, '{"message":"hi"}');
  assert.deepEqual(defaults, {
    method: 'GET',
    headers: { accept: 'application/json' }
  });
});
