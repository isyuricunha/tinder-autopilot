const test = require('node:test');
const assert = require('node:assert/strict');
const {
  applyUnansweredMessagesFilter,
  clearUnansweredMessagesFilter,
  getMessageListItems,
  isOutgoingLastMessage,
  shouldShowUnansweredMessageItem
} = require('../src/misc/message-list-filter');

class FakeMessageItem {
  constructor(textContent, display = '') {
    this.textContent = textContent;
    this.style = { display };
    this.attributes = new Map();
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
}

const createRoot = (items) => ({
  querySelectorAll(selector) {
    const messageItemSelectors = [
      '.messageList .messageListItem',
      'a.messageListItem[href*="/app/messages/"]',
      '.messageListItem'
    ];

    return messageItemSelectors.includes(selector) ? items : [];
  }
});

test('isOutgoingLastMessage detects conversations where our last message is latest', () => {
  const outgoing = new FakeMessageItem('Your last message was: Hello');
  const incoming = new FakeMessageItem('Helena Santos’s last message was: Oii');

  assert.equal(isOutgoingLastMessage(outgoing), true);
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
