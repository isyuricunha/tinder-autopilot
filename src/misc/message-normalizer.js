const normalizeText = (message) =>
  String(message || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace('thanks', 'thank');

const normalizeMessageForComparison = (messageTemplate, actualName = '') => {
  const messageWithName = String(messageTemplate || '').replace(
    '{name}',
    String(actualName).toLowerCase()
  );
  return normalizeText(messageWithName);
};

const hasMessageBeenSent = (messageList, messageTemplate, matchName = '') => {
  if (!messageList || messageList.length === 0) return false;

  const normalizedTemplate = normalizeMessageForComparison(messageTemplate, matchName);
  const templateWithoutName = normalizeText(String(messageTemplate || '').replace('{name}', ''));

  return messageList.some(
    (sentMsg) =>
      sentMsg.includes(normalizedTemplate) ||
      (templateWithoutName && sentMsg.includes(templateWithoutName))
  );
};

module.exports = {
  normalizeText,
  normalizeMessageForComparison,
  hasMessageBeenSent
};
