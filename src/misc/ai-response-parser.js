const {
  getAiChatResponseContent,
  getAiChatStopReason,
  isAiChatLengthStopReason
} = require('./ai-chat-provider');
const { createAiProfileFilterFailure } = require('./ai-profile-filter-result');

const parseAiDecision = (data) => {
  if (isAiChatLengthStopReason(getAiChatStopReason(data))) {
    return createAiProfileFilterFailure('AI decision was truncated');
  }
  const content = getAiChatResponseContent(data);
  if (!content) {
    return createAiProfileFilterFailure('Empty AI response');
  }

  try {
    const parsed = JSON.parse(content);
    if (parsed?.shouldSwipe !== 'yes' && parsed?.shouldSwipe !== 'no') {
      return createAiProfileFilterFailure('Invalid AI decision');
    }
    const shouldSwipe = parsed.shouldSwipe === 'yes';
    const reason = typeof parsed.reason === 'string' && parsed.reason.trim()
      ? parsed.reason.trim()
      : `confidence: ${Number.isFinite(parsed.confidence) ? parsed.confidence : '?'}`;

    return { shouldSwipe, reason };
  } catch (error) {
    return createAiProfileFilterFailure('AI response was not valid JSON');
  }
};

module.exports = { parseAiDecision };
