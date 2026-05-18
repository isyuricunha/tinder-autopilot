const { onToggle, offToggle, onToggleInner, offToggleInner } = require('./toggle-styles');

const getToggleElements = (selector) => {
  const root = document.querySelector(selector);
  const input = root?.querySelector('.toggleSwitch input');
  const toggleElement = root?.querySelector('.toggleSwitch > div');
  const innerElement = root?.querySelector('.toggleSwitch > div > div');

  return {
    root,
    input,
    toggleElement,
    innerElement
  };
};

const setToggleState = (selector, isEnabled) => {
  const { root, input, toggleElement, innerElement } = getToggleElements(selector);
  if (!root || !toggleElement || !innerElement) return false;

  root.dataset.enabled = String(Boolean(isEnabled));
  root.setAttribute('aria-pressed', String(Boolean(isEnabled)));
  if (input) input.checked = Boolean(isEnabled);
  toggleElement.style.cssText = isEnabled ? onToggle : offToggle;
  innerElement.style.cssText = isEnabled ? onToggleInner : offToggleInner;
  return true;
};

const getCheckboxValue = (selector) => {
  const { root, input } = getToggleElements(selector);
  if (!root) return false;
  if (input) return Boolean(input.checked);
  return root.dataset.enabled === 'true' || root.getAttribute('aria-pressed') === 'true';
};

const toggleCheckbox = (selector) => {
  const nextState = !getCheckboxValue(selector);
  setToggleState(selector, nextState);
  return nextState;
};

module.exports = {
  getToggleElements,
  setToggleState,
  getCheckboxValue,
  toggleCheckbox
};
