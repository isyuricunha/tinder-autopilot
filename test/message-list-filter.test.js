const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  applyUnansweredMessagesFilter,
  clearUnansweredMessagesFilter,
  getMessageItemVisibilityTarget,
  getMessageListItems,
  getScrollMetrics,
  isOutgoingLastMessage,
  scrollMessageListToEnd,
  shouldShowUnansweredMessageItem
} = require('../src/misc/message-list-filter');

class FakeMessageItem {
  constructor(textContent, display = '', wrapper = null) {
    this.textContent = textContent;
    this.style = { display };
    this.attributes = new Map();
    this.wrapper = wrapper;
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  closest(selector) {
    if (selector === 'li') return this.wrapper;
    return null;
  }
}

class FakeScrollElement {
  constructor({ clientHeight = 100, scrollHeight = 500, scrollTop = 0 } = {}) {
    this.clientHeight = clientHeight;
    this.scrollHeight = scrollHeight;
    this.scrollTop = scrollTop;
    this.parentElement = null;
    this.events = [];
  }

  closest() {
    return null;
  }

  dispatchEvent(event) {
    this.events.push(event.type);
  }

  scrollTo({ top }) {
    this.scrollTop = top;
  }
}

const createRoot = (items, messageList = null) => ({
  querySelectorAll(selector) {
    const messageItemSelectors = [
      '.messageList .messageListItem',
      'a.messageListItem[href*="/app/messages/"]',
      '.messageListItem'
    ];

    if (selector === '.messageList' && messageList) return [messageList];
    return messageItemSelectors.includes(selector) ? items : [];
  }
});

test('isOutgoingLastMessage detects conversations where our last message is latest', () => {
  const outgoing = new FakeMessageItem('Your last message was: Hello');
  const outgoingWithoutSpace = new FakeMessageItem('Visible preview.Your last message was: Hello');
  const incoming = new FakeMessageItem('Helena Santos’s last message was: Oii');

  assert.equal(isOutgoingLastMessage(outgoing), true);
  assert.equal(isOutgoingLastMessage(outgoingWithoutSpace), true);
  assert.equal(shouldShowUnansweredMessageItem(outgoing), false);
  assert.equal(isOutgoingLastMessage(incoming), false);
  assert.equal(shouldShowUnansweredMessageItem(incoming), true);
});

test('applyUnansweredMessagesFilter hides only conversations waiting on the match', () => {
  const incoming = new FakeMessageItem('Helena Santos’s last message was: Oii', 'flex');
  const outgoing = new FakeMessageItem('Your last message was: Hello', 'flex');
  const unknown = new FakeMessageItem('No hidden last-message label yet', 'flex');
  const root = createRoot([incoming, outgoing, unknown]);

  const result = applyUnansweredMessagesFilter(root);

  assert.deepEqual(result, { total: 3, visible: 2, hidden: 1 });
  assert.equal(incoming.style.display, 'flex');
  assert.equal(outgoing.style.display, 'none');
  assert.equal(unknown.style.display, 'flex');

  clearUnansweredMessagesFilter(root);

  assert.equal(outgoing.style.display, 'flex');
  assert.equal(outgoing.getAttribute('data-tinder-autopilot-hidden-unanswered'), null);
});

test('applyUnansweredMessagesFilter restores items when their last message changes', () => {
  const item = new FakeMessageItem('Your last message was: Hello', 'flex');
  const root = createRoot([item]);

  applyUnansweredMessagesFilter(root);
  assert.equal(item.style.display, 'none');

  item.textContent = 'Helena Santos’s last message was: Oii';
  const result = applyUnansweredMessagesFilter(root);

  assert.deepEqual(result, { total: 1, visible: 1, hidden: 0 });
  assert.equal(item.style.display, 'flex');
  assert.equal(item.getAttribute('data-tinder-autopilot-hidden-unanswered'), null);
});

test('getMessageListItems deduplicates selector overlap', () => {
  const item = new FakeMessageItem('Helena Santos’s last message was: Oii');
  const root = createRoot([item]);

  assert.deepEqual(getMessageListItems(root), [item]);
});

test('scrollMessageListToEnd scrolls the real message list container to bottom', () => {
  const messageList = new FakeScrollElement({
    clientHeight: 200,
    scrollHeight: 1200,
    scrollTop: 0
  });
  const root = createRoot([], messageList);

  assert.deepEqual(getScrollMetrics(messageList), {
    clientHeight: 200,
    isAtBottom: false,
    scrollHeight: 1200,
    scrollTop: 0
  });
  assert.equal(scrollMessageListToEnd(root), true);
  assert.equal(messageList.scrollTop, 1200);
  assert.deepEqual(getScrollMetrics(messageList).isAtBottom, true);
});

test('applyUnansweredMessagesFilter hides the message row wrapper when present', () => {
  const wrapper = new FakeMessageItem('', 'list-item');
  const outgoing = new FakeMessageItem('Your last message was: Hello', 'flex', wrapper);
  const root = createRoot([outgoing]);

  assert.equal(getMessageItemVisibilityTarget(outgoing), wrapper);

  applyUnansweredMessagesFilter(root);
  assert.equal(wrapper.style.display, 'none');
  assert.equal(outgoing.style.display, 'flex');

  clearUnansweredMessagesFilter(root);
  assert.equal(wrapper.style.display, 'list-item');
});

test('applyUnansweredMessagesFilter classifies the real Tinder messages sidebar snapshot', () => {
  const html = fs.readFileSync(
    path.join(__dirname, '..', 'tinder-html', 'tinder-messages-sidebar.html'),
    'utf8'
  );
  const items = Array.from(
    html.matchAll(/<a\b[^>]*class="[^"]*\bmessageListItem\b[^"]*"[\s\S]*?<\/a>/gi)
  ).map((match) => {
    const textContent = match[0]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return new FakeMessageItem(textContent, 'flex');
  });
  const root = createRoot(items);

  const result = applyUnansweredMessagesFilter(root);

  assert.equal(result.total, 64);
  assert.equal(result.hidden, 13);
  assert.equal(result.visible, 51);
});
