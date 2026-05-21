const AI_REPLY_MODES = Object.freeze({
  continuous: 'continuous',
  off: 'off',
  once: 'once'
});

const normalizeAiReplyMode = (mode) =>
  Object.values(AI_REPLY_MODES).includes(mode) ? mode : AI_REPLY_MODES.off;

const getAiReplyModeFromResponderState = ({ isRunning = false, isContinuousMode = false } = {}) => {
  if (!isRunning) return AI_REPLY_MODES.off;
  return isContinuousMode ? AI_REPLY_MODES.continuous : AI_REPLY_MODES.once;
};

const canStartAiReplyMode = ({ currentMode = AI_REPLY_MODES.off, requestedMode } = {}) =>
  normalizeAiReplyMode(requestedMode) !== AI_REPLY_MODES.off &&
  normalizeAiReplyMode(currentMode) === AI_REPLY_MODES.off;

module.exports = {
  AI_REPLY_MODES,
  canStartAiReplyMode,
  getAiReplyModeFromResponderState,
  normalizeAiReplyMode
};
