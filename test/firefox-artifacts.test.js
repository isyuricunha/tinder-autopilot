const assert = require('node:assert/strict');
const test = require('node:test');
const { isFirefoxArtifact } = require('../scripts/firefox-artifacts');

test('Firefox artifact matcher only accepts generated Firefox ZIPs', () => {
  assert.equal(isFirefoxArtifact('tinder-autopilot-firefox-v3.0.0.zip'), true);
  assert.equal(isFirefoxArtifact('tinder-autopilot-firefox-source-v3.0.0.zip'), true);
  assert.equal(isFirefoxArtifact('tinder-autopilot-v3.0.0.zip'), false);
  assert.equal(isFirefoxArtifact('tinder-autopilot-firefox-v3.0.0.xpi'), false);
});
