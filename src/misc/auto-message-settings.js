const AUTO_MESSAGE_SETTING_KEYS = {
  maxChecksPerRun: 'autoMessageMaxChecksPerRun',
  maxSendsPerDay: 'autoMessageMaxSendsPerDay',
  maxSendsPerRun: 'autoMessageMaxSendsPerRun',
  sendDelaySeconds: 'autoMessageSendDelaySeconds'
};

const DEFAULT_AUTO_MESSAGE_MAX_CHECKS_PER_RUN = 30;
const DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_DAY = 20;
const DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_RUN = 5;
const DEFAULT_AUTO_MESSAGE_SEND_DELAY_SECONDS = 90;

const MIN_AUTO_MESSAGE_MAX_CHECKS_PER_RUN = 1;
const MAX_AUTO_MESSAGE_MAX_CHECKS_PER_RUN = 500;
const MIN_AUTO_MESSAGE_MAX_SENDS_PER_DAY = 1;
const MAX_AUTO_MESSAGE_MAX_SENDS_PER_DAY = 300;
const MIN_AUTO_MESSAGE_MAX_SENDS_PER_RUN = 1;
const MAX_AUTO_MESSAGE_MAX_SENDS_PER_RUN = 100;
const MIN_AUTO_MESSAGE_SEND_DELAY_SECONDS = 10;
const MAX_AUTO_MESSAGE_SEND_DELAY_SECONDS = 3600;

const normalizeBoundedInteger = ({ value, defaultValue, min, max }) => {
  const parsedValue = parseInt(value, 10);
  const safeValue = Number.isFinite(parsedValue) ? parsedValue : defaultValue;
  return Math.min(max, Math.max(min, safeValue));
};

const normalizeAutoMessageMaxChecksPerRun = (
  value,
  defaultValue = DEFAULT_AUTO_MESSAGE_MAX_CHECKS_PER_RUN
) =>
  normalizeBoundedInteger({
    value,
    defaultValue,
    min: MIN_AUTO_MESSAGE_MAX_CHECKS_PER_RUN,
    max: MAX_AUTO_MESSAGE_MAX_CHECKS_PER_RUN
  });

const normalizeAutoMessageMaxSendsPerDay = (
  value,
  defaultValue = DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_DAY
) =>
  normalizeBoundedInteger({
    value,
    defaultValue,
    min: MIN_AUTO_MESSAGE_MAX_SENDS_PER_DAY,
    max: MAX_AUTO_MESSAGE_MAX_SENDS_PER_DAY
  });

const normalizeAutoMessageMaxSendsPerRun = (
  value,
  defaultValue = DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_RUN
) =>
  normalizeBoundedInteger({
    value,
    defaultValue,
    min: MIN_AUTO_MESSAGE_MAX_SENDS_PER_RUN,
    max: MAX_AUTO_MESSAGE_MAX_SENDS_PER_RUN
  });

const normalizeAutoMessageSendDelaySeconds = (
  value,
  defaultValue = DEFAULT_AUTO_MESSAGE_SEND_DELAY_SECONDS
) =>
  normalizeBoundedInteger({
    value,
    defaultValue,
    min: MIN_AUTO_MESSAGE_SEND_DELAY_SECONDS,
    max: MAX_AUTO_MESSAGE_SEND_DELAY_SECONDS
  });

const readSettingValue = (readSetting, key, defaultValue) =>
  typeof readSetting === 'function' ? readSetting(key, defaultValue) : defaultValue;

const readAutoMessageSettings = (readSetting) => ({
  maxChecksPerRun: normalizeAutoMessageMaxChecksPerRun(
    readSettingValue(
      readSetting,
      AUTO_MESSAGE_SETTING_KEYS.maxChecksPerRun,
      DEFAULT_AUTO_MESSAGE_MAX_CHECKS_PER_RUN
    )
  ),
  maxSendsPerDay: normalizeAutoMessageMaxSendsPerDay(
    readSettingValue(
      readSetting,
      AUTO_MESSAGE_SETTING_KEYS.maxSendsPerDay,
      DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_DAY
    )
  ),
  maxSendsPerRun: normalizeAutoMessageMaxSendsPerRun(
    readSettingValue(
      readSetting,
      AUTO_MESSAGE_SETTING_KEYS.maxSendsPerRun,
      DEFAULT_AUTO_MESSAGE_MAX_SENDS_PER_RUN
    )
  ),
  sendDelaySeconds: normalizeAutoMessageSendDelaySeconds(
    readSettingValue(
      readSetting,
      AUTO_MESSAGE_SETTING_KEYS.sendDelaySeconds,
      DEFAULT_AUTO_MESSAGE_SEND_DELAY_SECONDS
    )
  )
});

module.exports = {
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
};
