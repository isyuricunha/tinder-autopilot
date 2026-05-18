const parseAiDecision = (data) => {
  const choice = data?.choices?.[0]?.message?.content;
  if (!choice) {
    return { shouldSwipe: true, reason: 'Empty response' };
  }

  try {
    const parsed = JSON.parse(choice);
    const shouldSwipe = parsed.shouldSwipe === 'yes';
    const reason = parsed.reason || `confidence: ${parsed.confidence || '?'}`;

    return { shouldSwipe, reason };
  } catch (error) {
    return { shouldSwipe: true, reason: 'Parse error' };
  }
};

module.exports = { parseAiDecision };
