# Tinder Autopilot 
![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

> Don't waste time with manual Tinder tasks. Autopilot does it for you.

~~Install on the Chrome Web Store~~ (no longer available)

<p align="center">
  <img src="https://i.imgur.com/PM6XD8y.png" alt="product demo" />
</p>

## Table of Contents
- [About](#about)
- [Features](#features)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Settings Reference](#settings-reference)
- [Modules and Internals](#modules-and-internals)
- [API Usage](#api-usage)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Privacy & Disclaimer](#privacy--disclaimer)
- [Contributing](#contributing)
- [Maintainers](#maintainers)
- [License](#license)

## About
Tinder Autopilot is a Chrome extension that automates swipes, messaging, and inbox management on Tinder. This is a maintained continuation of the original project by [Geczy](https://github.com/isyuricunha/tinder-autopilot), modernized for current Tinder UI and workflows.

- Repository: https://github.com/isyuricunha/tinder-autopilot
- Manifest: MV2 (`chrome/manifest.json`)
- Current version: 3.0.0

## Features
- Auto Like: automatic right-swipes with adjustable interval.
- Super Like Automation: up to 5/day with strategies (random, verified, photos, nearby).
- Profile Filtering: skip by bio keywords, gender identity, age range, max distance, min photos.
- Auto Messaging: send templated message to all matches or new ones only.
- Hide Unanswered: show only chats needing your reply.
- Anonymous Mode: blur profile images and UI for screenshots.
- Instagram Helper: open IG media in new tab from profile modals.
- Activity Log: timestamped actions visible in the sidebar.

## Quick Start
1. Clone the repo and install dependencies:
   ```bash
   yarn install
   yarn start   # development (watch)
   # or
   yarn build   # production build
   ```
2. In Chrome, open `chrome://extensions`, enable Developer mode, click "Load unpacked", and select the `dist/` folder.
3. Open Tinder in the browser. A new Autopilot sidebar appears on the left.

## How It Works
- Content script (`src/index.js`) loads your profile via `getMyProfile()` and caches it (`localStorage: TinderAutopilot/ProfileData`), then mounts the Sidebar and Instagram helper.
- Background script (`src/misc/bg.js`) proxies network calls to `api.gotinder.com` to avoid CORS issues.
- UI is injected in-place (`src/views/Sidebar.js`, `src/views/templates.js`), styling is runtime-inserted (`src/misc/insert-css.js`).
- Automations run against Tinder's DOM (robust selectors and fallbacks) and respect your configured filters.

### Architecture (high-level)
- `src/index.js` → initializes modules and persists profile data.
- `views/Sidebar` → renders controls; wires events to automations.
- `automations/Swiper` → main swipe loop; integrates `ProfileAnalyzer` and `SuperLiker`.
- `automations/Messenger` → batch sends messages with deduping.
- `automations/HideUnanswered` → filters chat list for unanswered.
- `automations/Anonymous` → toggles blur CSS.
- `automations/Instagram` → clickable IG media from modals.
- `misc/api` → fetch wrapper using background script.
- `misc/Interactions` → navigation and modal handling helpers.
- `misc/helper` → logger, delays, randoms, waiters.

## Settings Reference
All settings are available in the left Autopilot sidebar and persist to `localStorage` under the `TinderAutopilot/…` namespace.

### Main Settings
- __Auto like__ (`.tinderAutopilot`)
  - Interval slider (`likeInterval`, 1–10s, default 3s) → ms used by `Swiper.getLikeInterval()`.
- __Only show unanswered messages__ (`.tinderAutopilotHideMine`)
  - Activates `HideUnanswered.start()` to reduce chat list.
- __Anonymous Mode__ (`.tinderAutopilotAnonymous`)
  - Adds blur via `insertCss`; removes with `removeCss`.

### Bio Filtering
- __Enable Bio Filtering__ (`.tinderAutopilotBioFilter`)
- __Bio blacklist__ (`bioBlacklist`) comma-separated terms, e.g. `trans, onlyfans, premium`.
  - Enforced by `ProfileAnalyzer.shouldSkipProfile()` using `getBioText()`.

### Gender Filtering
- __Enable Gender Filtering__ (`.tinderAutopilotGenderFilter`)
- __Gender filter__ (`genderFilter`) comma-separated identities to skip.

### Advanced Filtering
- __Enable Advanced Filtering__ (`.tinderAutopilotAdvancedFilter`)
- __Minimum Age__ (`minAge`)
- __Maximum Age__ (`maxAge`)
- __Maximum Distance__ (`maxDistance`)
- __Minimum Photos__ (`minPhotoCount`)
  - All applied in `ProfileAnalyzer.shouldSkipProfile()` using DOM heuristics.

### Super Like Settings
- __Enable Super Like Automation__ (`.tinderAutopilotSuperLike`)
- __Super Like Strategy__ (`superLikeStrategy`):
  - `random` (10% chance)
  - `verified` (presence of verification indicators)
  - `photos` (≥ 5 photos)
  - `distance` (≤ 10km)
- Daily limit tracked locally (`superLikeCount` per day).

### Messaging Settings
- __Auto message__ (`.tinderAutopilotMessage`)
- __New matches only__ (`.tinderAutopilotMessageNewOnly`)
- __Message Template__ (`MessengerDefault`) supports `{name}` token (lowercased).
  - Duplicate detection normalizes messages to avoid re-sending.

## Modules and Internals
Key classes and behaviors (see `src/…`).

### `Swiper` (`src/automations/Swiper.js`)
- Starts/stops auto-like loop; navigates to recs; closes modals (`Interactions`).
- Finds Like/Pass with resilient selectors and XPath; skips per `ProfileAnalyzer`.
- Integrates `SuperLiker` first; falls back to Like; updates counters in UI.

### `SuperLiker` (`src/automations/SuperLiker.js`)
- Enforces daily limit (5), tracks in `localStorage` by day.
- Strategies: random/verified/photos/distance using DOM indicators.

### `ProfileAnalyzer` (`src/automations/ProfileAnalyzer.js`)
- Extracts bio, gender, age, distance, photos with multiple selectors and fallbacks.
- Implements all filtering toggles and thresholds.

### `Messenger` (`src/automations/Messenger.js`)
- Pages through matches with `getMatches()`; batches requests; delay between calls.
- Deduplicates using normalized history vs. template with `{name}`.

### `HideUnanswered` (`src/automations/HideUnanswered.js`)
- Scrolls chat list to fetch all items; hides those without reply indicators.

### `Anonymous` (`src/automations/Anonymous.js`)
- Adds/removes CSS blur on key UI targets.

### `Instagram` (`src/automations/Instagram.js`)
- Observes modal container; makes IG media clickable to open in a new tab.

### `API` (`src/misc/api.js`)
- `fetchResource(url, body?)` via `chrome.runtime.sendMessage` to background.
- `getMyProfile()`, `getMatches(newOnly, pageToken)`, `getMessagesForMatch({id})`, `sendMessageToMatch(matchID, options)`.
- Uses `localStorage` tokens: `TinderWeb/uuid`, `TinderWeb/APIToken`.

### Utilities
- `Interactions` → page nav, modal closers.
- `helper` → `logger`, `randomDelay`, `generateRandomNumber`, `waitUntilElementExists`.
- `insert-css` → inject/remove style tag with id `TinderAutopilot-insert-css`.

## API Usage
The extension calls Tinder endpoints via the background script. Required permissions are declared in `chrome/manifest.json`:
- `https://api.gotinder.com/*`
- `https://*.gotinder.com/*`
- `storage`

Token sources (from local storage on tinder.com):
- `TinderWeb/uuid` → `persistent-device-id`
- `TinderWeb/APIToken` → `X-Auth-Token`

## Development
Scripts (`package.json`):
- `yarn start` → webpack dev watch
- `yarn build` → production bundle
- `yarn major|minor|patch` → release-it (CI driven, requires env setup)

Project layout:
- `src/index.js` — content entry
- `src/views/` — sidebar UI and templates
- `src/automations/` — feature modules
- `src/misc/` — helpers, background, API
- `chrome/` — extension manifest and icons
- `dist/` — build output to load in Chrome

Coding standards:
- ESLint + Prettier (Airbnb base)
- Babel config for modern JS

## Troubleshooting
- __Sidebar not visible__: ensure you loaded `dist/` as unpacked extension and are on `tinder.com`.
- __API calls failing__: verify you are logged into Tinder Web and tokens (`TinderWeb/APIToken`) exist.
- __Auto-like not working__: check that the page is on Discover/Recs and no modal blocks the UI.
- __Messaging stuck__: reduce batch size or wait—module pages through all matches with delays.
- __Super Like not triggering__: confirm strategy conditions and that you haven't hit the daily limit.

## Privacy & Disclaimer
This tool automates interactions with Tinder Web in your browser session. Use responsibly and at your own risk. Review Tinder’s Terms of Service—automation may violate platform policies.

Data stored locally in your browser:
- `TinderAutopilot/*` preferences and counters
- Cached profile data (`TinderAutopilot/ProfileData`) for UI usage

## Contributing
We welcome PRs! Suggested flow:
1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `feat: add my feature`
4. Push and open a PR
5. Link issues and describe changes clearly

## Maintainers
- Continued by: **Yuri Cunha** — [me@yuricunha.com](mailto:me@yuricunha.com)
- Original author: **Geczy** — [hashtagnogf@protonmail.com](mailto:hashtagnogf@protonmail.com)

## License
MIT — see LICENSE file.

---
If this project helped you, please ⭐ the repo and consider sponsorship.
