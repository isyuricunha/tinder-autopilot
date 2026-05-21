const get = require('lodash/get');
const {
  getLastConversationTurns,
  isConversationPendingReply,
  normalizeConversationMessages
} = require('./conversation-context');
const { generateAiMessageReply } = require('./ai-message-reply');

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

  return {
    conversationTurns: getLastConversationTurns(conversationTurns, contextWindow),
    didSend: false,
    matchId,
    matchName: getMatchName(match),
    reason: 'Pending reply',
    status: 'pending'
  };
};

const processAiReplyMatch = async ({
  apiKey = '',
  generateReply = generateAiMessageReply,
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
  getMatchId,
  getMatchName,
  getMatchUserId,
  processAiReplyMatch
};
