const createMessengerSessionState = () => ({
  allMatches: [],
  checkedMessage: 0,
  isRunningMessage: true,
  nextPageToken: true
});

const AUTO_MESSAGE_DAILY_STATE_KEY = 'AutoMessageDailyState';

const clearMessengerMatchQueue = () => [];

const normalizeMessengerMatchQueue = (matches) => (Array.isArray(matches) ? matches : []);

const getLocalDateKey = (date = new Date()) => {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, '0');
  const day = String(safeDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeAutoMessageDailyState = (state = {}) => {
  const dateKey = String(state?.dateKey || '').trim();
  const sentCount = parseInt(state?.sentCount, 10);

  return {
    dateKey,
    sentCount: Number.isFinite(sentCount) && sentCount > 0 ? sentCount : 0
  };
};

const getAutoMessageDailySentCount = (state = {}, dateKey = getLocalDateKey()) => {
  const normalizedState = normalizeAutoMessageDailyState(state);
  return normalizedState.dateKey === dateKey ? normalizedState.sentCount : 0;
};

const incrementAutoMessageDailySentCount = (
  state = {},
  { amount = 1, dateKey = getLocalDateKey() } = {}
) => ({
  dateKey,
  sentCount:
    getAutoMessageDailySentCount(state, dateKey) +
    Math.max(0, parseInt(amount, 10) || 0)
});

module.exports = {
  AUTO_MESSAGE_DAILY_STATE_KEY,
  createMessengerSessionState,
  clearMessengerMatchQueue,
  getAutoMessageDailySentCount,
  getLocalDateKey,
  incrementAutoMessageDailySentCount,
  normalizeAutoMessageDailyState,
  normalizeMessengerMatchQueue
};
