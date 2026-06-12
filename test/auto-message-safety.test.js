const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getAutoMessageSafetyStopReason,
  getErrorStatusCode,
  shouldStopAutoMessageForError
} = require('../src/misc/auto-message-safety');

test('auto message safety extracts status codes from errors', () => {
  assert.equal(getErrorStatusCode({ statusCode: 429 }), 429);
  assert.equal(getErrorStatusCode(new Error('Request failed with status 403 Forbidden')), 403);
  assert.equal(getErrorStatusCode(new Error('ordinary failure')), null);
});

test('auto message safety stops on rate limit and verification signals', () => {
  assert.equal(
    getAutoMessageSafetyStopReason(new Error('Request failed with status 429 Too Many Requests')),
    'Tinder rate limit response'
  );
  assert.equal(
    getAutoMessageSafetyStopReason(new Error('captcha verification required')),
    'Tinder safety verification or rate limit signal'
  );
  assert.equal(shouldStopAutoMessageForError(new Error('temporary network failure')), false);
});
