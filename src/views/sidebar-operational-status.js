const { AI_REPLY_MODES, normalizeAiReplyMode } = require('./ai-reply-mode-state');
const { SWIPE_PHASES, formatSwipeDuration } = require('../misc/swipe-progress');

const OPERATIONAL_STATUS_TONES = Object.freeze({
  idle: 'idle',
  success: 'success',
  warning: 'warning'
});

const createOperationalStatus = ({ text, tone = OPERATIONAL_STATUS_TONES.idle }) => ({
  text,
  tone
});

const getAutoLikeOperationalStatus = (
  { phase = SWIPE_PHASES.off, startedAt, reason } = {},
  now = Date.now()
) => {
  if (phase === SWIPE_PHASES.off) return createOperationalStatus({ text: phase });
  if (phase === SWIPE_PHASES.paused) {
    return {
      text: phase,
      tone: OPERATIONAL_STATUS_TONES.warning,
      detail: reason
    };
  }

  return createOperationalStatus({
    text: startedAt == null ? phase : `${phase} · ${formatSwipeDuration(now - startedAt)}`,
    tone: OPERATIONAL_STATUS_TONES.success
  });
};

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
