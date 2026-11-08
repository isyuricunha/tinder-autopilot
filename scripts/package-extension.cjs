const { cp, mkdir, mkdtemp, readFile, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const zip = require('bestzip');

const targets = [
  { browser: 'chromium', output: 'dist' },
  { browser: 'firefox', output: 'dist-firefox' }
];

const packageExtension = async (version, cwd = process.cwd()) => {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Expected a stable extension version, got ${version}`);
  }

  const outputDir = path.join(cwd, 'zips');
  await mkdir(outputDir, { recursive: true });
  const tempRoot = path.resolve(tmpdir());
  const staging = await mkdtemp(path.join(tempRoot, 'tinder-autopilot-release-'));
  if (path.dirname(staging) !== tempRoot) throw new Error('Unexpected release staging directory');

  try {
    for (const { browser, output } of targets) {
      const folder = `tinder-autopilot-${browser}`;
      const destination = path.join(staging, folder);
      await cp(path.join(cwd, output), destination, { recursive: true });
      const manifestPath = path.join(destination, 'manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      manifest.version = version;
      await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

      const archive = path.join(outputDir, `${folder}-v${version}.zip`);
      await rm(archive, { force: true });
      await zip({ cwd: staging, source: folder, destination: archive });
      console.log(`Packaged ${path.relative(cwd, archive)}`);
    }
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
};

exports.prepare = (_options, { nextRelease, cwd }) => packageExtension(nextRelease.version, cwd);

if (require.main === module) {
  const version = process.argv[2] || require('../package.json').version;
  packageExtension(version).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
