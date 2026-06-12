const test = require('node:test');
const assert = require('node:assert/strict');
const { get, keyBy, toPathSegments } = require('../src/misc/object-utils');

test('get reads dotted and array-index paths with defaults', () => {
  const source = {
    data: {
      matches: [{ id: 'match-1' }],
      profile: { name: 'Ana' }
    }
  };

  assert.equal(get(source, 'data.profile.name'), 'Ana');
  assert.equal(get(source, 'data.matches[0].id'), 'match-1');
  assert.equal(get(source, ['data', 'profile', 'name']), 'Ana');
  assert.equal(get(source, 'data.missing.value', 'fallback'), 'fallback');
  assert.equal(get(source, 'data.profile.missing'), undefined);
});

test('keyBy indexes items by a direct or nested key', () => {
  assert.deepEqual(keyBy([{ id: 'a' }, { id: 'b' }], 'id'), {
    a: { id: 'a' },
    b: { id: 'b' }
  });
  assert.deepEqual(keyBy([{ person: { id: 'a' } }], 'person.id'), {
    a: { person: { id: 'a' } }
  });
});

test('toPathSegments ignores empty path sections', () => {
  assert.deepEqual(toPathSegments('data..matches[0].id'), ['data', 'matches', '0', 'id']);
});
