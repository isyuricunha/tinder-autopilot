const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AUTO_MESSAGE_SETTING_KEYS,
  DEFAULT_AUTO_MESSAGE_MAX_CHECKS_PER_RUN,
  DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_DAY,
  DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_RUN,
  DEFAULT_AUTO_MESSAGE_SEND_DELAY_SECONDS,
  MAX_AUTO_MESSAGE_MAX_CHECKS_PER_RUN,
  MAX_AUTO_MESSAGE_MAX_SENDS_PER_DAY,
  MAX_AUTO_MESSAGE_MAX_SENDS_PER_RUN,
  MAX_AUTO_MESSAGE_SEND_DELAY_SECONDS,
  MIN_AUTO_MESSAGE_MAX_CHECKS_PER_RUN,
  MIN_AUTO_MESSAGE_MAX_SENDS_PER_DAY,
  MIN_AUTO_MESSAGE_MAX_SENDS_PER_RUN,
  MIN_AUTO_MESSAGE_SEND_DELAY_SECONDS,
  normalizeAutoMessageMaxChecksPerRun,
  normalizeAutoMessageMaxSendsPerDay,
  normalizeAutoMessageMaxSendsPerRun,
  normalizeAutoMessageSendDelaySeconds,
  readAutoMessageSettings
} = require('../src/misc/auto-message-settings');

test('auto message settings expose conservative defaults', () => {
  assert.equal(DEFAULT_AUTO_MESSAGE_MAX_CHECKS_PER_RUN, 30);
  assert.equal(DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_DAY, 20);
  assert.equal(DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_RUN, 5);
  assert.equal(DEFAULT_AUTO_MESSAGE_SEND_DELAY_SECONDS, 90);
});

test('auto message settings clamp invalid and out-of-range values', () => {
  assert.equal(
    normalizeAutoMessageMaxChecksPerRun('abc'),
    DEFAULT_AUTO_MESSAGE_MAX_CHECKS_PER_RUN
  );
  assert.equal(normalizeAutoMessageMaxChecksPerRun(0), MIN_AUTO_MESSAGE_MAX_CHECKS_PER_RUN);
  assert.equal(normalizeAutoMessageMaxChecksPerRun(999), MAX_AUTO_MESSAGE_MAX_CHECKS_PER_RUN);
  assert.equal(normalizeAutoMessageMaxChecksPerRun(12), 12);

  assert.equal(normalizeAutoMessageMaxSendsPerDay('abc'), DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_DAY);
  assert.equal(normalizeAutoMessageMaxSendsPerDay(0), MIN_AUTO_MESSAGE_MAX_SENDS_PER_DAY);
  assert.equal(normalizeAutoMessageMaxSendsPerDay(999), MAX_AUTO_MESSAGE_MAX_SENDS_PER_DAY);
  assert.equal(normalizeAutoMessageMaxSendsPerDay(8), 8);

  assert.equal(normalizeAutoMessageMaxSendsPerRun('abc'), DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_RUN);
  assert.equal(normalizeAutoMessageMaxSendsPerRun(0), MIN_AUTO_MESSAGE_MAX_SENDS_PER_RUN);
  assert.equal(normalizeAutoMessageMaxSendsPerRun(999), MAX_AUTO_MESSAGE_MAX_SENDS_PER_RUN);
  assert.equal(normalizeAutoMessageMaxSendsPerRun(3), 3);

  assert.equal(
    normalizeAutoMessageSendDelaySeconds('abc'),
    DEFAULT_AUTO_MESSAGE_SEND_DELAY_SECONDS
  );
  assert.equal(normalizeAutoMessageSendDelaySeconds(0), MIN_AUTO_MESSAGE_SEND_DELAY_SECONDS);
  assert.equal(normalizeAutoMessageSendDelaySeconds(9999), MAX_AUTO_MESSAGE_SEND_DELAY_SECONDS);
  assert.equal(normalizeAutoMessageSendDelaySeconds(120), 120);
});

test('readAutoMessageSettings reads and normalizes stored values', () => {
  const settings = {
    [AUTO_MESSAGE_SETTING_KEYS.maxChecksPerRun]: '999',
    [AUTO_MESSAGE_SETTING_KEYS.maxSendsPerDay]: '999',
    [AUTO_MESSAGE_SETTING_KEYS.maxSendsPerRun]: '999',
    [AUTO_MESSAGE_SETTING_KEYS.sendDelaySeconds]: '9999'
  };

  assert.deepEqual(readAutoMessageSettings((key, fallback) => settings[key] ?? fallback), {
    maxChecksPerRun: MAX_AUTO_MESSAGE_MAX_CHECKS_PER_RUN,
    maxSendsPerDay: MAX_AUTO_MESSAGE_MAX_SENDS_PER_DAY,
    maxSendsPerRun: MAX_AUTO_MESSAGE_MAX_SENDS_PER_RUN,
    sendDelaySeconds: MAX_AUTO_MESSAGE_SEND_DELAY_SECONDS
  });
});

test('readAutoMessageSettings falls back to safe defaults', () => {
  assert.deepEqual(readAutoMessageSettings(), {
    maxChecksPerRun: DEFAULT_AUTO_MESSAGE_MAX_CHECKS_PER_RUN,
    maxSendsPerDay: DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_DAY,
    maxSendsPerRun: DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_RUN,
    sendDelaySeconds: DEFAULT_AUTO_MESSAGE_SEND_DELAY_SECONDS
  });
});
