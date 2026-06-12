const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const artifactDir = path.join(repoRoot, 'zips');
const firefoxArtifactPattern = /^tinder-autopilot-firefox(?:-source)?-v.+\.zip$/;

const isFirefoxArtifact = (filename) => firefoxArtifactPattern.test(filename);

const ensureArtifactDir = () => {
  fs.mkdirSync(artifactDir, { recursive: true });
};

const cleanFirefoxArtifacts = () => {
  ensureArtifactDir();

  for (const filename of fs.readdirSync(artifactDir)) {
    if (isFirefoxArtifact(filename)) {
      fs.rmSync(path.join(artifactDir, filename), { force: true });
    }
  }
};

module.exports = {
  artifactDir,
  cleanFirefoxArtifacts,
  isFirefoxArtifact
};
