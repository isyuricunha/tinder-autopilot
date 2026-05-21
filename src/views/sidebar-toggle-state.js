const EPHEMERAL_TOGGLE_SELECTORS = Object.freeze([
  '.tinderAutopilot',
  '.tinderAutopilotMessage',
  '.tinderAutopilotAIMessageReply',
  '.tinderAutopilotMessageNewOnly',
  '.tinderAutopilotHideMine'
]);

const isEphemeralToggle = (selector) => EPHEMERAL_TOGGLE_SELECTORS.includes(selector);

const shouldPersistToggleState = (selector) => !isEphemeralToggle(selector);

const shouldRestoreToggleState = shouldPersistToggleState;

module.exports = {
  EPHEMERAL_TOGGLE_SELECTORS,
  isEphemeralToggle,
  shouldPersistToggleState,
  shouldRestoreToggleState
};
