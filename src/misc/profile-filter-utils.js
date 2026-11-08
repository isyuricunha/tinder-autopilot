const PROFILE_LIMIT_DEFAULTS = Object.freeze({
  minAge: 18,
  maxAge: 35,
  maxDistance: 50,
  minPhotoCount: 3
});

const normalizeBioFilterText = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/\p{M}/gu, '')
  .replace(/\s+/g, ' ')
  .trim();

const parseFilterList = (storedValue) =>
  String(storedValue || '')
    .toLowerCase()
    .split(/[,\n]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

const normalizeFilterText = (value) =>
  normalizeBioFilterText(value)
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
  const canonicalize = (value) => normalizeFilterText(value)
    .replace(/\b(?:homem|male)\b/g, 'man')
    .replace(/\b(?:mulher|female)\b/g, 'woman')
    .replace(/\b(man|woman) trans\b/g, 'trans $1')
    .replace(/\bnao binari[oa]\b/g, 'non binary');
  return filters.some((filterGender) => hasWholeFilterTerm(
    canonicalize(genderIdentity), canonicalize(filterGender)
  ));
};

const isAgeOutsideRange = (age, ageRange) => {
  if (!age || !ageRange) return false;
  return age < Math.min(ageRange.min, ageRange.max) || age > Math.max(ageRange.min, ageRange.max);
};

const distanceInKilometers = (distance) => {
  if (!Number.isFinite(distance?.value)) return null;
  return /^(?:mi|miles?|milhas?)$/i.test(distance.unit)
    ? distance.value * 1.609344
    : distance.value;
};

const isDistanceOverMax = (distance, maxDistance) => {
  const kilometers = distanceInKilometers(distance);
  return kilometers !== null && kilometers > maxDistance;
};

const isPhotoCountBelowMinimum = (photoCount, minPhotoCount) =>
  Number.isFinite(photoCount) && photoCount < minPhotoCount;

const getAdvancedProfileRejectionReason = ({
  age,
  distance,
  photoCount,
  ageRange,
  maxDistance,
  minPhotoCount
} = {}) => {
  if (isAgeOutsideRange(age, ageRange)) return 'Age is outside the configured range';
  if (isDistanceOverMax(distance, maxDistance)) return 'Distance exceeds the configured limit';
  if (isPhotoCountBelowMinimum(photoCount, minPhotoCount)) return 'Too few profile photos';
  return '';
};

module.exports = {
  PROFILE_LIMIT_DEFAULTS,
  distanceInKilometers,
  normalizeBioFilterText,
  isGenderBlocked,
  parseFilterList,
  isAgeOutsideRange,
  isDistanceOverMax,
  isPhotoCountBelowMinimum,
  getAdvancedProfileRejectionReason
};
