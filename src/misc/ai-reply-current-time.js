const WEEKDAY_NAMES = Object.freeze([
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]);

const padNumber = (value) => String(value).padStart(2, '0');

const getBrowserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'browser local time';
  } catch {
    return 'browser local time';
  }
};

const formatAiReplyLocalTime = (date = new Date(), timeZone = getBrowserTimeZone()) => {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const year = safeDate.getFullYear();
  const month = padNumber(safeDate.getMonth() + 1);
  const day = padNumber(safeDate.getDate());
  const hours = padNumber(safeDate.getHours());
  const minutes = padNumber(safeDate.getMinutes());
  const weekday = WEEKDAY_NAMES[safeDate.getDay()] || 'Unknown day';

  return `${weekday}, ${year}-${month}-${day}, ${hours}:${minutes}, ${timeZone}`;
};

module.exports = {
  formatAiReplyLocalTime,
  getBrowserTimeZone
};
