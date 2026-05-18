const createMessengerSessionState = () => ({
  allMatches: [],
  checkedMessage: 0,
  isRunningMessage: true,
  nextPageToken: true
});

const clearMessengerMatchQueue = () => [];

const normalizeMessengerMatchQueue = (matches) => (Array.isArray(matches) ? matches : []);

module.exports = {
  createMessengerSessionState,
  clearMessengerMatchQueue,
  normalizeMessengerMatchQueue
};
