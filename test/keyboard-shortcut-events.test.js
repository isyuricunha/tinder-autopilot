const test = require('node:test');
const assert = require('node:assert/strict');
const {
  KEYBOARD_SHORTCUT_EVENT_TYPES,
  buildKeyboardShortcutEventInit,
  getKeyboardShortcutTarget
} = require('../src/misc/keyboard-shortcut-events');

test('keyboard shortcut events use a single keydown and keyup sequence', () => {
  assert.deepEqual(KEYBOARD_SHORTCUT_EVENT_TYPES, ['keydown', 'keyup']);
});

test('Tinder shortcuts target the body even when an extension control has focus', () => {
  const activeElement = { id: 'active' };
  const body = { id: 'body' };
  const activeCard = { id: 'card' };
  const documentElement = { id: 'html' };
  const documentNode = { id: 'document' };

  assert.equal(
    getKeyboardShortcutTarget({ activeElement, body, activeCard, documentElement, documentNode }),
    body
  );
  assert.equal(
    getKeyboardShortcutTarget({ activeCard, documentElement, documentNode }),
    activeCard
  );
  assert.equal(
    getKeyboardShortcutTarget({
      body: null,
      documentElement,
      documentNode
    }),
    documentElement
  );
  assert.equal(
    getKeyboardShortcutTarget({
      body: null,
      documentElement: null,
      documentNode
    }),
    documentNode
  );
});

test('buildKeyboardShortcutEventInit creates bubbling cancelable shortcut metadata', () => {
  const view = {};

  assert.deepEqual(buildKeyboardShortcutEventInit({ key: 'ArrowLeft', keyCode: 37, view }), {
    key: 'ArrowLeft',
    code: 'ArrowLeft',
    keyCode: 37,
    which: 37,
    bubbles: true,
    cancelable: true,
    view
  });
});
