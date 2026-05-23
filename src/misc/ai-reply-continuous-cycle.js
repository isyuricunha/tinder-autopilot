const DEFAULT_CONTINUOUS_THROTTLE_PAUSE_MS = 15000;
const MAX_CONTINUOUS_THROTTLE_PAUSE_MS = 60000;

const shouldPauseContinuousScan = ({
  isContinuousMode = false,
  maxSentBeforePause = 0,
  sentSincePause = 0
} = {}) =>
  Boolean(
    isContinuousMode &&
    maxSentBeforePause > 0 &&
    sentSincePause >= maxSentBeforePause
  );

const getContinuousThrottlePauseMs = ({ replyDelaySeconds = 0 } = {}) => {
  const replyDelayMs = Math.max(0, parseInt(replyDelaySeconds, 10) || 0) * 1000;
  const scaledDelayMs = replyDelayMs * 3;
  return Math.min(
    MAX_CONTINUOUS_THROTTLE_PAUSE_MS,
    Math.max(DEFAULT_CONTINUOUS_THROTTLE_PAUSE_MS, scaledDelayMs)
  );
};

module.exports = {
  DEFAULT_CONTINUOUS_THROTTLE_PAUSE_MS,
  MAX_CONTINUOUS_THROTTLE_PAUSE_MS,
  getContinuousThrottlePauseMs,
  shouldPauseContinuousScan
};
