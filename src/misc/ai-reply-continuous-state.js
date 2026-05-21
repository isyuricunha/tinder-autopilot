const AI_REPLY_CONTINUOUS_STATE_KEY = 'AiReplyContinuousState';
const MAX_AI_REPLY_CONTINUOUS_PROCESSED_ENTRIES = 1000;

const normalizeObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const normalizeStateEntry = (entry = {}) => ({
  lastProcessedAt: String(entry.lastProcessedAt || ''),
  reason: String(entry.reason || ''),
  signature: String(entry.signature || ''),
  status: String(entry.status || '')
});

const normalizeAiReplyContinuousState = (state = {}) => {
  const source = normalizeObject(state);
  const processed = Object.entries(normalizeObject(source.processed)).reduce(
    (entries, [matchId, entry]) => {
      const safeMatchId = String(matchId || '').trim();
      const safeEntry = normalizeStateEntry(entry);
      if (safeMatchId && safeEntry.signature) entries[safeMatchId] = safeEntry;
      return entries;
    },
    {}
  );
  const dailyCounts = Object.entries(normalizeObject(source.dailyCounts)).reduce(
    (days, [dateKey, counts]) => {
      const safeDateKey = String(dateKey || '').trim();
      if (!safeDateKey) return days;

      const safeCounts = Object.entries(normalizeObject(counts)).reduce(
        (matchCounts, [matchId, count]) => {
          const safeMatchId = String(matchId || '').trim();
          const safeCount = Math.max(0, parseInt(count, 10) || 0);
          if (safeMatchId && safeCount) matchCounts[safeMatchId] = safeCount;
          return matchCounts;
        },
        {}
      );

      if (Object.keys(safeCounts).length) days[safeDateKey] = safeCounts;
      return days;
    },
    {}
  );

  return { processed, dailyCounts };
};

const getAiReplyContinuousDateKey = (date = new Date()) => {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, '0');
  const day = String(safeDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const pruneProcessedEntries = (
  processed,
  maxEntries = MAX_AI_REPLY_CONTINUOUS_PROCESSED_ENTRIES
) => {
  const entries = Object.entries(normalizeObject(processed));
  if (entries.length <= maxEntries) return processed;

  return entries
    .sort((left, right) =>
      String(right[1]?.lastProcessedAt || '').localeCompare(String(left[1]?.lastProcessedAt || ''))
    )
    .slice(0, maxEntries)
    .reduce((nextProcessed, [matchId, entry]) => {
      nextProcessed[matchId] = entry;
      return nextProcessed;
    }, {});
};

const shouldSkipAiReplyContinuousSignature = (state, matchId, signature) => {
  const safeState = normalizeAiReplyContinuousState(state);
  const entry = safeState.processed[String(matchId || '').trim()];
  return Boolean(entry && entry.signature === String(signature || '').trim());
};

const markAiReplyContinuousProcessed = (
  state,
  { matchId, reason = '', signature, status = 'skipped', processedAt = new Date() } = {}
) => {
  const safeState = normalizeAiReplyContinuousState(state);
  const safeMatchId = String(matchId || '').trim();
  const safeSignature = String(signature || '').trim();
  if (!safeMatchId || !safeSignature) return safeState;

  safeState.processed[safeMatchId] = normalizeStateEntry({
    lastProcessedAt:
      processedAt instanceof Date && !Number.isNaN(processedAt.getTime())
        ? processedAt.toISOString()
        : new Date().toISOString(),
    reason,
    signature: safeSignature,
    status
  });
  safeState.processed = pruneProcessedEntries(safeState.processed);
  return safeState;
};

const getAiReplyDailyMatchCount = (state, matchId, date = new Date()) => {
  const safeState = normalizeAiReplyContinuousState(state);
  const dateKey = getAiReplyContinuousDateKey(date);
  return safeState.dailyCounts[dateKey]?.[String(matchId || '').trim()] || 0;
};

const incrementAiReplyDailyMatchCount = (state, matchId, date = new Date()) => {
  const safeState = normalizeAiReplyContinuousState(state);
  const safeMatchId = String(matchId || '').trim();
  if (!safeMatchId) return safeState;

  const dateKey = getAiReplyContinuousDateKey(date);
  safeState.dailyCounts = { [dateKey]: normalizeObject(safeState.dailyCounts[dateKey]) };
  safeState.dailyCounts[dateKey][safeMatchId] =
    (safeState.dailyCounts[dateKey][safeMatchId] || 0) + 1;
  return safeState;
};

module.exports = {
  AI_REPLY_CONTINUOUS_STATE_KEY,
  MAX_AI_REPLY_CONTINUOUS_PROCESSED_ENTRIES,
  getAiReplyContinuousDateKey,
  getAiReplyDailyMatchCount,
  incrementAiReplyDailyMatchCount,
  markAiReplyContinuousProcessed,
  normalizeAiReplyContinuousState,
  shouldSkipAiReplyContinuousSignature
};
