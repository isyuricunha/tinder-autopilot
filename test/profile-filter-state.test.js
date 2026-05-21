const test = require('node:test');
const assert = require('node:assert/strict');
const {
  hasEnabledBioBlacklist,
  shouldRequireProfileModal
} = require('../src/misc/profile-filter-state');

test('hasEnabledBioBlacklist requires the UI toggle and stored words', () => {
  assert.equal(
    hasEnabledBioBlacklist({ isBioFilterEnabled: false, bioBlacklist: ['onlyfans'] }),
    false
  );
  assert.equal(hasEnabledBioBlacklist({ isBioFilterEnabled: true, bioBlacklist: [] }), false);
  assert.equal(
    hasEnabledBioBlacklist({ isBioFilterEnabled: true, bioBlacklist: ['onlyfans'] }),
    true
  );
});

test('shouldRequireProfileModal opens profiles only when an active filter needs profile data', () => {
  assert.equal(shouldRequireProfileModal(), false);
  assert.equal(shouldRequireProfileModal({ hasActiveBioFilter: true }), true);
  assert.equal(shouldRequireProfileModal({ isGenderFilterEnabled: true }), true);
  assert.equal(shouldRequireProfileModal({ isAdvancedFilterEnabled: true }), true);
  assert.equal(shouldRequireProfileModal({ isAIFilterEnabled: true }), true);
});
