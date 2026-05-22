const normalizeProfileId = (profileId) => String(profileId || '');

const hasProfileAdvanced = ({ beforeProfileId, afterProfileId, hasProfile }) => {
  if (!hasProfile) return true;

  const before = normalizeProfileId(beforeProfileId);
  const after = normalizeProfileId(afterProfileId);
  return Boolean(before && after && before !== after);
};

const canRetrySwipeActionForProfile = ({ targetProfileId, currentProfileId, hasProfile }) => {
  if (!hasProfile) return false;

  const target = normalizeProfileId(targetProfileId);
  const current = normalizeProfileId(currentProfileId);
  return Boolean(target && current && target === current);
};

const getProfileActionFailureKey = (profileId) => normalizeProfileId(profileId) || 'unknown';

const incrementProfileActionFailure = (failures, profileId) => {
  const key = getProfileActionFailureKey(profileId);
  const nextCount = (failures[key] || 0) + 1;
  failures[key] = nextCount;
  return nextCount;
};

const clearProfileActionFailure = (failures, profileId) => {
  delete failures[getProfileActionFailureKey(profileId)];
};

const shouldStopAfterProfileActionFailures = (failureCount, maxFailures) =>
  failureCount >= maxFailures;

const canUseSwipeActionButton = ({ actionButton, hasBlockingDialog, hasProfile }) =>
  Boolean(actionButton && hasProfile && !hasBlockingDialog);

module.exports = {
  canRetrySwipeActionForProfile,
  canUseSwipeActionButton,
  clearProfileActionFailure,
  getProfileActionFailureKey,
  hasProfileAdvanced,
  incrementProfileActionFailure,
  shouldStopAfterProfileActionFailures
};
