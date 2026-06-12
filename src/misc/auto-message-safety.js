const SAFETY_STOP_STATUS_CODES = new Set([401, 403, 429]);

const SAFETY_STOP_PATTERNS = [
  /\b429\b/i,
  /\brate[_\s-]?limit(?:ed)?\b/i,
  /\btoo many requests\b/i,
  /\bcaptcha\b/i,
  /\bchallenge\b/i,
  /\bcheckpoint\b/i,
  /\bverification\b/i,
  /\bverify\b/i,
  /\bbot\b/i
];

const getErrorMessage = (error) =>
  [
    error?.message,
    error?.statusText,
    error?.responseBody,
    typeof error === 'string' ? error : ''
  ]
    .filter(Boolean)
    .join(' ');

const getErrorStatusCode = (error) => {
  const directStatus = parseInt(error?.statusCode || error?.status, 10);
  if (Number.isFinite(directStatus)) return directStatus;

  const statusMatch = getErrorMessage(error).match(/\bstatus\s+(\d{3})\b/i);
  return statusMatch ? parseInt(statusMatch[1], 10) : null;
};

const getAutoMessageSafetyStopReason = (error) => {
  const statusCode = getErrorStatusCode(error);
  if (SAFETY_STOP_STATUS_CODES.has(statusCode)) {
    if (statusCode === 429) return 'Tinder rate limit response';
    return 'Tinder authentication or safety challenge response';
  }

  const message = getErrorMessage(error);
  if (SAFETY_STOP_PATTERNS.some((pattern) => pattern.test(message))) {
    return 'Tinder safety verification or rate limit signal';
  }

  return '';
};

const shouldStopAutoMessageForError = (error) =>
  Boolean(getAutoMessageSafetyStopReason(error));

module.exports = {
  getAutoMessageSafetyStopReason,
  getErrorStatusCode,
  shouldStopAutoMessageForError
};
