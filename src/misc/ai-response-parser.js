const { getAiChatResponseContent } = require('./ai-chat-provider');

const parseAiDecision = (data) => {
  const content = getAiChatResponseContent(data);
  if (!content) {
    return { shouldSwipe: true, reason: 'Empty response' };
  }

  try {
    const parsed = JSON.parse(content);
    const shouldSwipe = parsed.shouldSwipe === 'yes';
    const reason = parsed.reason || `confidence: ${parsed.confidence || '?'}`;

    return { shouldSwipe, reason };
  } catch (error) {
    return { shouldSwipe: true, reason: 'Parse error' };
  }
};

module.exports = { parseAiDecision };
