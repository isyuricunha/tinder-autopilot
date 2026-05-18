const createMessengerSessionState = () => ({
  allMatches: [],
  checkedMessage: 0,
  isRunningMessage: true,
  nextPageToken: true
});

const clearMessengerMatchQueue = () => [];

module.exports = {
  createMessengerSessionState,
  clearMessengerMatchQueue
};
