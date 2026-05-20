const normalizeAiApiKeyInput = (value) => String(value || '').trim();

const shouldSaveAiApiKeyInput = (value) => normalizeAiApiKeyInput(value).length > 0;

module.exports = {
  normalizeAiApiKeyInput,
  shouldSaveAiApiKeyInput
};
