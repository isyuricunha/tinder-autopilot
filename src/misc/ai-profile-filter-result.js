const AI_PROFILE_FILTER_NEUTRAL = 'neutral';

const stripHtml = (value = '') =>
  String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const limitText = (value, maxLength = 220) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
};

const extractHtmlTitle = (body = '') => {
  const match = String(body || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripHtml(match[1]) : '';
};

const summarizeAiProfileFilterHttpError = ({ status, body = '' } = {}) => {
  const title = extractHtmlTitle(body);
  const bodyText = stripHtml(body);
  const detail = title || bodyText || 'empty error body';
  return `${status || 'unknown'} ${limitText(detail)}`;
};

const createAiProfileFilterFailure = (reason) => ({
  isFailure: true,
  reason: String(reason || 'AI filter failed'),
  shouldSwipe: AI_PROFILE_FILTER_NEUTRAL
});

const isAiProfileFilterFailure = (result) =>
  Boolean(result && result.shouldSwipe === AI_PROFILE_FILTER_NEUTRAL && result.isFailure === true);

module.exports = {
  AI_PROFILE_FILTER_NEUTRAL,
  createAiProfileFilterFailure,
  isAiProfileFilterFailure,
  summarizeAiProfileFilterHttpError
};
