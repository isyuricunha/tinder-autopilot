# Project To-Do

## Auto Like Flow Review

- [x] Confirm there was no existing DOM detector module for Tinder action controls.
- [x] Add fixture-backed DOM detectors for Tinder action buttons and modal state.
- [x] Integrate detectors into the Auto Like flow in small steps.
- [x] Verify each milestone with `pnpm run lint`, `pnpm run build`, and `pnpm test`.
- [x] Make Bio Filtering respect the `Enable Bio Filtering` toggle.
- [x] Centralize Gender, Advanced, and Super Like decision rules with focused tests.
- [x] Harden `Only show unanswered messages` against the real messages sidebar DOM.
- [x] Run live browser verification after rebuilding and reloading the extension.

## AI Pending Message Replies

- [x] Split raw conversation fetching from normalized message comparison.
- [x] Model conversation turns with sender role, timestamp, and text.
- [x] Add AI reply settings for tone, user context, and conversation window size.
- [ ] Generate AI replies with guarded JSON output and no-send fallback on invalid responses.
- [ ] Process pending conversations one by one with stop support, delays, and rate limits.
- [x] Add initial tests for conversation parsing, prompt building, and response parsing.
- [ ] Add send gating tests when the send flow is connected.
