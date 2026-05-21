const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildPendingAiReplyContext,
  getCurrentUserId,
  getLatestConversationSignature,
  getMatchId,
  getMatchName,
  getMatchUserId,
  processAiReplyMatch
} = require('../src/misc/ai-message-reply-flow');

const profileData = {
  data: {
    user: {
      _id: 'user-1'
    }
  }
};

const match = {
  id: 'match-1',
  person: {
    _id: 'person-1',
    name: 'Ana'
  }
};

test('AI reply flow extracts profile and match identifiers', () => {
  assert.equal(getCurrentUserId(profileData), 'user-1');
  assert.equal(getMatchId(match), 'match-1');
  assert.equal(getMatchName(match), 'Ana');
  assert.equal(getMatchUserId(match), 'person-1');
});

test('buildPendingAiReplyContext only allows conversations waiting on the match', () => {
  const pending = buildPendingAiReplyContext({
    contextWindow: 1,
    match,
    profileData,
    rawMessages: [
      { from: 'user-1', to: 'person-1', message: 'Bom dia', sent_date: '2026-01-01T10:00:00Z' },
      {
        from: 'person-1',
        to: 'user-1',
        message: 'Dormiu bem?',
        sent_date: '2026-01-01T10:01:00Z'
      }
    ]
  });

  assert.equal(pending.status, 'pending');
  assert.equal(pending.matchId, 'match-1');
  assert.equal(pending.matchName, 'Ana');
  assert.equal(typeof pending.latestMessageSignature, 'string');
  assert.deepEqual(
    pending.conversationTurns.map((turn) => turn.text),
    ['Dormiu bem?']
  );

  const notPending = buildPendingAiReplyContext({
    match,
    profileData,
    rawMessages: [
      { from: 'person-1', to: 'user-1', message: 'Oi', sent_date: '2026-01-01T10:00:00Z' },
      { from: 'user-1', to: 'person-1', message: 'Tudo bem?', sent_date: '2026-01-01T10:01:00Z' }
    ]
  });

  assert.equal(notPending.status, 'skipped');
  assert.equal(notPending.reason, 'Latest message is not from match');
});

test('buildPendingAiReplyContext skips conversations where owner already shared contact', () => {
  const skipped = buildPendingAiReplyContext({
    contextWindow: 10,
    match,
    profileData,
    rawMessages: [
      {
        from: 'user-1',
        to: 'person-1',
        message: 'me chama no +55 11 99999-9999',
        sent_date: '2026-01-01T10:00:00Z'
      },
      {
        from: 'person-1',
        to: 'user-1',
        message: 'chamo sim',
        sent_date: '2026-01-01T10:01:00Z'
      }
    ]
  });

  assert.equal(skipped.status, 'skipped');
  assert.equal(skipped.reason, 'Owner already shared contact in this conversation');
});

test('getLatestConversationSignature identifies the latest pending message', () => {
  assert.equal(
    getLatestConversationSignature([
      {
        id: 'message-1',
        role: 'match',
        senderId: 'person-1',
        sentDate: '2026-01-01T10:01:00Z',
        text: 'Dormiu bem?'
      }
    ]),
    'message-1|match|2026-01-01T10:01:00Z|person-1|Dormiu bem?'
  );
});

test('processAiReplyMatch sends only approved AI replies', async () => {
  const sentMessages = [];
  const result = await processAiReplyMatch({
    apiKey: 'secret',
    generateReply: async ({ apiKey, conversationTurns, matchName }) => {
      assert.equal(apiKey, 'secret');
      assert.equal(matchName, 'Ana');
      assert.equal(conversationTurns[conversationTurns.length - 1].text, 'Dormiu bem?');
      return {
        shouldSend: true,
        reply: 'Dormi bem sim, e voce?',
        reason: 'Answers question'
      };
    },
    match,
    profileData,
    rawMessages: [
      { from: 'user-1', to: 'person-1', message: 'Bom dia', sent_date: '2026-01-01T10:00:00Z' },
      {
        from: 'person-1',
        to: 'user-1',
        message: 'Dormiu bem?',
        sent_date: '2026-01-01T10:01:00Z'
      }
    ],
    loadRawMessages: async () => [
      { from: 'user-1', to: 'person-1', message: 'Bom dia', sent_date: '2026-01-01T10:00:00Z' },
      {
        from: 'person-1',
        to: 'user-1',
        message: 'Dormiu bem?',
        sent_date: '2026-01-01T10:01:00Z'
      }
    ],
    sendMessage: async (matchId, body) => {
      sentMessages.push({ matchId, body });
      return { sent_date: '2026-01-01T10:02:00Z' };
    },
    settings: { contextWindow: 5 }
  });

  assert.equal(result.status, 'sent');
  assert.equal(result.didSend, true);
  assert.deepEqual(sentMessages, [
    { matchId: 'match-1', body: { message: 'Dormi bem sim, e voce?' } }
  ]);
});

test('processAiReplyMatch does not send when gating fails', async () => {
  let generateCalls = 0;
  let sendCalls = 0;

  const notPending = await processAiReplyMatch({
    generateReply: async () => {
      generateCalls += 1;
      return { shouldSend: true, reply: 'Oi', reason: 'Should not run' };
    },
    match,
    profileData,
    rawMessages: [
      { from: 'person-1', to: 'user-1', message: 'Oi', sent_date: '2026-01-01T10:00:00Z' },
      { from: 'user-1', to: 'person-1', message: 'Oi!', sent_date: '2026-01-01T10:01:00Z' }
    ],
    sendMessage: async () => {
      sendCalls += 1;
    },
    settings: { contextWindow: 5 }
  });

  assert.equal(notPending.status, 'skipped');
  assert.equal(generateCalls, 0);
  assert.equal(sendCalls, 0);

  const declined = await processAiReplyMatch({
    generateReply: async () => {
      generateCalls += 1;
      return { shouldSend: false, reply: '', reason: 'No reply needed' };
    },
    match,
    profileData,
    rawMessages: [
      { from: 'user-1', to: 'person-1', message: 'Bom dia', sent_date: '2026-01-01T10:00:00Z' },
      { from: 'person-1', to: 'user-1', message: 'Ok', sent_date: '2026-01-01T10:01:00Z' }
    ],
    sendMessage: async () => {
      sendCalls += 1;
    },
    settings: { contextWindow: 5 }
  });

  assert.equal(declined.status, 'skipped');
  assert.equal(declined.reason, 'No reply needed');
  assert.equal(generateCalls, 1);
  assert.equal(sendCalls, 0);
});

test('processAiReplyMatch rechecks the latest message before sending', async () => {
  let sendCalls = 0;
  const result = await processAiReplyMatch({
    generateReply: async () => ({
      shouldSend: true,
      reply: 'Claro, te conto sim',
      reason: 'Answers question'
    }),
    loadRawMessages: async () => [
      { from: 'user-1', to: 'person-1', message: 'Bom dia', sent_date: '2026-01-01T10:00:00Z' },
      {
        from: 'person-1',
        to: 'user-1',
        message: 'Dormiu bem?',
        sent_date: '2026-01-01T10:01:00Z'
      },
      {
        from: 'person-1',
        to: 'user-1',
        message: 'E de onde voce era?',
        sent_date: '2026-01-01T10:02:00Z'
      }
    ],
    match,
    profileData,
    rawMessages: [
      { from: 'user-1', to: 'person-1', message: 'Bom dia', sent_date: '2026-01-01T10:00:00Z' },
      {
        from: 'person-1',
        to: 'user-1',
        message: 'Dormiu bem?',
        sent_date: '2026-01-01T10:01:00Z'
      }
    ],
    sendMessage: async () => {
      sendCalls += 1;
    },
    settings: { contextWindow: 5 }
  });

  assert.equal(result.status, 'skipped');
  assert.equal(result.reason, 'Latest message changed before send');
  assert.equal(sendCalls, 0);
});
