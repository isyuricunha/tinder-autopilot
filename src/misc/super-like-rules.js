const shouldUseSuperLike = ({
  isEnabled = false,
  canSuperLike = false,
  strategy = 'random',
  isVerified = false,
  photoCount = 0,
  distance = null,
  randomValue = Math.random()
} = {}) => {
  if (!isEnabled || !canSuperLike) return false;

  switch (strategy) {
    case 'random':
      return randomValue < 0.1;
    case 'verified':
      return Boolean(isVerified);
    case 'photos':
      return photoCount >= 5;
    case 'distance':
      return Boolean(distance && distance.value <= 10);
    default:
      return false;
  }
};

module.exports = { shouldUseSuperLike };
