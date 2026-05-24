const PROFILE_CHECK_ACTIONS = Object.freeze({
  allow: 'allow',
  skip: 'skip',
  stop: 'stop'
});

const normalizeProfileCheckAction = (value) => {
  if (value === true || value === PROFILE_CHECK_ACTIONS.skip) return PROFILE_CHECK_ACTIONS.skip;
  if (value === PROFILE_CHECK_ACTIONS.stop) return PROFILE_CHECK_ACTIONS.stop;
  return PROFILE_CHECK_ACTIONS.allow;
};

const shouldSkipProfileCheckAction = (value) =>
  normalizeProfileCheckAction(value) === PROFILE_CHECK_ACTIONS.skip;

const shouldStopProfileCheckAction = (value) =>
  normalizeProfileCheckAction(value) === PROFILE_CHECK_ACTIONS.stop;

module.exports = {
  PROFILE_CHECK_ACTIONS,
  normalizeProfileCheckAction,
  shouldSkipProfileCheckAction,
  shouldStopProfileCheckAction
};
