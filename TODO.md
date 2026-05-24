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
- [x] Allow Auto Like to use the visible Like action inside an open profile after AI approval.
- [x] Prevent Auto Like fallback actions from swiping the next profile after a delayed advance.
- [x] Keep Auto Like inside nested Explorer sections without clicking Back to Explore.
- [x] Stabilize Auto Like profile identity before retrying dislike fallbacks.
- [x] Add scoped Like fallback for Explorer profiles that do not advance after click.
- [x] Prevent Tinder action detectors from clicking Autopilot sidebar controls.
- [x] Abort Like fallback handling if Auto Like is stopped mid-action.
- [x] Stop Auto Like when AI Filter is unavailable instead of falling back to likes.
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
- [x] Split AI profile filtering and AI message reply model/reasoning settings with legacy fallbacks.
- [x] Reorganize sidebar AI settings into shared connection and module-specific sections.
- [x] Add manual model fields with optional OpenAI-compatible model refresh suggestions.
- [x] Split AI reply prompt inputs into style, owner profile, examples, contact, location, and hard rules.
- [x] Add synchronized manual max-token input next to the AI reply max-token slider.
- [x] Add common AI reply max-token presets while keeping 2k as the conservative default.
- [x] Respect manual AI reply token budgets across providers instead of hard-capping NVIDIA NIM.
- [x] Add AI reply prompt preview and test generation without sending Tinder messages.
- [x] Add pure settings, local-time context, manual-takeover detection, and checkpoint state helpers for continuous AI replies.
- [x] Wire continuous AI replies into the responder and sidebar without changing one-shot AI replies.
- [x] Add safeguards so continuous AI replies skip repeated latest messages, contact exchange, meeting proposals, and daily per-match limits.
- [x] Split AI reply prompt/runtime/testing controls into clearer sidebar subsections.
- [x] Increase AI reply conversation context window to 60 messages.
- [x] Skip AI replies when the owner already shared direct contact in the conversation.
- [x] Make continuous AI replies scan all match pages before waiting for the next cycle.
- [x] Clarify AI reply transcript speaker labels with OWNER/MATCH framing.
- [x] Add local conversation signal hints and stricter AI reply output validation.
- [x] Add a real pending-match AI reply review tool that never sends messages.

## AI Provider Support

- [x] Add a shared AI API type selector for OpenAI-Compatible, Mistral AI, Anthropic, and NVIDIA NIM.
- [x] Route profile filtering, AI message replies, and model listing through provider-specific request adapters.
- [x] Cover provider request conversion, response parsing, settings, and model listing with tests.
- [x] Align Mistral and NVIDIA NIM chat request behavior with official API docs.
- [x] Add official OpenAI provider and derive provider endpoints from base URLs.
- [x] Restrict custom API URLs to OpenAI-Compatible while keeping official providers fixed.
- [x] Harden hosted NVIDIA NIM requests and model suggestions for stricter endpoints.
- [x] Map opt-in AI reply reasoning fields per provider documentation.
- [x] Route AI provider requests through the extension background fetch path to avoid Tinder-page CORS.
- [x] Summarize provider HTTP errors before writing them to the Activity log.
- [x] Verify provider support with `pnpm test`, `pnpm run lint`, and `pnpm run build`.

## AI Provider Key Rotation

- [x] Confirm the current implementation only supports one shared API key.
- [x] Add a tested provider-level key pool and round-robin selector.
- [x] Integrate provider-level key rotation into AI profile filtering, AI replies, and model refresh.
- [x] Add sidebar controls for editing one API key per line for the selected provider.
- [x] Verify provider-level key rotation with `pnpm test`, `pnpm run lint`, and `pnpm run build`.

## Sidebar UX

- [x] Confirm there was no existing sidebar collapse or accordion helper.
- [x] Reorder the sidebar so operational messaging controls and Activity appear before the large AI settings area.
- [x] Move AI reply mode into the operational Messaging Settings section.
- [x] Replace the unsafe auto-message fallback with a neutral default template.
- [x] Add visible labels to sidebar text inputs and textareas.
- [x] Add compact operational status chips for Auto Like, AI Reply, and provider.
- [x] Add a clear action for the Activity log.
- [x] Use button semantics for sidebar toggle controls.
- [x] Add persistent collapsible sidebar sections for secondary filters, AI prompt context, runtime, and testing controls.
- [x] Improve AI reply mode labels and give large AI prompt/test fields more editing room.
- [x] Add inline AI connection status for provider changes and model refresh results.
- [x] Replace separate AI reply toggles with one Off / Reply once / Continuous mode selector.
- [x] Disable continuous-only runtime controls unless Continuous AI reply mode is selected.
- [x] Compact the top counters and reduce repeated card chrome in the sidebar.
- [x] Add shared Cursor-like dark theme tokens for sidebar surfaces and controls.
- [x] Apply the Cursor-like theme across sidebar templates, toggles, activity log, and injected CSS.
- [x] Remove the unreliable Matched counter from the sidebar and counter store.
- [x] Verify sidebar UX changes with `pnpm test`, `pnpm run lint`, and `pnpm run build`.
