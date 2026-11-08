const { AI_PROFILE_FILTER_TRUNCATED, createAiProfileFilterFailure } = require('./ai-profile-filter-result');

const retryTruncatedProfileDecision = async ({ maxTokens, request, isCancelled }) => {
  const budgets = [maxTokens, maxTokens * 4, maxTokens * 16];
  for (const budget of budgets) {
    if (isCancelled()) return createAiProfileFilterFailure('Profile analysis cancelled');
    const result = await request(budget);
    if (isCancelled()) return createAiProfileFilterFailure('Profile analysis cancelled');
    if (result.code !== AI_PROFILE_FILTER_TRUNCATED) return result;
  }

  return {
    shouldSwipe: true,
    isFallback: true,
    reason: 'AI response was truncated on all 3 attempts. Using a regular Like.'
  };
};

module.exports = { retryTruncatedProfileDecision };
