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
  return /\bYour\s+last\s+message\s+was\s*:/i.test(text);
};

const shouldShowUnansweredMessageItem = (messageItem) => !isOutgoingLastMessage(messageItem);

const getMessageItemVisibilityTarget = (messageItem) =>
  messageItem?.closest?.('li') || messageItem;

const setPreviousDisplay = (messageItem) => {
  if (!messageItem) return;
  if (messageItem.getAttribute?.(PREVIOUS_DISPLAY_ATTR) !== null) return;
  messageItem.setAttribute?.(PREVIOUS_DISPLAY_ATTR, messageItem.style?.display || '');
};

const restoreMessageItem = (messageItem) => {
  const visibilityTarget = getMessageItemVisibilityTarget(messageItem);
  if (!visibilityTarget) return;
  if (visibilityTarget.getAttribute?.(HIDDEN_UNANSWERED_ATTR) === null) return;

  const previousDisplay = visibilityTarget.getAttribute?.(PREVIOUS_DISPLAY_ATTR) || '';
  if (visibilityTarget.style) visibilityTarget.style.display = previousDisplay;
  visibilityTarget.removeAttribute?.(HIDDEN_UNANSWERED_ATTR);
  visibilityTarget.removeAttribute?.(PREVIOUS_DISPLAY_ATTR);
};

const hideMessageItem = (messageItem) => {
  const visibilityTarget = getMessageItemVisibilityTarget(messageItem);
  if (!visibilityTarget) return;
  setPreviousDisplay(visibilityTarget);
  visibilityTarget.setAttribute?.(HIDDEN_UNANSWERED_ATTR, 'true');
  if (visibilityTarget.style) visibilityTarget.style.display = 'none';
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

const findScrollableAncestor = (element) => {
  let current = element;
  while (current) {
    if (Number(current.scrollHeight || 0) > Number(current.clientHeight || 0)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
};

const getScrollMetrics = (element) => {
  const scrollTop = Number(element?.scrollTop || 0);
  const clientHeight = Number(element?.clientHeight || 0);
  const scrollHeight = Number(element?.scrollHeight || 0);

  return {
    clientHeight,
    isAtBottom: scrollTop + clientHeight >= scrollHeight - 4,
    scrollHeight,
    scrollTop
  };
};

const dispatchScrollEvents = (element) => {
  if (!element?.dispatchEvent) return;
  if (typeof Event === 'function') {
    element.dispatchEvent(new Event('scroll', { bubbles: true }));
  }
  if (typeof WheelEvent === 'function') {
    element.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 1200 }));
  }
};

const scrollMessageListToEnd = (root = document) => {
  const scrollContainer = findMessageScrollContainer(root);
  if (!scrollContainer) return false;

  const { scrollHeight } = getScrollMetrics(scrollContainer);
  if (typeof scrollContainer.scrollTo === 'function') {
    scrollContainer.scrollTo({ top: scrollHeight, behavior: 'auto' });
  } else {
    scrollContainer.scrollTop = scrollHeight;
  }
  dispatchScrollEvents(scrollContainer);
  return true;
};

const findMessageScrollContainer = (root = document) => {
  const messageList = getMessageListElement(root);
  return (
    findScrollableAncestor(messageList) ||
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
  getScrollMetrics,
  getMessageListItems,
  getMessageItemVisibilityTarget,
  isOutgoingLastMessage,
  scrollMessageListToEnd,
  scrollMessageListToTop,
  shouldShowUnansweredMessageItem
};
