const DEFAULT_CONTEXT_WINDOW = 10;

const normalizeConversationText = (value) =>
  String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeID = (value) => String(value || '').trim();

const getMessageID = (message = {}) =>
  normalizeID(message._id || message.id || message.message_id || message.client_message_id);

const getMessageSenderID = (message = {}) =>
  normalizeID(message.from || message.from_id || message.sender_id || message.user_id);

const getMessageRecipientID = (message = {}) =>
  normalizeID(message.to || message.to_id || message.recipient_id);

const parseMessageTimestamp = (value) => {
  const timestamp = Date.parse(value || '');
  return Number.isFinite(timestamp) ? timestamp : null;
};

const getConversationRole = (message = {}, { currentUserId = '', matchUserId = '' } = {}) => {
  const senderID = getMessageSenderID(message);
  const recipientID = getMessageRecipientID(message);
  const currentID = normalizeID(currentUserId);
  const otherID = normalizeID(matchUserId);

  if (currentID && senderID === currentID) return 'user';
  if (otherID && senderID === otherID) return 'match';
  if (currentID && recipientID === currentID && senderID) return 'match';
  if (otherID && recipientID === otherID && senderID) return 'user';

  return 'unknown';
};

const normalizeConversationMessage = (message = {}, options = {}) => {
  const text = normalizeConversationText(message.message || message.text || message.body);
  if (!text) return null;

  const sentDate = message.sent_date || message.created_date || message.created_at || null;

  return {
    id: getMessageID(message),
    role: getConversationRole(message, options),
    senderId: getMessageSenderID(message),
    text,
    sentDate,
    timestamp: parseMessageTimestamp(sentDate)
  };
};

const normalizeConversationMessages = (messages = [], options = {}) =>
  (Array.isArray(messages) ? messages : [])
    .map((message, index) => ({ message: normalizeConversationMessage(message, options), index }))
    .filter(({ message }) => Boolean(message))
    .sort((left, right) => {
      const leftTime = left.message.timestamp;
      const rightTime = right.message.timestamp;
      if (leftTime !== null && rightTime !== null && leftTime !== rightTime) {
        return leftTime - rightTime;
      }
      return left.index - right.index;
    })
    .map(({ message }) => message);

const getLastConversationTurns = (messages = [], limit = DEFAULT_CONTEXT_WINDOW) => {
  const safeLimit = Math.max(1, parseInt(limit, 10) || DEFAULT_CONTEXT_WINDOW);
  return messages.slice(-safeLimit);
};

const isConversationPendingReply = (messages = []) => {
  const lastMessage = messages[messages.length - 1];
  return Boolean(lastMessage && lastMessage.role === 'match');
};

const formatConversationTurns = (messages = []) =>
  messages
    .map((message) => {
      const label =
        message.role === 'user' ? 'USER' : message.role === 'match' ? 'MATCH' : 'UNKNOWN';
      return `${label}: ${message.text}`;
    })
    .join('\n');

module.exports = {
  DEFAULT_CONTEXT_WINDOW,
  formatConversationTurns,
  getConversationRole,
  getLastConversationTurns,
  isConversationPendingReply,
  normalizeConversationMessage,
  normalizeConversationMessages,
  normalizeConversationText
};
