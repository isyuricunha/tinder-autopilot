# Project To-Do

## Auto Like Flow Review

- [x] Confirm there was no existing DOM detector module for Tinder action controls.
- [x] Add fixture-backed DOM detectors for Tinder action buttons and modal state.
- [x] Integrate detectors into the Auto Like flow in small steps.
- [x] Verify each milestone with `pnpm run lint`, `pnpm run build`, and `pnpm test`.
- [x] Make Bio Filtering respect the `Enable Bio Filtering` toggle.
- [x] Centralize Gender, Advanced, and Super Like decision rules with focused tests.
- [x] Harden `Only show unanswered messages` against the real messages sidebar DOM.
- [x] Make `Only show unanswered messages` scroll to a stable list end before filtering.
- [x] Add lazy-load settle delay before filtering unanswered messages.
- [x] Use incremental scrolling for Tinder lazy-loaded message lists.
- [x] Make `Only show unanswered messages` manual-only and stop restoring it on reload.
- [x] Confirm like actions advance the card before scheduling the next Auto Like cycle.
- [x] Run live browser verification after rebuilding and reloading the extension.

## AI Pending Message Replies

- [x] Split raw conversation fetching from normalized message comparison.
- [x] Model conversation turns with sender role, timestamp, and text.
- [x] Add AI reply settings for tone, user context, and conversation window size.
- [x] Generate AI replies with guarded JSON output and no-send fallback on invalid responses.
- [x] Process pending conversations one by one with stop support, delays, and rate limits.
- [x] Add initial tests for conversation parsing, prompt building, and response parsing.
- [x] Add send gating tests when the send flow is connected.

## AI Reply Robustness

- [x] Add max token and compatibility mode settings for AI replies.
- [x] Support standard, reasoning, and loose JSON request modes.
- [x] Add guarded retry when providers stop by length or return invalid JSON.
- [x] Recheck the latest message before sending an AI reply.
- [x] Make default AI reply prompt less robotic and restrict contact/address disclosure.
- [x] Add configurable AI reply contact, address, token, context, and sent-reply delay settings.
- [x] Make default AI reply language neutral and expand location-question detection.
- [x] Always include configured AI reply address info in the prompt and tune prompt for mass-message conversations.
- [x] Treat AI reply location details as city/neighborhood/address context and detect inverted "you are from where" questions.
