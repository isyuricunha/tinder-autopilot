const test = require('node:test');
const assert = require('node:assert/strict');
const {
  clearProfileActionFailure,
  getProfileActionFailureKey,
  hasProfileAdvanced,
  incrementProfileActionFailure,
  shouldStopAfterProfileActionFailures
} = require('../src/misc/swipe-action-state');

test('hasProfileAdvanced confirms card removal or profile id changes', () => {
  assert.equal(
    hasProfileAdvanced({
      beforeProfileId: 'name:A',
      afterProfileId: 'name:A',
      hasProfile: true
    }),
    false
  );
  assert.equal(
    hasProfileAdvanced({
      beforeProfileId: 'name:A',
      afterProfileId: 'name:B',
      hasProfile: true
    }),
    true
  );
  assert.equal(
    hasProfileAdvanced({
      beforeProfileId: 'name:A',
      afterProfileId: 'name:A',
      hasProfile: false
    }),
    true
  );
});

test('profile action failure helpers track repeated failures per profile', () => {
  const failures = {};

  assert.equal(getProfileActionFailureKey(null), 'unknown');
  assert.equal(incrementProfileActionFailure(failures, 'name:A'), 1);
  assert.equal(incrementProfileActionFailure(failures, 'name:A'), 2);
  assert.equal(shouldStopAfterProfileActionFailures(failures['name:A'], 2), true);

  clearProfileActionFailure(failures, 'name:A');
  assert.equal(failures['name:A'], undefined);
});
