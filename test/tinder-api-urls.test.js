const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildMatchMessagesUrl,
  buildSendMessageUrl,
  getMatchID
} = require('../src/misc/tinder-api-urls');

test('getMatchID accepts a match id string', () => {
  assert.equal(getMatchID('match-1'), 'match-1');
});

test('getMatchID accepts a match object', () => {
  assert.equal(getMatchID({ id: 'match-1' }), 'match-1');
});

test('getMatchID rejects missing ids before sending a Tinder request', () => {
  assert.throws(() => getMatchID(undefined), /Missing match id/);
  assert.throws(() => getMatchID({}), /Missing match id/);
});

test('buildMatchMessagesUrl targets the selected match messages endpoint', () => {
  assert.equal(
    buildMatchMessagesUrl('match-1'),
    'https://api.gotinder.com/v2/matches/match-1/messages?count=100'
  );
});

test('buildSendMessageUrl targets the selected match send endpoint', () => {
  assert.equal(
    buildSendMessageUrl('match-1'),
    'https://api.gotinder.com/user/matches/match-1?locale=en'
  );
});
