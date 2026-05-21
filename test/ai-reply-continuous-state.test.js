const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getAiReplyContinuousDateKey,
  getAiReplyDailyMatchCount,
  incrementAiReplyDailyMatchCount,
  markAiReplyContinuousProcessed,
  normalizeAiReplyContinuousState,
  shouldSkipAiReplyContinuousSignature
} = require('../src/misc/ai-reply-continuous-state');

test('normalizeAiReplyContinuousState keeps only usable processed entries and counts', () => {
  assert.deepEqual(
    normalizeAiReplyContinuousState({
      processed: {
        'match-1': { signature: 'sig-1', status: 'skipped' },
        'match-2': { status: 'missing signature' },
        '': { signature: 'missing match' }
      },
      dailyCounts: {
        '2026-05-21': {
          'match-1': '2',
          'match-2': '0',
          '': '3'
        }
      }
    }),
    {
      processed: {
        'match-1': {
          lastProcessedAt: '',
          reason: '',
          signature: 'sig-1',
          status: 'skipped'
        }
      },
      dailyCounts: {
        '2026-05-21': {
          'match-1': 2
        }
      }
    }
  );
});

test('continuous processed signatures skip repeated latest messages', () => {
  const state = markAiReplyContinuousProcessed(
    {},
    {
      matchId: 'match-1',
      processedAt: new Date('2026-05-21T10:00:00Z'),
      reason: 'AI declined',
      signature: 'sig-1',
      status: 'skipped'
    }
  );

  assert.equal(shouldSkipAiReplyContinuousSignature(state, 'match-1', 'sig-1'), true);
  assert.equal(shouldSkipAiReplyContinuousSignature(state, 'match-1', 'sig-2'), false);
});

test('continuous daily counts are scoped to the local date key', () => {
  const date = new Date(2026, 4, 21, 10, 0);
  const state = incrementAiReplyDailyMatchCount({}, 'match-1', date);
  const nextState = incrementAiReplyDailyMatchCount(state, 'match-1', date);

  assert.equal(getAiReplyContinuousDateKey(date), '2026-05-21');
  assert.equal(getAiReplyDailyMatchCount(nextState, 'match-1', date), 2);
  assert.equal(getAiReplyDailyMatchCount(nextState, 'match-2', date), 0);
});
