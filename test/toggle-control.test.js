const test = require('node:test');
const assert = require('node:assert/strict');
const { getCheckboxValue, setToggleState, toggleCheckbox } = require('../src/views/toggle-control');

const createToggleFixture = ({ includeInput = true } = {}) => {
  const input = { checked: false };
  const toggleElement = { style: { cssText: '' } };
  const innerElement = { style: { cssText: '' } };
  const attributes = {};
  const root = {
    dataset: {},
    querySelector(selector) {
      const elements = {
        '.toggleSwitch input': includeInput ? input : null,
        '.toggleSwitch > div': toggleElement,
        '.toggleSwitch > div > div': innerElement
      };
      return elements[selector] || null;
    },
    setAttribute(name, value) {
      attributes[name] = value;
    },
    getAttribute(name) {
      return attributes[name];
    }
  };

  global.document = {
    querySelector(selector) {
      return selector === '.toggle' ? root : null;
    }
  };

  return { input, root };
};

test('toggle-control stores state in semantic attributes and input checked state', () => {
  const { input, root } = createToggleFixture();

  assert.equal(setToggleState('.toggle', true), true);
  assert.equal(input.checked, true);
  assert.equal(root.dataset.enabled, 'true');
  assert.equal(root.getAttribute('aria-pressed'), 'true');
  assert.equal(getCheckboxValue('.toggle'), true);
});

test('toggle-control toggles from current state', () => {
  createToggleFixture();

  assert.equal(toggleCheckbox('.toggle'), true);
  assert.equal(toggleCheckbox('.toggle'), false);
});

test('toggle-control supports button-only toggles without hidden inputs', () => {
  const { root } = createToggleFixture({ includeInput: false });

  assert.equal(setToggleState('.toggle', true), true);
  assert.equal(root.dataset.enabled, 'true');
  assert.equal(root.getAttribute('aria-pressed'), 'true');
  assert.equal(getCheckboxValue('.toggle'), true);
  assert.equal(toggleCheckbox('.toggle'), false);
});
