const test = require('node:test');
const assert = require('node:assert/strict');
const { AI_REPLY_MODES } = require('../src/views/ai-reply-mode-state');
const {
  SWIPE_PHASES,
  createSwipeCycle,
  summarizeSwipeCycle,
  trackSwipePhase
} = require('../src/misc/swipe-progress');
const {
  OPERATIONAL_STATUS_TONES,
  getAiReplyOperationalStatus,
  getAutoLikeOperationalStatus,
  getProviderOperationalStatus
} = require('../src/views/sidebar-operational-status');

test('Auto Like shows elapsed time for its current phase and reports automatic pauses', () => {
  assert.deepEqual(getAutoLikeOperationalStatus(), {
    text: 'Off',
    tone: OPERATIONAL_STATUS_TONES.idle
  });
  assert.deepEqual(getAutoLikeOperationalStatus({
    phase: SWIPE_PHASES.waitingForAi,
    startedAt: 1000
  }, 67000), {
    text: 'Waiting for AI · 1m 6s',
    tone: OPERATIONAL_STATUS_TONES.success
  });
  assert.deepEqual(getAutoLikeOperationalStatus({
    phase: SWIPE_PHASES.paused,
    reason: 'Swipe left could not be confirmed'
  }), {
    text: 'Paused',
    tone: OPERATIONAL_STATUS_TONES.warning,
    detail: 'Swipe left could not be confirmed'
  });
});

test('a cycle summary keeps its decision and aggregated phase timings separate', () => {
  const cycle = createSwipeCycle(0);
  trackSwipePhase(cycle, SWIPE_PHASES.closingProfile, 0);
  trackSwipePhase(cycle, SWIPE_PHASES.waitingForAi, 300);
  trackSwipePhase(cycle, SWIPE_PHASES.closingProfile, 2100);
  trackSwipePhase(cycle, SWIPE_PHASES.confirmingSwipe, 2500);
  cycle.outcome = 'Skipped';
  cycle.reason = 'AI:  Matched rule\nfrom bio';
  assert.deepEqual(summarizeSwipeCycle(cycle, 3000), {
    outcome: 'Skipped',
    duration: '3 s',
    reason: 'AI: Matched rule from bio',
    timings: [
      { phase: SWIPE_PHASES.closingProfile, duration: '700 ms' },
      { phase: SWIPE_PHASES.waitingForAi, duration: '1.8 s' },
      { phase: SWIPE_PHASES.confirmingSwipe, duration: '500 ms' }
    ]
  });
});

test('operational status summarizes AI reply mode', () => {
  assert.deepEqual(getAiReplyOperationalStatus(AI_REPLY_MODES.off), {
    text: 'Off',
    tone: OPERATIONAL_STATUS_TONES.idle
  });
  assert.deepEqual(getAiReplyOperationalStatus(AI_REPLY_MODES.once), {
    text: 'Reply once',
    tone: OPERATIONAL_STATUS_TONES.success
  });
  assert.deepEqual(getAiReplyOperationalStatus(AI_REPLY_MODES.continuous), {
    text: 'Continuous',
    tone: OPERATIONAL_STATUS_TONES.success
  });
  assert.deepEqual(getAiReplyOperationalStatus('unknown'), {
    text: 'Off',
    tone: OPERATIONAL_STATUS_TONES.idle
  });
});

test('operational status summarizes provider label safely', () => {
  assert.deepEqual(getProviderOperationalStatus('NVIDIA NIM'), {
    text: 'NVIDIA NIM',
    tone: OPERATIONAL_STATUS_TONES.idle
  });
  assert.deepEqual(getProviderOperationalStatus(''), {
    text: 'Unknown',
    tone: OPERATIONAL_STATUS_TONES.idle
  });
});
