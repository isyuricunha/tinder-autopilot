const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isAgeOutsideRange,
  isDistanceOverMax,
  isPhotoCountBelowMinimum,
  parseFilterList
} = require('../src/misc/profile-filter-utils');

test('parseFilterList normalizes comma-separated values', () => {
  assert.deepEqual(parseFilterList(' Trans, OnlyFans,  premium  ,'), [
    'trans',
    'onlyfans',
    'premium'
  ]);
});

test('isAgeOutsideRange handles edges and unknown ages', () => {
  assert.equal(isAgeOutsideRange(null, { min: 18, max: 35 }), false);
  assert.equal(isAgeOutsideRange(18, { min: 18, max: 35 }), false);
  assert.equal(isAgeOutsideRange(36, { min: 18, max: 35 }), true);
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
