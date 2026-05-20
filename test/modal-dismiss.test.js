const test = require('node:test');
const assert = require('node:assert/strict');
const {
  clickDialogDismissControl,
  findDialogDismissControl,
  isDismissControl
} = require('../src/misc/modal-dismiss');

class FakeButton {
  constructor(textContent, attributes = {}) {
    this.textContent = textContent;
    this.attributes = attributes;
    this.offsetParent = {};
    this.disabled = false;
    this.clickCount = 0;
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  click() {
    this.clickCount += 1;
  }
}

class FakeDialog {
  constructor(buttons) {
    this.buttons = buttons;
  }

  querySelectorAll(selector) {
    return selector === 'button, [role="button"]' ? this.buttons : [];
  }
}

test('findDialogDismissControl prefers No Thanks over Super Like action', () => {
  const superLikeButton = new FakeButton('Send Super Like');
  const noThanksButton = new FakeButton('No Thanks');
  const dialog = new FakeDialog([superLikeButton, noThanksButton]);

  assert.equal(findDialogDismissControl(dialog), noThanksButton);

  assert.equal(clickDialogDismissControl(dialog), true);
  assert.equal(superLikeButton.clickCount, 0);
  assert.equal(noThanksButton.clickCount, 1);
});

test('isDismissControl accepts common dismiss labels and close metadata', () => {
  assert.equal(isDismissControl(new FakeButton('Maybe Later')), true);
  assert.equal(isDismissControl(new FakeButton('', { 'aria-label': 'Close' })), true);
  assert.equal(isDismissControl(new FakeButton('Send Super Like')), false);
});

test('clickDialogDismissControl returns false when no dismiss control exists', () => {
  const dialog = new FakeDialog([new FakeButton('Send Super Like')]);

  assert.equal(clickDialogDismissControl(dialog), false);
});
