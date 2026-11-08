const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isAgeOutsideRange,
  isDistanceOverMax,
  isGenderBlocked,
  isPhotoCountBelowMinimum,
  parseFilterList,
  getAdvancedProfileRejectionReason
} = require('../src/misc/profile-filter-utils');

test('parseFilterList normalizes comma-separated values', () => {
  assert.deepEqual(parseFilterList(' Trans, OnlyFans\n  premium  ,'), [
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
  assert.equal(isAgeOutsideRange(26, { min: 35, max: 18 }), false);
});

test('isGenderBlocked matches gender terms without substring false positives', () => {
  assert.equal(isGenderBlocked('Woman', ['man']), false);
  assert.equal(isGenderBlocked('Trans man', ['man']), true);
  assert.equal(isGenderBlocked('Non-binary', ['non binary']), true);
  assert.equal(isGenderBlocked('Female', ['male']), false);
  assert.equal(isGenderBlocked('Mulher', ['man']), false);
  assert.equal(isGenderBlocked('Homem trans', ['trans man']), true);
  assert.equal(isGenderBlocked('Não binária', 'non-binary'), true);
});

test('isDistanceOverMax handles missing distance and threshold checks', () => {
  assert.equal(isDistanceOverMax(null, 10), false);
  assert.equal(isDistanceOverMax({ value: 10, unit: 'km' }, 10), false);
  assert.equal(isDistanceOverMax({ value: 11, unit: 'km' }, 10), true);
  assert.equal(isDistanceOverMax({ value: 6, unit: 'miles' }, 10), false);
  assert.equal(isDistanceOverMax({ value: 7, unit: 'milhas' }, 10), true);
});

test('isPhotoCountBelowMinimum checks photo thresholds', () => {
  assert.equal(isPhotoCountBelowMinimum(3, 3), false);
  assert.equal(isPhotoCountBelowMinimum(2, 3), true);
  assert.equal(isPhotoCountBelowMinimum(null, 3), false);
});

test('advanced filters identify the rule that caused a rejection', () => {
  const options = {
    age: 26,
    distance: { value: 10, unit: 'km' },
    photoCount: 4,
    ageRange: { min: 18, max: 35 },
    maxDistance: 20,
    minPhotoCount: 3
  };

  assert.equal(getAdvancedProfileRejectionReason(options), '');
  assert.match(getAdvancedProfileRejectionReason({ ...options, age: 36 }), /age/i);
  assert.match(getAdvancedProfileRejectionReason({ ...options, distance: { value: 21, unit: 'km' } }), /distance/i);
  assert.match(getAdvancedProfileRejectionReason({ ...options, photoCount: 2 }), /photos/i);
});
