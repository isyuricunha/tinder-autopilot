const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AI_PROFILE_FILTER_NEUTRAL,
  createAiProfileFilterFailure,
  isAiProfileFilterFailure,
  summarizeAiProfileFilterHttpError
} = require('../src/misc/ai-profile-filter-result');

test('createAiProfileFilterFailure returns an explicit neutral failure', () => {
  const result = createAiProfileFilterFailure('API error');

  assert.equal(result.shouldSwipe, AI_PROFILE_FILTER_NEUTRAL);
  assert.equal(result.reason, 'API error');
  assert.equal(isAiProfileFilterFailure(result), true);
});

test('isAiProfileFilterFailure ignores ordinary neutral results', () => {
  assert.equal(
    isAiProfileFilterFailure({
      reason: 'No decision',
      shouldSwipe: AI_PROFILE_FILTER_NEUTRAL
    }),
    false
  );
});

test('summarizeAiProfileFilterHttpError extracts HTML titles and trims the body', () => {
  const summary = summarizeAiProfileFilterHttpError({
    status: 502,
    body: `
      <html>
        <head><title>yuricunha.com | 502: Bad gateway</title></head>
        <body>${'x'.repeat(500)}</body>
      </html>
    `
  });

  assert.equal(summary, '502 yuricunha.com | 502: Bad gateway');
  assert.equal(summary.includes('<html>'), false);
});
