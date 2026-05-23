const get = require('lodash/get');
const {
  getLastConversationTurns,
  isConversationPendingReply,
  normalizeConversationMessages
} = require('./conversation-context');
const { generateAiMessageReply } = require('./ai-message-reply');
const { hasUserAlreadySharedContact } = require('./ai-reply-manual-takeover');

const normalizeId = (value) => String(value || '').trim();

const firstValue = (source, paths = []) => {
  for (const path of paths) {
    const value = normalizeId(get(source, path));
    if (value) return value;
  }
  return '';
};

const getCurrentUserId = (profileData) =>
  firstValue(profileData, [
    'data.user._id',
    'data.user.id',
    'data.account._id',
    'data.account.id',
    'user._id',
    'user.id',
    '_id',
    'id'
  ]);

const getMatchId = (match) => firstValue(match, ['id', '_id', 'match_id']);

const getMatchName = (match) => String(get(match, 'person.name') || '').trim();

const getMatchUserId = (match) =>
  firstValue(match, [
    'person._id',
    'person.id',
    'person.user_id',
    'user._id',
    'user.id',
    'participant._id',
    'participant.id'
  ]);

const createSkippedAiReplyMatchResult = (reason, extra = {}) => ({
  didSend: false,
  reason,
  status: 'skipped',
  ...extra
});

const getLatestConversationSignature = (conversationTurns = []) => {
  const latestTurn = conversationTurns[conversationTurns.length - 1];
  if (!latestTurn) return '';
  return [
    latestTurn.id,
    latestTurn.role,
    latestTurn.sentDate,
    latestTurn.senderId,
    latestTurn.text
  ]
    .map((value) => String(value || '').trim())
    .join('|');
};

const getLatestMatchMessageText = (conversationTurns = []) => {
  for (let index = conversationTurns.length - 1; index >= 0; index -= 1) {
    const turn = conversationTurns[index];
    if (turn?.role === 'match' && turn.text) return turn.text;
  }

  return '';
};

const buildPendingAiReplyContext = ({
  contextWindow,
  match,
  profileData,
  rawMessages = []
} = {}) => {
  const matchId = getMatchId(match);
  if (!matchId) {
    return createSkippedAiReplyMatchResult('Missing match id');
  }

  const currentUserId = getCurrentUserId(profileData);
  const matchUserId = getMatchUserId(match);
  const conversationTurns = normalizeConversationMessages(rawMessages, {
    currentUserId,
    matchUserId
  });

  if (!isConversationPendingReply(conversationTurns)) {
    return createSkippedAiReplyMatchResult('Latest message is not from match', {
      matchId,
      matchName: getMatchName(match)
    });
  }

  if (hasUserAlreadySharedContact(conversationTurns)) {
    return createSkippedAiReplyMatchResult('Owner already shared contact in this conversation', {
      matchId,
      matchName: getMatchName(match)
    });
  }

  return {
    conversationTurns: getLastConversationTurns(conversationTurns, contextWindow),
    didSend: false,
    latestMessageSignature: getLatestConversationSignature(conversationTurns),
    matchId,
    matchName: getMatchName(match),
    reason: 'Pending reply',
    status: 'pending'
  };
};

const reviewNextPendingAiReply = async ({
  apiKey = '',
  generateReply = generateAiMessageReply,
  loadMatchesPage,
  loadRawMessages,
  profileData,
  settings = {}
} = {}) => {
  if (typeof loadMatchesPage !== 'function') {
    return createSkippedAiReplyMatchResult('Match page loader unavailable', {
      checkedMatches: 0,
      checkedPages: 0,
      status: 'failed'
    });
  }

  if (typeof loadRawMessages !== 'function') {
    return createSkippedAiReplyMatchResult('Raw message loader unavailable', {
      checkedMatches: 0,
      checkedPages: 0,
      status: 'failed'
    });
  }

  let nextPageToken = true;
  let checkedMatches = 0;
  let checkedPages = 0;

  while (nextPageToken) {
    const response = await loadMatchesPage(nextPageToken);
    checkedPages += 1;
    nextPageToken = get(response, 'data.next_page_token');
    const matches = get(response, 'data.matches', []) || [];

    for (const match of matches) {
      checkedMatches += 1;
      const matchId = getMatchId(match);
      if (!matchId) continue;

      const rawMessages = await loadRawMessages(matchId);
      const context = buildPendingAiReplyContext({
        contextWindow: settings.contextWindow,
        match,
        profileData,
        rawMessages
      });

      if (context.status !== 'pending') continue;

      const aiReply = await generateReply({
        ...settings,
        apiKey,
        conversationTurns: context.conversationTurns,
        matchName: context.matchName
      });

      return {
        aiReply,
        checkedMatches,
        checkedPages,
        conversationTurns: context.conversationTurns,
        didSend: false,
        latestMatchMessage: getLatestMatchMessageText(context.conversationTurns),
        latestMessageSignature: context.latestMessageSignature,
        matchId: context.matchId,
        matchName: context.matchName,
        reason: 'Pending reply reviewed without sending',
        status: 'reviewed'
      };
    }
  }

  return {
    checkedMatches,
    checkedPages,
    didSend: false,
    reason: 'No pending conversations found',
    status: 'empty'
  };
};

const processAiReplyMatch = async ({
  apiKey = '',
  generateReply = generateAiMessageReply,
  loadRawMessages,
  match,
  profileData,
  rawMessages = [],
  sendMessage,
  settings = {}
} = {}) => {
  const context = buildPendingAiReplyContext({
    contextWindow: settings.contextWindow,
    match,
    profileData,
    rawMessages
  });

  if (context.status !== 'pending') return context;

  const replyResult = await generateReply({
    ...settings,
    apiKey,
    conversationTurns: context.conversationTurns,
    matchName: context.matchName
  });

  if (!replyResult.shouldSend || !replyResult.reply) {
    return createSkippedAiReplyMatchResult(replyResult.reason || 'AI declined to send', {
      matchId: context.matchId,
      matchName: context.matchName
    });
  }

  if (typeof loadRawMessages === 'function') {
    const latestRawMessages = await loadRawMessages(context.matchId);
    const latestContext = buildPendingAiReplyContext({
      contextWindow: settings.contextWindow,
      match,
      profileData,
      rawMessages: latestRawMessages
    });

    if (latestContext.status !== 'pending') {
      return createSkippedAiReplyMatchResult('Latest message changed before send', {
        matchId: context.matchId,
        matchName: context.matchName
      });
    }

    if (latestContext.latestMessageSignature !== context.latestMessageSignature) {
      return createSkippedAiReplyMatchResult('Latest message changed before send', {
        matchId: context.matchId,
        matchName: context.matchName
      });
    }
  }

  if (typeof sendMessage !== 'function') {
    return createSkippedAiReplyMatchResult('Send function unavailable', {
      matchId: context.matchId,
      matchName: context.matchName
    });
  }

  const sendResponse = await sendMessage(context.matchId, { message: replyResult.reply });
  if (get(sendResponse, 'sent_date')) {
    return {
      didSend: true,
      matchId: context.matchId,
      matchName: context.matchName,
      reason: replyResult.reason,
      reply: replyResult.reply,
      status: 'sent'
    };
  }

  return {
    didSend: false,
    matchId: context.matchId,
    matchName: context.matchName,
    reason: 'Tinder did not confirm sent_date',
    reply: replyResult.reply,
    status: 'failed'
  };
};

module.exports = {
  buildPendingAiReplyContext,
  getCurrentUserId,
  getLatestConversationSignature,
  getLatestMatchMessageText,
  getMatchId,
  getMatchName,
  getMatchUserId,
  processAiReplyMatch,
  reviewNextPendingAiReply
};
