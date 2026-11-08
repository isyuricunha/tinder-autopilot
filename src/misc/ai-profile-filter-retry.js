const {
  AI_PROFILE_FILTER_CONNECTION,
  AI_PROFILE_FILTER_TRUNCATED,
  createAiProfileFilterFailure
} = require('./ai-profile-filter-result');

const waitBeforeRetry = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryProfileDecision = async ({
  maxTokens, request, isCancelled, wait = waitBeforeRetry
}) => {
  let budget = maxTokens;
  let truncations = 0;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    if (isCancelled()) return createAiProfileFilterFailure('Profile analysis cancelled');
    const result = await request(budget);
    if (isCancelled()) return createAiProfileFilterFailure('Profile analysis cancelled');
    if (result.code === AI_PROFILE_FILTER_TRUNCATED) {
      truncations += 1;
      budget *= 4;
    } else if (result.code === AI_PROFILE_FILTER_CONNECTION) {
      if (attempt < 3) await wait(600 * attempt);
    } else {
      return result;
    }
  }

  if (truncations < 3) {
    return createAiProfileFilterFailure(
      'Could not get a complete AI decision after 3 attempts. Check the provider connection and Base URL.',
      AI_PROFILE_FILTER_CONNECTION
    );
  }

  return {
    shouldSwipe: true,
    isFallback: true,
    reason: 'AI response was truncated on all 3 attempts. Using a regular Like.'
  };
};

module.exports = { retryProfileDecision };
