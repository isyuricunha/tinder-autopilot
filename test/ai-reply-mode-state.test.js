const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AI_REPLY_MODES,
  canStartAiReplyMode,
  getAiReplyModeFromResponderState,
  normalizeAiReplyMode
} = require('../src/views/ai-reply-mode-state');

test('AI reply mode state normalizes unknown values to off', () => {
  assert.equal(normalizeAiReplyMode(AI_REPLY_MODES.once), AI_REPLY_MODES.once);
  assert.equal(normalizeAiReplyMode('unknown'), AI_REPLY_MODES.off);
});

test('AI reply mode state derives current mode from responder state', () => {
  assert.equal(getAiReplyModeFromResponderState(), AI_REPLY_MODES.off);
  assert.equal(
    getAiReplyModeFromResponderState({ isRunning: true, isContinuousMode: false }),
    AI_REPLY_MODES.once
  );
  assert.equal(
    getAiReplyModeFromResponderState({ isRunning: true, isContinuousMode: true }),
    AI_REPLY_MODES.continuous
  );
});

test('AI reply mode state only starts a mode from off', () => {
  assert.equal(
    canStartAiReplyMode({
      currentMode: AI_REPLY_MODES.off,
      requestedMode: AI_REPLY_MODES.once
    }),
    true
  );
  assert.equal(
    canStartAiReplyMode({
      currentMode: AI_REPLY_MODES.continuous,
      requestedMode: AI_REPLY_MODES.once
    }),
    false
  );
  assert.equal(
    canStartAiReplyMode({
      currentMode: AI_REPLY_MODES.off,
      requestedMode: AI_REPLY_MODES.off
    }),
    false
  );
});
