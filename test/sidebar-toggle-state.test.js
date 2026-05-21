const test = require('node:test');
const assert = require('node:assert/strict');
const {
  EPHEMERAL_TOGGLE_SELECTORS,
  isEphemeralToggle,
  shouldPersistToggleState,
  shouldRestoreToggleState
} = require('../src/views/sidebar-toggle-state');

test('sidebar toggle policy keeps manual automations ephemeral', () => {
  [
    '.tinderAutopilot',
    '.tinderAutopilotMessage',
    '.tinderAutopilotAIMessageReply',
    '.tinderAutopilotMessageNewOnly',
    '.tinderAutopilotHideMine'
  ].forEach((selector) => {
    assert.equal(isEphemeralToggle(selector), true);
    assert.equal(shouldPersistToggleState(selector), false);
    assert.equal(shouldRestoreToggleState(selector), false);
  });

  assert.equal(EPHEMERAL_TOGGLE_SELECTORS.includes('.tinderAutopilotHideMine'), true);
});

test('sidebar toggle policy still persists passive filter settings', () => {
  [
    '.tinderAutopilotAnonymous',
    '.tinderAutopilotBioFilter',
    '.tinderAutopilotGenderFilter',
    '.tinderAutopilotAdvancedFilter',
    '.tinderAutopilotSuperLike',
    '.tinderAutopilotAIProfileFilter'
  ].forEach((selector) => {
    assert.equal(isEphemeralToggle(selector), false);
    assert.equal(shouldPersistToggleState(selector), true);
    assert.equal(shouldRestoreToggleState(selector), true);
  });
});
