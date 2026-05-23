const test = require('node:test');
const assert = require('node:assert/strict');
const {
  formatConversationTurns,
  getConversationRole,
  getLastConversationTurns,
  isConversationPendingReply,
  normalizeConversationMessages
} = require('../src/misc/conversation-context');

const userId = 'user-1';
const matchUserId = 'match-1';

test('getConversationRole identifies account owner and match messages', () => {
  assert.equal(getConversationRole({ from: userId }, { currentUserId: userId }), 'user');
  assert.equal(getConversationRole({ from: matchUserId }, { matchUserId }), 'match');
  assert.equal(getConversationRole({ to: userId, from: matchUserId }, { currentUserId: userId }), 'match');
  assert.equal(getConversationRole({ to: matchUserId, from: userId }, { matchUserId }), 'user');
  assert.equal(getConversationRole({ from: 'unknown' }, { currentUserId: userId, matchUserId }), 'unknown');
});

test('normalizeConversationMessages keeps sender roles and chronological order', () => {
  const turns = normalizeConversationMessages(
    [
      {
        _id: '2',
        from: matchUserId,
        message: 'Oi, tudo bem?',
        sent_date: '2026-01-01T10:01:00.000Z'
      },
      {
        _id: '1',
        from: userId,
        message: 'Bom dia',
        sent_date: '2026-01-01T10:00:00.000Z'
      }
    ],
    { currentUserId: userId, matchUserId }
  );

  assert.deepEqual(
    turns.map(({ id, role, text }) => ({ id, role, text })),
    [
      { id: '1', role: 'user', text: 'Bom dia' },
      { id: '2', role: 'match', text: 'Oi, tudo bem?' }
    ]
  );
});

test('conversation helpers limit context and require latest message from match', () => {
  const turns = normalizeConversationMessages(
    [
      { from: userId, message: 'A', sent_date: '2026-01-01T10:00:00.000Z' },
      { from: matchUserId, message: 'B', sent_date: '2026-01-01T10:01:00.000Z' },
      { from: userId, message: 'C', sent_date: '2026-01-01T10:02:00.000Z' },
      { from: matchUserId, message: 'D', sent_date: '2026-01-01T10:03:00.000Z' }
    ],
    { currentUserId: userId, matchUserId }
  );

  assert.equal(isConversationPendingReply(turns), true);
  assert.deepEqual(
    getLastConversationTurns(turns, 2).map((turn) => turn.text),
    ['C', 'D']
  );
  assert.equal(formatConversationTurns(getLastConversationTurns(turns, 2)), 'OWNER: C\nMATCH: D');
});

test('isConversationPendingReply does not send when latest sender is unknown or user', () => {
  assert.equal(isConversationPendingReply([{ role: 'unknown', text: 'Oi' }]), false);
  assert.equal(isConversationPendingReply([{ role: 'user', text: 'Oi' }]), false);
});
