const test = require('node:test');
const assert = require('node:assert/strict');
const { formatAiReplyLocalTime } = require('../src/misc/ai-reply-current-time');

test('formatAiReplyLocalTime formats browser-local date context', () => {
  const localDate = new Date(2026, 4, 21, 22, 7);
  const formatted = formatAiReplyLocalTime(localDate, 'America/Sao_Paulo');

  assert.equal(formatted, 'Thursday, 2026-05-21, 22:07, America/Sao_Paulo');
});

test('formatAiReplyLocalTime tolerates invalid dates', () => {
  const formatted = formatAiReplyLocalTime(new Date('invalid'), 'browser local time');

  assert.equal(formatted.includes('browser local time'), true);
});
