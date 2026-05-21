const hasEnabledBioBlacklist = ({ isBioFilterEnabled = false, bioBlacklist = [] } = {}) =>
  Boolean(isBioFilterEnabled && Array.isArray(bioBlacklist) && bioBlacklist.length > 0);

const shouldRequireProfileModal = ({
  hasActiveBioFilter = false,
  isGenderFilterEnabled = false,
  isAdvancedFilterEnabled = false,
  isAIFilterEnabled = false
} = {}) =>
  Boolean(
    hasActiveBioFilter ||
      isGenderFilterEnabled ||
      isAdvancedFilterEnabled ||
      isAIFilterEnabled
  );

module.exports = {
  hasEnabledBioBlacklist,
  shouldRequireProfileModal
};
