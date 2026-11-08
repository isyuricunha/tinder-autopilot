const { getAiChatResponseContent } = require('./ai-chat-provider');

const parseAiDecision = (data) => {
  const content = getAiChatResponseContent(data);
  if (!content) {
    return { shouldSwipe: true, reason: 'Empty response' };
  }

  try {
    const parsed = JSON.parse(content);
    if (parsed?.shouldSwipe !== 'yes' && parsed?.shouldSwipe !== 'no') {
      return { shouldSwipe: true, reason: 'Invalid decision' };
    }
    const shouldSwipe = parsed.shouldSwipe === 'yes';
    const reason = parsed.reason || `confidence: ${parsed.confidence || '?'}`;

    return { shouldSwipe, reason };
  } catch (error) {
    return { shouldSwipe: true, reason: 'Parse error' };
  }
};

module.exports = { parseAiDecision };
