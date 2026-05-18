# Tinder Autopilot

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

> Don't waste time with manual Tinder tasks. Autopilot does it for you.

<p align="center">
<img src="https://i.imgur.com/PM6XD8y.png" alt="product demo" />
</p>

## Table of Contents

- [About](#about)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
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

---

## About

**Tinder Autopilot** is a Chrome extension that automates swipes, messaging, and inbox management on Tinder. This is a maintained continuation of the original project by [Geczy](https://github.com/isyuricunha/tinder-autopilot), modernized for current Tinder UI and workflows.

- **Repository**: <https://github.com/isyuricunha/tinder-autopilot>
- **Manifest Version**: MV2 ([`chrome/manifest.json`](chrome/manifest.json))
- **MV3 Reference**: [`chrome/manifest.v3.json`](chrome/manifest.v3.json)
- **Current Version**: 3.0.0

---

## Features

### Core Automations

| Automation | Description |
|------------|-------------|
| **Auto Like** | Automatic right-swipes with adjustable interval (1–10s) |
| **Super Like Automation** | Up to 5/day with strategies (random, verified, photos, distance) |
| **Profile Filtering** | Skip by bio keywords, gender identity, age range, max distance, min photos |
| **Auto Messaging** | Send templated messages to all matches or new ones only |
| **Hide Unanswered** | Show only chats needing your reply |
| **Anonymous Mode** | Blur profile images and UI for screenshots |
| **Instagram Helper** | Open IG media in new tab from profile modals |
| **Activity Log** | Timestamped actions visible in the sidebar |

### Advanced Filtering

- **Bio Filtering**: Blacklist specific words/phrases (e.g., `trans`, `onlyfans`, `premium`)
- **Gender Filtering**: Skip specific gender identities
- **Age Range**: Set minimum and maximum age thresholds
- **Distance Filtering**: Maximum distance in km/miles
- **Photo Count**: Minimum number of photos required

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/isyuricunha/tinder-autopilot.git
cd tinder-autopilot

# Install dependencies
pnpm install

# Development mode (watch)
pnpm start

# Production build
pnpm build
```

Then load the `dist/` folder as an unpacked extension in Chrome.

---

## Installation

### Step 1: Build the Extension

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build
```

### Step 2: Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `dist/` folder from your project directory
5. The extension should now appear in your extensions list

### Step 3: Use on Tinder

1. Open [Tinder](https://tinder.com/) in your browser
2. Log in to your account
3. The Autopilot sidebar will appear on the left side of the screen

---

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  chrome/manifest.json  - Extension configuration (MV2)      │
├─────────────────────────────────────────────────────────────┤
│  src/                                                        │
│  ├── index.js          - Content script entry point        │
│  ├── automations/      - Feature modules                   │
│  │   ├── Swiper.js     - Auto-like loop                    │
│  │   ├── SuperLiker.js - Super Like strategies             │
│  │   ├── Messenger.js  - Batch messaging                   │
│  │   ├── ProfileAnalyzer.js - Profile filtering            │
│  │   ├── HideUnanswered.js - Chat filtering                │
│  │   ├── Anonymous.js  - Privacy blur                      │
│  │   └── Instagram.js  - IG media helper                   │
│  ├── views/            - UI components                     │
│  │   ├── Sidebar.js    - Main controls wiring              │
│  │   ├── sidebar-renderer.js - Sidebar shell rendering     │
│  │   ├── toggle-control.js - Toggle state/render helper    │
│  │   └── templates.js  - HTML templates                    │
│  ├── misc/             - Helpers                           │
│  │   ├── api.js        - API wrapper                       │
│  │   ├── bg.js         - Background script                 │
│  │   ├── counter-store.js - Counter persistence            │
│  │   ├── settings-store.js - Local settings persistence    │
│  │   ├── helper.js     - Utilities                         │
│  │   └── Interactions.js - DOM navigation                 │
│  └── styles/           - CSS                               │
│       └── modern-ui.css                                    │
└─────────────────────────────────────────────────────────────┘
```

### Runtime Flow

1. **Content Script** ([`src/index.js`](src/index.js:7)) loads your profile via [`getMyProfile()`](src/misc/api.js:60) and caches it to `localStorage` (`TinderAutopilot/ProfileData`)
2. **Sidebar** ([`src/views/Sidebar.js`](src/views/Sidebar.js:20)) mounts and renders controls
3. **Background Script** ([`src/misc/bg.js`](src/misc/bg.js)) proxies network calls to `api.gotinder.com` to avoid CORS
4. **Automations** run against Tinder's DOM using resilient selectors

---

## Settings Reference

Settings are available in the left Autopilot sidebar and mostly persist to
`localStorage` under the `TinderAutopilot/…` namespace. The AI API key is stored
separately in extension local storage via `chrome.storage.local`.

### Main Settings

| Setting | Selector | Description |
|---------|----------|-------------|
| Auto Like | `.tinderAutopilot` | Starts/stops auto-like loop |
| Like Interval | `likeInterval` | Slider (1–10s, default 3s) |
| Hide Unanswered | `.tinderAutopilotHideMine` | Filter chat list to unanswered |
| Anonymous Mode | `.tinderAutopilotAnonymous` | Blur UI elements |

### Bio Filtering

| Setting | Selector | Description |
|---------|----------|-------------|
| Enable Bio Filter | `.tinderAutopilotBioFilter` | Toggle bio filtering |
| Bio Blacklist | `bioBlacklist` | Comma-separated terms (e.g., `trans, onlyfans, premium`) |

### Gender Filtering

| Setting | Selector | Description |
|---------|----------|-------------|
| Enable Gender Filter | `.tinderAutopilotGenderFilter` | Toggle gender filtering |
| Gender Filter | `genderFilter` | Comma-separated identities to skip |

### Advanced Filtering

| Setting | Selector | Description |
|---------|----------|-------------|
| Enable Advanced Filter | `.tinderAutopilotAdvancedFilter` | Toggle advanced filtering |
| Minimum Age | `minAge` | Slider (default: 18) |
| Maximum Age | `maxAge` | Slider (default: 35) |
| Maximum Distance | `maxDistance` | Slider in km (default: 50) |
| Minimum Photos | `minPhotoCount` | Slider (default: 3) |

### Super Like Settings

| Setting | Selector | Description |
|---------|----------|-------------|
| Enable Super Like | `.tinderAutopilotSuperLike` | Toggle Super Like automation |
| Strategy | `superLikeStrategy` | `random`, `verified`, `photos`, `distance` |
| Daily Limit | (internal) | 5 per day (tracked in localStorage) |

### Messaging Settings

| Setting | Selector | Description |
|---------|----------|-------------|
| Auto Message | `.tinderAutopilotMessage` | Start/stop messaging |
| New Matches Only | `.tinderAutopilotMessageNewOnly` | Filter to new matches |
| Message Template | `MessengerDefault` | Template with `{name}` token |

---

## Modules and Internals

### [`Swiper`](src/automations/Swiper.js:6)

Main auto-like engine.

- Starts/stops auto-like loop
- Navigates to recommendations, closes modals
- Finds Like/Pass buttons with resilient selectors and XPath fallbacks
- Integrates [`ProfileAnalyzer`](src/automations/ProfileAnalyzer.js:3) and [`SuperLiker`](src/automations/SuperLiker.js:4)
- Updates counters in UI

### [`SuperLiker`](src/automations/SuperLiker.js:4)

Manages Super Like automation.

- Enforces daily limit (5)
- Tracks usage in `localStorage` by day
- Strategies:
  - `random`: 10% chance
  - `verified`: Only verified profiles
  - `photos`: Profiles with ≥5 photos
  - `distance`: Profiles within 10km

### [`ProfileAnalyzer`](src/automations/ProfileAnalyzer.js:3)

Profile filtering and analysis.

- Extracts bio, gender, age, distance, photos
- Implements all filtering toggles and thresholds
- Opens/closes profile modals for inspection

### [`Messenger`](src/automations/Messenger.js:7)

Batch messaging system.

- Pages through matches with [`getMatches()`](src/misc/api.js:52)
- Batches requests to prevent memory issues
- Deduplicates using normalized message comparison

### [`HideUnanswered`](src/automations/HideUnanswered.js:3)

Chat list filtering.

- Scrolls chat list to fetch all items
- Hides conversations without reply indicators

### [`Anonymous`](src/automations/Anonymous.js:3)

Privacy mode.

- Adds/removes CSS blur on key UI targets
- Uses [`insertCss`/`removeCss`](src/misc/insert-css.js) helpers

### [`Instagram`](src/automations/Instagram.js:3)

Instagram media helper.

- Observes modal container for IG links
- Makes IG media clickable to open in new tab

### [`API`](src/misc/api.js:17)

API wrapper using background script.

- [`fetchResource(url, body?)`](src/misc/api.js:17) via `chrome.runtime.sendMessage`
- [`getMyProfile()`](src/misc/api.js:60)
- [`getMatches(newOnly, pageToken)`](src/misc/api.js:52)
- [`getMessagesForMatch({id})`](src/misc/api.js:65)
- [`sendMessageToMatch(matchID, options)`](src/misc/api.js:94)

### Utilities

| Module | Description |
|--------|-------------|
| [`Interactions`](src/misc/Interactions.js) | Page navigation, modal closers |
| [`helper`](src/misc/helper.js:10) | `logger`, `randomDelay`, `generateRandomNumber`, `waitUntilElementExists` |
| [`insert-css`](src/misc/insert-css.js) | Inject/remove style tags |

---

## API Usage

The extension calls Tinder endpoints via the background script. Required permissions are declared in [`chrome/manifest.json`](chrome/manifest.json:19):

```json
{
  "permissions": [
    "storage",
    "https://api.gotinder.com/*",
    "https://*.gotinder.com/*"
  ]
}
```

### Token Sources

Tokens are read from `localStorage` (on `tinder.com`):

| Key | Purpose |
|-----|---------|
| `TinderWeb/uuid` | `persistent-device-id` header |
| `TinderWeb/APIToken` | `X-Auth-Token` header |

---

## Development

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Webpack dev watch |
| `pnpm build` | Production bundle |
| `pnpm lint` | ESLint check |
| `pnpm test` | Node.js unit tests |
| `pnpm major` | Major version release |
| `pnpm minor` | Minor version release |
| `pnpm patch` | Patch version release |

### Project Layout

```
tinder-autopilot/
├── chrome/
│   ├── manifest.json      # Extension manifest (MV2)
│   ├── manifest.v3.json   # MV3 reference manifest
│   └── icons/             # Extension icons
├── src/
│   ├── index.js           # Content script entry
│   ├── automations/       # Feature modules
│   ├── views/             # UI components
│   ├── misc/              # Helpers, API, background
│   └── styles/            # CSS
├── tinder-html/           # Test HTML snapshots
├── test/                  # Node.js unit tests
├── dist/                  # Build output (load in Chrome)
├── package.json
└── webpack.config.js
```

### Coding Standards

- **ESLint** + **Prettier** (Airbnb base)
- **Babel** config for modern JS
- **pnpm** is the only supported package manager
- **Node.js test runner** for unit tests
- Conventional Commits for versioning

### Manifest V3 Status

The production build still copies `chrome/manifest.json` and runs as MV2. The
repository includes `chrome/manifest.v3.json` as a migration reference using a
service worker background script and `host_permissions`. Before switching the
build to MV3, verify the background message proxy under service-worker lifetime
rules and test the unpacked extension on `chrome://extensions/`.

---

## Troubleshooting

### Sidebar not visible

- Ensure you loaded `dist/` as unpacked extension
- Verify you're on `tinder.com`

### API calls failing

- Verify you're logged into Tinder Web
- Check tokens exist: `TinderWeb/APIToken`, `TinderWeb/uuid`

### Auto-like not working

- Ensure you're on Discover/Recs page
- Close any blocking modals

### Messaging stuck

- Reduce batch size or wait for pages to complete
- Check network tab for API errors

### Super Like not triggering

- Confirm strategy conditions are met
- Check daily limit hasn't been reached

### Memory issues

- Extension limits log to 50 lines
- Profile cache limited to 100 entries
- Clear `localStorage` if issues persist

---

## Privacy & Disclaimer

⚠️ **Use at your own risk.** This tool automates interactions with Tinder Web in your browser session. Automation may violate Tinder's Terms of Service.

### Local Storage Keys

| Key | Purpose |
|-----|---------|
| `TinderAutopilot/ProfileData` | Cached profile data |
| `TinderAutopilot/likeCount` | Like counter |
| `TinderAutopilot/matchCount` | Match counter |
| `TinderAutopilot/deslikeCount` | Dislike counter |
| `TinderAutopilot/bioBlacklist` | Bio filter words |
| `TinderAutopilot/genderFilter` | Gender filter |
| `TinderAutopilot/minAge` | Min age setting |
| `TinderAutopilot/maxAge` | Max age setting |
| `TinderAutopilot/maxDistance` | Max distance setting |
| `TinderAutopilot/minPhotoCount` | Min photos setting |
| `TinderAutopilot/superLikeStrategy` | Super Like strategy |
| `TinderAutopilot/superLikeCount` | Daily Super Like count |
| `TinderAutopilot/lastSuperLikeDate` | Last Super Like date |
| `TinderAutopilot/MessengerDefault` | Message template |
| `TinderAutopilot/debug` | Enables debug console logging when set to `true` |

### Extension Storage Keys

| Key | Purpose |
|-----|---------|
| `TinderAutopilot/aiApiKey` | AI profile filter API key |

No data is sent to external servers beyond Tinder's API.

---

## Contributing

We welcome PRs! Suggested flow:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `feat: add my feature`
4. Push and open a PR
5. Link issues and describe changes clearly

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new automation
fix: correct swipe detection
docs: update README
style: format code
refactor: simplify profile analyzer
perf: improve memory management
test: add unit tests
chore: update dependencies
```

---

## Maintainers

- **Continued by**: [Yuri Cunha](mailto:me@yuricunha.com)
- **Original author**: [Geczy](mailto:hashtagnogf@protonmail.com)

---

## License

MIT - see [LICENSE](LICENSE) file.

---

If this project helped you, please ⭐ the repo and consider sponsorship.
