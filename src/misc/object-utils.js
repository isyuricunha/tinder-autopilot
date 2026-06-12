const toPathSegments = (path) => {
  if (Array.isArray(path)) return path;
  return String(path || '')
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
};

const get = (source, path, defaultValue = undefined) => {
  const value = toPathSegments(path).reduce((current, segment) => {
    if (current === null || current === undefined) return undefined;
    return current[segment];
  }, source);

  return value === undefined ? defaultValue : value;
};

const keyBy = (items = [], key) =>
  items.reduce((accumulator, item) => {
    const itemKey = get(item, key);
    if (itemKey !== undefined) {
      accumulator[itemKey] = item;
    }
    return accumulator;
  }, {});

module.exports = { get, keyBy, toPathSegments };
