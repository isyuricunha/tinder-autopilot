const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeText,
  normalizeMessageForComparison,
  hasMessageBeenSent
} = require('../src/misc/message-normalizer');

test('normalizeText lowercases and collapses punctuation', () => {
  assert.equal(normalizeText(' Thanks, Alice!! '), 'thank-alice-');
});

test('normalizeMessageForComparison replaces the match name token', () => {
  assert.equal(normalizeMessageForComparison('Hi {name}, thanks', 'ALICE'), 'hi-alice-thank');
});

test('hasMessageBeenSent detects a previously sent personalized template', () => {
  const sentMessages = ['hi-alice-thank-for-matching'];

  assert.equal(hasMessageBeenSent(sentMessages, 'Hi {name}, thanks', 'Alice'), true);
});

test('hasMessageBeenSent returns false for an unseen template', () => {
  const sentMessages = ['hello-there'];

  assert.equal(hasMessageBeenSent(sentMessages, 'Hi {name}, thanks', 'Alice'), false);
});
