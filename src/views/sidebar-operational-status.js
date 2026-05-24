const { AI_REPLY_MODES, normalizeAiReplyMode } = require('./ai-reply-mode-state');

const OPERATIONAL_STATUS_TONES = Object.freeze({
  idle: 'idle',
  success: 'success'
});

const createOperationalStatus = ({ text, tone = OPERATIONAL_STATUS_TONES.idle }) => ({
  text,
  tone
});

const getAutoLikeOperationalStatus = (isRunning = false) =>
  createOperationalStatus({
    text: isRunning ? 'Running' : 'Off',
    tone: isRunning ? OPERATIONAL_STATUS_TONES.success : OPERATIONAL_STATUS_TONES.idle
  });

const getAiReplyOperationalStatus = (mode = AI_REPLY_MODES.off) => {
  const normalizedMode = normalizeAiReplyMode(mode);
  const labels = {
    [AI_REPLY_MODES.off]: 'Off',
    [AI_REPLY_MODES.once]: 'Reply once',
    [AI_REPLY_MODES.continuous]: 'Continuous'
  };

  return createOperationalStatus({
    text: labels[normalizedMode],
    tone:
      normalizedMode === AI_REPLY_MODES.off
        ? OPERATIONAL_STATUS_TONES.idle
        : OPERATIONAL_STATUS_TONES.success
  });
};

const getProviderOperationalStatus = (providerLabel = '') =>
  createOperationalStatus({
    text: String(providerLabel || 'Unknown')
  });

module.exports = {
  OPERATIONAL_STATUS_TONES,
  getAiReplyOperationalStatus,
  getAutoLikeOperationalStatus,
  getProviderOperationalStatus
};
