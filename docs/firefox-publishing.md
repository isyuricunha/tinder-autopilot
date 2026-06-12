# Firefox Publishing

This project is prepared for Firefox Add-ons (AMO) publication. Chrome Web Store publication is intentionally out of scope while the production extension remains Manifest V2.

## Verified Mozilla Requirements

- Run `web-ext lint` before submitting to AMO.
- Upload a ZIP whose root contains the extension files, including `manifest.json`; do not ZIP the parent folder.
- Upload a matching source package for each AMO version because the submitted extension is produced by webpack and minified.
- Include the package manager lockfile so reviewers rebuild with the same dependency graph.
- Declare data collection and transmission in `browser_specific_settings.gecko.data_collection_permissions`.
- Use Firefox built-in data consent by requiring Firefox `140.0` or later.

## Release Artifacts

Run:

```bash
pnpm install --frozen-lockfile
pnpm run verify:firefox
pnpm run package:firefox
```

The package command creates:

- `zips/tinder-autopilot-firefox-v<version>.zip` for AMO upload.
- `zips/tinder-autopilot-firefox-source-v<version>.zip` for AMO reviewer source upload.

## AMO Submission Checklist

1. Confirm `package.json`, `chrome/manifest.json`, `chrome/manifest.firefox.json`, and `chrome/manifest.v3.json` use the same version.
2. Run `pnpm run verify:firefox`.
3. Run `pnpm run package:firefox`.
4. Upload the Firefox extension ZIP to AMO.
5. Upload the matching source ZIP when AMO asks for source code.
6. In the AMO listing, explain the broad host permissions:
   - Tinder page access powers the injected sidebar and profile/message automations.
   - `api.gotinder.com` and `*.gotinder.com` access powers Tinder API calls.
   - `https://*/*`, `localhost`, and `127.0.0.1` support user-configured AI providers and local OpenAI-compatible endpoints.
7. In the AMO listing or privacy policy, disclose that optional AI features can transmit Tinder profile content and personal communications to the AI provider configured by the user.

## Reviewer Build Instructions

Reviewers can rebuild the submitted Firefox package from the source ZIP with:

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm run lint:firefox
```

The AMO upload package is generated from `dist-firefox/` by:

```bash
pnpm exec web-ext build --source-dir dist-firefox --artifacts-dir zips --overwrite-dest
```

This repo uses `pnpm` only. Do not use `npm`, `yarn`, or Chrome Web Store packaging for the Firefox release.
