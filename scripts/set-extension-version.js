const fs = require('node:fs');
const path = require('node:path');

const manifestPaths = [
  'chrome/manifest.json',
  'chrome/manifest.firefox.json',
  'chrome/manifest.v3.json'
];

const extensionVersionPattern = /^\d+(?:\.\d+){0,3}$/;

const version = process.argv[2];

if (!version || !extensionVersionPattern.test(version)) {
  console.error('Usage: node scripts/set-extension-version.js <extension-version>');
  console.error('Extension versions must be 1 to 4 dot-separated numeric parts.');
  process.exit(1);
}

for (const manifestPath of manifestPaths) {
  const absolutePath = path.resolve(__dirname, '..', manifestPath);
  const manifest = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  manifest.version = version;
  fs.writeFileSync(absolutePath, `${JSON.stringify(manifest, null, 2)}\n`);
}
