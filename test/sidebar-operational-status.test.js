const test = require('node:test');
const assert = require('node:assert/strict');
const { AI_REPLY_MODES } = require('../src/views/ai-reply-mode-state');
const {
  OPERATIONAL_STATUS_TONES,
  getAiReplyOperationalStatus,
  getAutoLikeOperationalStatus,
  getProviderOperationalStatus
} = require('../src/views/sidebar-operational-status');

test('operational status summarizes Auto Like state', () => {
  assert.deepEqual(getAutoLikeOperationalStatus(false), {
    text: 'Off',
    tone: OPERATIONAL_STATUS_TONES.idle
  });
  assert.deepEqual(getAutoLikeOperationalStatus(true), {
    text: 'Running',
    tone: OPERATIONAL_STATUS_TONES.success
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
