const test = require('node:test');
const assert = require('node:assert/strict');
const {
  DEFAULT_CONTINUOUS_THROTTLE_PAUSE_MS,
  MAX_CONTINUOUS_THROTTLE_PAUSE_MS,
  getContinuousThrottlePauseMs,
  shouldPauseContinuousScan
} = require('../src/misc/ai-reply-continuous-cycle');

test('shouldPauseContinuousScan only pauses continuous scans after the throttle limit', () => {
  assert.equal(
    shouldPauseContinuousScan({
      isContinuousMode: true,
      maxSentBeforePause: 5,
      sentSincePause: 5
    }),
    true
  );
  assert.equal(
    shouldPauseContinuousScan({
      isContinuousMode: true,
      maxSentBeforePause: 5,
      sentSincePause: 4
    }),
    false
  );
  assert.equal(
    shouldPauseContinuousScan({
      isContinuousMode: false,
      maxSentBeforePause: 5,
      sentSincePause: 5
    }),
    false
  );
});

test('getContinuousThrottlePauseMs scales with reply delay inside safe bounds', () => {
  assert.equal(getContinuousThrottlePauseMs({ replyDelaySeconds: 0 }), DEFAULT_CONTINUOUS_THROTTLE_PAUSE_MS);
  assert.equal(getContinuousThrottlePauseMs({ replyDelaySeconds: 10 }), 30000);
  assert.equal(getContinuousThrottlePauseMs({ replyDelaySeconds: 999 }), MAX_CONTINUOUS_THROTTLE_PAUSE_MS);
});
