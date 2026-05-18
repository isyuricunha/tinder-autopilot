const getMatchID = (match) => {
  const rawMatchID = match && typeof match === 'object' ? match.id : match;
  const matchID = String(rawMatchID || '').trim();

  if (!matchID) {
    throw new Error('Missing match id');
  }

  return encodeURIComponent(matchID);
};

const buildMatchMessagesUrl = (match) =>
  `https://api.gotinder.com/v2/matches/${getMatchID(match)}/messages?count=100`;

const buildSendMessageUrl = (match) =>
  `https://api.gotinder.com/user/matches/${getMatchID(match)}?locale=en`;

module.exports = {
  buildMatchMessagesUrl,
  buildSendMessageUrl,
  getMatchID
};
