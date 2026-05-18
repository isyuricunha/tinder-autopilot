const parseFilterList = (storedValue) =>
  String(storedValue || '')
    .toLowerCase()
    .split(',')
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

const isAgeOutsideRange = (age, ageRange) => {
  if (!age) return false;
  return age < ageRange.min || age > ageRange.max;
};

const isDistanceOverMax = (distance, maxDistance) => {
  if (!distance) return false;
  return distance.value > maxDistance;
};

const isPhotoCountBelowMinimum = (photoCount, minPhotoCount) => photoCount < minPhotoCount;

module.exports = {
  parseFilterList,
  isAgeOutsideRange,
  isDistanceOverMax,
  isPhotoCountBelowMinimum
};
