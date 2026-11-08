# Tinder Autopilot

A browser extension for Tinder Web that automates swipes and messaging. The sidebar gives you control over which profiles to skip, when to send messages, and how to review recent activity.

Visit the [Tinder Autopilot website](https://isyuricunha.github.io/tinder-autopilot/) for an overview and browser-specific installation instructions.

## Install from source

Use Node.js and the pnpm version listed in [package.json](package.json).

```sh
git clone https://github.com/isyuricunha/tinder-autopilot.git
cd tinder-autopilot
pnpm install --frozen-lockfile
pnpm build
```

| Browser | Load the build |
| --- | --- |
| Chrome or Brave | Open `chrome://extensions` or `brave://extensions`, enable **Developer mode**, select **Load unpacked**, and choose `dist/`. |
| Firefox | Open `about:debugging#/runtime/this-firefox`, select **Load Temporary Add-on**, and choose `dist-firefox/manifest.json`. Temporary add-ons are removed when Firefox restarts. |

For a prebuilt copy, download the ZIP for your browser from [GitHub Releases](https://github.com/isyuricunha/tinder-autopilot/releases), extract it, and use the extracted folder in Chrome or Brave, or the extracted `manifest.json` in Firefox. Firefox's temporary installation uses the unpacked manifest.

Sign in to [Tinder Web](https://tinder.com/) and open Recommendations. The Autopilot sidebar appears on the left. After rebuilding, reload the extension in your browser's extension manager, then refresh the Tinder tab.

## Use the sidebar

| Tab | Controls |
| --- | --- |
| **Swipes** | Start or stop Auto Like. Configure bio and gender filters, age and distance limits, minimum photo count, profile filter rules, and Super Like strategy. |
| **Messages** | Configure the message template, limit template messages to new matches, hide answered conversations, or run model-assisted replies once or continuously. |
| **Settings** | Configure the provider shared by profile filtering and replies. Enable **Anonymous Mode** to hide profile pictures for screenshots. |
| **Activity** | View or reset swipe totals and inspect recent cycles, including the result, reason, and duration of each step. |

### Filter profiles

1. In **Swipes**, enable the filters you want to apply.
2. For model-based filtering, configure the provider in **Settings**, then enter your own **Profile Filter Rules** and select a model in **Swipes**.
3. Enable **Auto Like**. The status above the tabs shows the current step and how long it has been running.

The profile filter sends your rules separately from the profile fields. It uses the gender field shown on the profile when available. Empty rules, request failures, and invalid decisions pause Auto Like. **Activity** shows the reason for the pause.

Bio and gender lists accept commas or line breaks. Leave a list empty to apply no restrictions from that list. The distance limit is in kilometers, even when Tinder displays miles. If Tinder does not show a field, its limit does not reject the profile.

### Review replies before sending

In **Messages**, expand **Test Replies**. Use **Preview Prompt** to inspect what would be sent to the provider. **Test Reply** generates a reply without sending it on Tinder. **Review Real Match** uses an eligible conversation to generate a preview. **Reply once** and **Continuous** can send messages to real matches.

**Auto Message** sends your template to matches with empty conversations. The `{name}` placeholder keeps the match's display name as written. Run Auto Message or model-assisted replies one at a time. Turning a mode off stops new sends and lets requests already in progress finish.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| The sidebar is missing | Confirm the browser loaded the correct build. Reload the extension, then refresh Tinder Web and open Recommendations. |
| Auto Like shows **Paused** | Open **Activity** and read the most recent pause reason. Check the profile filter rules, provider, model, or Tinder dialog named in the event. |
| A swipe is slow | Check the phase shown in the status chip. The last completed cycle in **Activity** breaks down the time spent reading the profile, waiting for the provider, closing the profile, and confirming the swipe. |
| The provider rejects a request | Verify the provider, API key, and model in the corresponding settings. For **OpenAI-Compatible**, also check the base URL. |
| Super Likes are unavailable | Check the selected strategy, the extension's daily cap, and the Super Likes available in your Tinder account. |

When reporting an issue, include your browser version, the last visible phase, and the relevant Activity lines. Use **Show** to narrow the log and **Copy log** to copy the displayed entries with their timing details. Remove profile names, message contents, credentials, and account identifiers before sharing.

## Data and account access

The extension acts through your signed-in Tinder Web session. It stores preferences and counters in the browser and provider keys in extension storage. The activity log keeps the latest 50 entries in the sidebar.

When you enable model-based filtering or request a generated reply, the extension sends relevant profile fields or conversation context to the provider you configured. Previewing a prompt displays its contents locally. Review the provider's data policy before sending real profiles or conversations.

## Development

| Command | Purpose |
| --- | --- |
| `pnpm start` | Rebuild the extension while editing. |
| `pnpm build` | Generate `dist/` and `dist-firefox/`. |
| `pnpm package:extension` | Build and create browser-specific ZIPs under `zips/`. |
| `pnpm lint` | Check source files with ESLint. |
| `pnpm test` | Run the Node.js tests. |

- [src/automations/](src/automations/) contains the swipe, profile, and messaging workflows.
- [src/views/](src/views/) contains the sidebar and its controls.
- [src/misc/](src/misc/) contains request handling, DOM detectors, settings, and shared logic.
- [test/](test/) contains regression tests. [tinder-html/](tinder-html/) contains Tinder DOM fixtures.
- [webpack.config.js](webpack.config.js) selects the browser manifests and assembles the build output.

For changes that touch Tinder's DOM or extension permissions, check the unpacked build in a browser as well as running the tests. Use [Conventional Commits](https://www.conventionalcommits.org/) and include verification details in the pull request.

Pushes to `main` run verification before semantic-release evaluates the commits. Releases attach two ZIPs with the release version set in each manifest. The workflow initializes the `v3.0.0` baseline automatically if it is missing, so release versions advance from the existing 3.0.0 builds.

Maintained by [Yuri Cunha](mailto:me@yuricunha.com). The project continues the original work by Geczy. See [LICENSE.txt](LICENSE.txt) for the license text included in the repository.
