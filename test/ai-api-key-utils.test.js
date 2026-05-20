const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeAiApiKeyInput,
  shouldSaveAiApiKeyInput
} = require('../src/misc/ai-api-key-utils');

test('normalizeAiApiKeyInput trims user input', () => {
  assert.equal(normalizeAiApiKeyInput('  sk-test  '), 'sk-test');
});

test('shouldSaveAiApiKeyInput ignores empty values', () => {
  assert.equal(shouldSaveAiApiKeyInput(''), false);
  assert.equal(shouldSaveAiApiKeyInput('   '), false);
  assert.equal(shouldSaveAiApiKeyInput(null), false);
});

test('shouldSaveAiApiKeyInput accepts non-empty values', () => {
  assert.equal(shouldSaveAiApiKeyInput('sk-test'), true);
});
