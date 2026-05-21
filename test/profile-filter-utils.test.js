const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isAgeOutsideRange,
  isDistanceOverMax,
  isGenderBlocked,
  isPhotoCountBelowMinimum,
  parseFilterList,
  shouldSkipAdvancedProfile
} = require('../src/misc/profile-filter-utils');

test('parseFilterList normalizes comma-separated values', () => {
  assert.deepEqual(parseFilterList(' Trans, OnlyFans,  premium  ,'), [
    'trans',
    'onlyfans',
    'premium'
  ]);
});

test('isAgeOutsideRange handles edges and unknown ages', () => {
  assert.equal(isAgeOutsideRange(30, null), false);
  assert.equal(isAgeOutsideRange(null, { min: 18, max: 35 }), false);
  assert.equal(isAgeOutsideRange(18, { min: 18, max: 35 }), false);
  assert.equal(isAgeOutsideRange(36, { min: 18, max: 35 }), true);
});

test('isGenderBlocked matches gender terms without substring false positives', () => {
  assert.equal(isGenderBlocked('Woman', ['man']), false);
  assert.equal(isGenderBlocked('Trans man', ['man']), true);
  assert.equal(isGenderBlocked('Non-binary', ['non binary']), true);
  assert.equal(isGenderBlocked('Female', ['male']), false);
});

test('isDistanceOverMax handles missing distance and threshold checks', () => {
  assert.equal(isDistanceOverMax(null, 10), false);
  assert.equal(isDistanceOverMax({ value: 10, unit: 'km' }, 10), false);
  assert.equal(isDistanceOverMax({ value: 11, unit: 'km' }, 10), true);
});

test('isPhotoCountBelowMinimum checks photo thresholds', () => {
  assert.equal(isPhotoCountBelowMinimum(3, 3), false);
  assert.equal(isPhotoCountBelowMinimum(2, 3), true);
});

test('shouldSkipAdvancedProfile combines age, distance, and photo count rules', () => {
  const options = {
    age: 26,
    distance: { value: 10, unit: 'km' },
    photoCount: 4,
    ageRange: { min: 18, max: 35 },
    maxDistance: 20,
    minPhotoCount: 3
  };

  assert.equal(shouldSkipAdvancedProfile(options), false);
  assert.equal(shouldSkipAdvancedProfile({ ...options, age: 36 }), true);
  assert.equal(shouldSkipAdvancedProfile({ ...options, distance: { value: 21, unit: 'km' } }), true);
  assert.equal(shouldSkipAdvancedProfile({ ...options, photoCount: 2 }), true);
});
