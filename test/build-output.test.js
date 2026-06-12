const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const webpackConfigs = require('../webpack.config');
const packageJson = require('../package.json');

const repoRoot = path.resolve(__dirname, '..');

const readJson = (filePath) => JSON.parse(fs.readFileSync(path.join(repoRoot, filePath), 'utf8'));

const getConfig = (name) => {
  const config = webpackConfigs.find((candidate) => candidate.name === name);
  assert.ok(config, `Missing webpack config for ${name}`);
  return config;
};

const getCopyPatterns = (config) => config.plugins.flatMap((plugin) => plugin.patterns || []);

const getCopyPattern = (config, targetPath) => {
  const pattern = getCopyPatterns(config).find((candidate) => candidate.to === targetPath);
  assert.ok(pattern, `Missing copy pattern for ${targetPath}`);
  return pattern;
};

test('webpack build emits separate Chrome and Firefox extension folders', () => {
  assert.ok(Array.isArray(webpackConfigs));

  const chromeConfig = getConfig('chrome');
  const firefoxConfig = getConfig('firefox');

  assert.equal(chromeConfig.output.path, path.join(repoRoot, 'dist'));
  assert.equal(firefoxConfig.output.path, path.join(repoRoot, 'dist-firefox'));

  assert.equal(getCopyPattern(chromeConfig, 'manifest.json').from, 'chrome/manifest.json');
  assert.equal(getCopyPattern(firefoxConfig, 'manifest.json').from, 'chrome/manifest.firefox.json');

  for (const config of [chromeConfig, firefoxConfig]) {
    assert.equal(getCopyPattern(config, 'icons').from, 'chrome/icons');
    assert.equal(getCopyPattern(config, 'bg.js').from, 'src/misc/bg.js');
  }
});

test('Firefox manifest stays installable without Chrome-only update metadata', () => {
  const chromeManifest = readJson('chrome/manifest.json');
  const firefoxManifest = readJson('chrome/manifest.firefox.json');

  assert.equal(chromeManifest.version, packageJson.version);
  assert.equal(firefoxManifest.version, packageJson.version);
  assert.equal(firefoxManifest.manifest_version, 2);
  assert.deepEqual(firefoxManifest.background, {
    scripts: ['bg.js'],
    persistent: false
  });
  assert.equal(firefoxManifest.update_url, undefined);
  assert.equal(firefoxManifest.browser_specific_settings.gecko.id, '@tinder-autopilot.isyuricunha');
  assert.deepEqual(
    firefoxManifest.browser_specific_settings.gecko.data_collection_permissions.required,
    ['none']
  );
  assert.ok(
    firefoxManifest.browser_specific_settings.gecko.data_collection_permissions.optional.includes(
      'personalCommunications'
    )
  );
  assert.ok(firefoxManifest.permissions.includes('storage'));
  assert.ok(firefoxManifest.permissions.includes('https://api.gotinder.com/*'));
  assert.deepEqual(firefoxManifest.content_scripts, chromeManifest.content_scripts);
});
