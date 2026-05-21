const parseFilterList = (storedValue) =>
  String(storedValue || '')
    .toLowerCase()
    .split(',')
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

const normalizeFilterText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hasWholeFilterTerm = (value, filterTerm) => {
  const normalizedValue = normalizeFilterText(value);
  const normalizedFilter = normalizeFilterText(filterTerm);
  if (!normalizedValue || !normalizedFilter) return false;

  return new RegExp(`(^|\\W)${escapeRegExp(normalizedFilter)}(?=$|\\W)`).test(
    normalizedValue
  );
};

const isGenderBlocked = (genderIdentity, genderFilter = []) => {
  const filters = Array.isArray(genderFilter) ? genderFilter : parseFilterList(genderFilter);
  return filters.some((filterGender) => hasWholeFilterTerm(genderIdentity, filterGender));
};

const isAgeOutsideRange = (age, ageRange) => {
  if (!age || !ageRange) return false;
  return age < ageRange.min || age > ageRange.max;
};

const isDistanceOverMax = (distance, maxDistance) => {
  if (!distance) return false;
  return distance.value > maxDistance;
};

const isPhotoCountBelowMinimum = (photoCount, minPhotoCount) => photoCount < minPhotoCount;

const shouldSkipAdvancedProfile = ({
  age,
  distance,
  photoCount,
  ageRange,
  maxDistance,
  minPhotoCount
} = {}) =>
  isAgeOutsideRange(age, ageRange) ||
  isDistanceOverMax(distance, maxDistance) ||
  isPhotoCountBelowMinimum(photoCount, minPhotoCount);

module.exports = {
  isGenderBlocked,
  parseFilterList,
  isAgeOutsideRange,
  isDistanceOverMax,
  isPhotoCountBelowMinimum,
  shouldSkipAdvancedProfile
};
