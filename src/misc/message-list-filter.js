const HIDDEN_UNANSWERED_ATTR = 'data-tinder-autopilot-hidden-unanswered';
const PREVIOUS_DISPLAY_ATTR = 'data-tinder-autopilot-previous-display';

const MESSAGE_ITEM_SELECTORS = [
  '.messageList .messageListItem',
  'a.messageListItem[href*="/app/messages/"]',
  '.messageListItem',
  '[data-testid="message-item"]',
  '.message-item',
  '.chat-message'
];

const MESSAGE_LIST_SELECTORS = ['.messageList', '[data-testid="message-list"]', '.message-list'];

const normalizeText = (value) =>
  String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getElements = (root, selector) => {
  try {
    return Array.from(root?.querySelectorAll?.(selector) || []);
  } catch {
    return [];
  }
};

const uniqueElements = (elements) => Array.from(new Set(elements.filter(Boolean)));

const getFirstElement = (root, selectors) => {
  for (const selector of selectors) {
    const element = getElements(root, selector)[0];
    if (element) return element;
  }
  return null;
};

const getMessageListItems = (root = document) =>
  uniqueElements(MESSAGE_ITEM_SELECTORS.flatMap((selector) => getElements(root, selector)));

const isOutgoingLastMessage = (messageItem) => {
  const text = normalizeText(messageItem?.textContent);
  return /(?:^|\s)Your last message was\s*:/i.test(text);
};

const shouldShowUnansweredMessageItem = (messageItem) => !isOutgoingLastMessage(messageItem);

const setPreviousDisplay = (messageItem) => {
  if (messageItem.getAttribute?.(PREVIOUS_DISPLAY_ATTR) !== null) return;
  messageItem.setAttribute?.(PREVIOUS_DISPLAY_ATTR, messageItem.style?.display || '');
};

const restoreMessageItem = (messageItem) => {
  if (messageItem.getAttribute?.(HIDDEN_UNANSWERED_ATTR) === null) return;

  const previousDisplay = messageItem.getAttribute?.(PREVIOUS_DISPLAY_ATTR) || '';
  if (messageItem.style) messageItem.style.display = previousDisplay;
  messageItem.removeAttribute?.(HIDDEN_UNANSWERED_ATTR);
  messageItem.removeAttribute?.(PREVIOUS_DISPLAY_ATTR);
};

const hideMessageItem = (messageItem) => {
  setPreviousDisplay(messageItem);
  messageItem.setAttribute?.(HIDDEN_UNANSWERED_ATTR, 'true');
  if (messageItem.style) messageItem.style.display = 'none';
};

const applyUnansweredMessagesFilter = (root = document) => {
  const messageItems = getMessageListItems(root);
  let visible = 0;

  messageItems.forEach((messageItem) => {
    if (shouldShowUnansweredMessageItem(messageItem)) {
      restoreMessageItem(messageItem);
      visible += 1;
      return;
    }

    hideMessageItem(messageItem);
  });

  return {
    total: messageItems.length,
    visible,
    hidden: messageItems.length - visible
  };
};

const clearUnansweredMessagesFilter = (root = document) => {
  const messageItems = getMessageListItems(root);
  messageItems.forEach(restoreMessageItem);
  return messageItems.length;
};

const findMessagesTab = (root = document) => {
  const candidates = getElements(root, '[role="tab"],button,a');
  return candidates.find((candidate) => {
    const text = normalizeText(candidate.textContent).toLowerCase();
    const href = candidate.getAttribute?.('href') || '';
    return text === 'messages' || href === '/app/messages';
  });
};

const getMessageListElement = (root = document) => getFirstElement(root, MESSAGE_LIST_SELECTORS);

const findMessageScrollContainer = (root = document) => {
  const messageList = getMessageListElement(root);
  return (
    messageList?.closest?.('[role="tabpanel"]') ||
    getElements(root, '[role="tabpanel"][aria-hidden="false"]')[0] ||
    messageList?.parentElement ||
    getElements(root, '.messages-container')[0] ||
    null
  );
};

const scrollMessageListToTop = (root = document) => {
  const scrollContainer = findMessageScrollContainer(root);
  if (scrollContainer) scrollContainer.scrollTop = 0;
  return Boolean(scrollContainer);
};

module.exports = {
  applyUnansweredMessagesFilter,
  clearUnansweredMessagesFilter,
  findMessageScrollContainer,
  findMessagesTab,
  getMessageListItems,
  isOutgoingLastMessage,
  scrollMessageListToTop,
  shouldShowUnansweredMessageItem
};
