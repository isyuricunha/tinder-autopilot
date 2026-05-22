const KEYBOARD_SHORTCUT_EVENT_TYPES = ['keydown', 'keyup'];

const getKeyboardShortcutTarget = ({
  activeElement,
  body,
  documentElement,
  documentNode
}) => activeElement || body || documentElement || documentNode || null;

const buildKeyboardShortcutEventInit = ({ key, keyCode, view }) => ({
  key,
  code: key,
  keyCode,
  which: keyCode,
  bubbles: true,
  cancelable: true,
  view
});

module.exports = {
  KEYBOARD_SHORTCUT_EVENT_TYPES,
  buildKeyboardShortcutEventInit,
  getKeyboardShortcutTarget
};
