const { spawnSync } = require('node:child_process');
const path = require('node:path');
const packageJson = require('../package.json');
const { artifactDir, cleanFirefoxArtifacts } = require('./firefox-artifacts');

const repoRoot = path.resolve(__dirname, '..');
const version = packageJson.version;
const extensionZip = `tinder-autopilot-firefox-v${version}.zip`;
const sourceZip = `tinder-autopilot-firefox-source-v${version}.zip`;

const getSpawnCommand = (command, args) => {
  if (process.platform === 'win32') {
    return {
      command: process.env.ComSpec || 'cmd.exe',
      args: ['/d', '/s', '/c', command, ...args]
    };
  }

  return { command, args };
};

const run = (command, args) => {
  const spawnCommand = getSpawnCommand(command, args);
  const result = spawnSync(spawnCommand.command, spawnCommand.args, {
    cwd: repoRoot,
    stdio: 'inherit'
  });

  if (result.error) {
    console.error(result.error.message);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
};

const packageSourceForReview = () => {
  run('pnpm', [
    'exec',
    'bestzip',
    path.join('zips', sourceZip),
    '.babelrc',
    '.prettierrc.js',
    '.release-it.yml',
    'chrome',
    'docs',
    'eslint.config.js',
    'LICENSE.txt',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'README.md',
    'scripts',
    'src',
    'test',
    'TODO.md',
    'webpack.config.js'
  ]);
};

cleanFirefoxArtifacts();
run('pnpm', ['exec', 'web-ext', 'lint', '--source-dir', 'dist-firefox']);
run('pnpm', [
  'exec',
  'web-ext',
  'build',
  '--source-dir',
  'dist-firefox',
  '--artifacts-dir',
  'zips',
  '--filename',
  extensionZip,
  '--overwrite-dest'
]);
packageSourceForReview();

console.log(`Firefox extension package: ${path.join('zips', extensionZip)}`);
console.log(`Firefox reviewer source package: ${path.join('zips', sourceZip)}`);
