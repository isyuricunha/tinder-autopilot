const SWIPE_SURFACE_PATHS = ['/app/recs', '/app/matches', '/app/explore'];

const parsePathname = (value) => {
  try {
    return new URL(String(value || ''), 'https://tinder.com').pathname;
  } catch {
    return String(value || '');
  }
};

const getPathname = (locationValue) => {
  if (!locationValue) return '';
  if (typeof locationValue === 'string') {
    return parsePathname(locationValue);
  }
  return parsePathname(locationValue.pathname || locationValue.toString?.() || '');
};

const isSwipeSurfaceUrl = (locationValue) => {
  const pathname = getPathname(locationValue);
  return SWIPE_SURFACE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
};

module.exports = {
  getPathname,
  isSwipeSurfaceUrl
};
