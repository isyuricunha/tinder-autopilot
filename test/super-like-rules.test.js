const test = require('node:test');
const assert = require('node:assert/strict');
const { shouldUseSuperLike } = require('../src/misc/super-like-rules');

test('shouldUseSuperLike requires enabled automation and remaining daily quota', () => {
  assert.equal(
    shouldUseSuperLike({
      isEnabled: false,
      canSuperLike: true,
      strategy: 'photos',
      photoCount: 6
    }),
    false
  );
  assert.equal(
    shouldUseSuperLike({
      isEnabled: true,
      canSuperLike: false,
      strategy: 'photos',
      photoCount: 6
    }),
    false
  );
});

test('shouldUseSuperLike evaluates each configured strategy', () => {
  assert.equal(
    shouldUseSuperLike({
      isEnabled: true,
      canSuperLike: true,
      strategy: 'random',
      randomValue: 0.09
    }),
    true
  );
  assert.equal(
    shouldUseSuperLike({
      isEnabled: true,
      canSuperLike: true,
      strategy: 'random',
      randomValue: 0.1
    }),
    false
  );
  assert.equal(
    shouldUseSuperLike({
      isEnabled: true,
      canSuperLike: true,
      strategy: 'verified',
      isVerified: true
    }),
    true
  );
  assert.equal(
    shouldUseSuperLike({
      isEnabled: true,
      canSuperLike: true,
      strategy: 'photos',
      photoCount: 5
    }),
    true
  );
  assert.equal(
    shouldUseSuperLike({
      isEnabled: true,
      canSuperLike: true,
      strategy: 'distance',
      distance: { value: 10, unit: 'km' }
    }),
    true
  );
  assert.equal(
    shouldUseSuperLike({
      isEnabled: true,
      canSuperLike: true,
      strategy: 'distance',
      distance: { value: 11, unit: 'km' }
    }),
    false
  );
});
