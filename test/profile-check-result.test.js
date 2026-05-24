const test = require('node:test');
const assert = require('node:assert/strict');
const {
  PROFILE_CHECK_ACTIONS,
  normalizeProfileCheckAction,
  shouldSkipProfileCheckAction,
  shouldStopProfileCheckAction
} = require('../src/misc/profile-check-result');

test('normalizeProfileCheckAction preserves the legacy boolean contract', () => {
  assert.equal(normalizeProfileCheckAction(true), PROFILE_CHECK_ACTIONS.skip);
  assert.equal(normalizeProfileCheckAction(false), PROFILE_CHECK_ACTIONS.allow);
  assert.equal(normalizeProfileCheckAction(undefined), PROFILE_CHECK_ACTIONS.allow);
});

test('profile check helpers identify skip and stop actions', () => {
  assert.equal(shouldSkipProfileCheckAction(PROFILE_CHECK_ACTIONS.skip), true);
  assert.equal(shouldStopProfileCheckAction(PROFILE_CHECK_ACTIONS.stop), true);
  assert.equal(shouldSkipProfileCheckAction(PROFILE_CHECK_ACTIONS.stop), false);
});
