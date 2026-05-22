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

test('getKeyboardShortcutTarget prefers the focused element and falls back safely', () => {
  const activeElement = { id: 'active' };
  const body = { id: 'body' };
  const documentElement = { id: 'html' };
  const documentNode = { id: 'document' };

  assert.equal(
    getKeyboardShortcutTarget({ activeElement, body, documentElement, documentNode }),
    activeElement
  );
  assert.equal(
    getKeyboardShortcutTarget({ activeElement: null, body, documentElement, documentNode }),
    body
  );
  assert.equal(
    getKeyboardShortcutTarget({
      activeElement: null,
      body: null,
      documentElement,
      documentNode
    }),
    documentElement
  );
  assert.equal(
    getKeyboardShortcutTarget({
      activeElement: null,
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
