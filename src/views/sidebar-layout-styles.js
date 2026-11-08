import { SIDEBAR_THEME as theme } from './sidebar-theme';

const SIDEBAR_LAYOUT_STYLES = `
  #infoBanner .ta-sidebar-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: ${theme.background};
    color: ${theme.text};
    color-scheme: dark;
    font: 14px/1.4 system-ui, sans-serif;
  }

  #infoBanner .ta-sidebar-header {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 60px;
    padding: 8px 14px;
    background: ${theme.backgroundElevated};
    flex: 0 0 auto;
  }

  #infoBanner .ta-sidebar-mark {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    flex: 0 0 30px;
    border-radius: 9px;
    background: ${theme.accentGradient};
    color: ${theme.background};
    font-weight: 800;
  }

  #infoBanner .ta-sidebar-header h2 {
    margin: 0;
    font: 700 15px/1.3 system-ui, sans-serif;
    flex: 1;
  }

  #infoBanner .ta-sidebar-header a {
    color: ${theme.textMuted};
    font-size: 12px;
    padding: 6px 4px;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  #infoBanner .ta-operational-status {
    display: grid;
    grid-template-columns: 1fr 1fr minmax(0, 1.25fr);
    gap: 6px;
    padding: 0 12px 10px;
    background: ${theme.backgroundElevated};
    flex: 0 0 auto;
  }

  #infoBanner .ta-sidebar-tabs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 4px;
    padding: 4px 8px;
    border-block: 1px solid ${theme.border};
    background: ${theme.backgroundElevated};
    flex: 0 0 auto;
  }

  #infoBanner .ta-sidebar-tabs button {
    min-height: 40px;
    padding: 4px 2px;
    border: 1px solid transparent;
    border-radius: 7px;
    background: transparent;
    color: ${theme.textMuted};
    font: 600 12px/1.25 system-ui, sans-serif;
    cursor: pointer;
    overflow-wrap: anywhere;
  }

  #infoBanner .ta-sidebar-tabs button:hover,
  #infoBanner .ta-section-toggle:hover {
    background: ${theme.surfaceHover};
    color: ${theme.text};
  }

  #infoBanner .ta-sidebar-tabs button[aria-selected="true"] {
    border-color: ${theme.accentBorder};
    background: ${theme.accentSoft};
    box-shadow: inset 0 -2px ${theme.accentHover};
    color: ${theme.text};
  }

  #infoBanner :is(button, a, .ta-panel):focus-visible {
    outline: 2px solid ${theme.accentHover};
    outline-offset: -2px;
  }

  #infoBanner .ta-panel {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    padding: 0 0 20px;
    scrollbar-width: thin;
    scrollbar-color: ${theme.borderStrong} transparent;
    scroll-padding: 12px;
  }

  #infoBanner [hidden] {
    display: none !important;
  }

  #infoBanner .ta-panel-intro {
    padding: 16px 14px 10px;
  }

  #infoBanner .ta-panel-intro h3 {
    margin: 0 0 3px;
    font-size: 19px;
    font-weight: 700;
  }

  #infoBanner .ta-panel-intro p {
    margin: 0;
    font-size: 12px;
    color: ${theme.textMuted};
  }

  #infoBanner .ta-disclosure {
    margin: 10px 12px;
    border: 1px solid ${theme.border};
    border-radius: 9px;
  }

  #infoBanner .ta-disclosure h4 {
    margin: 0;
  }

  #infoBanner .ta-section-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-height: 44px;
    padding: 10px 12px;
    border: 0;
    border-radius: 8px;
    background: ${theme.surface};
    color: ${theme.text};
    font: 650 13px/1.3 system-ui, sans-serif;
    text-align: left;
    cursor: pointer;
  }

  #infoBanner .ta-section-toggle[aria-expanded="true"] {
    border-radius: 8px 8px 0 0;
    box-shadow: inset 0 -1px ${theme.border};
  }

  #infoBanner .ta-section-indicator {
    color: ${theme.accentHover};
    font-size: 16px;
  }

  #infoBanner .ta-disclosure-content {
    padding: 4px 0 6px;
  }

  #infoBanner .ta-activity-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: 8px 12px 0;
  }

  #infoBanner .ta-activity-heading h4 {
    margin: 0;
    font-size: 13px;
  }

  #infoBanner .ta-activity-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 6px;
  }

  #infoBanner .ta-activity-heading button {
    min-height: 36px;
    padding: 4px 10px;
    border: 1px solid ${theme.border};
    border-radius: 7px;
    background: ${theme.surface};
    color: ${theme.textMuted};
    cursor: pointer;
    font: 600 12px/1.25 system-ui, sans-serif;
  }

  #infoBanner .ta-activity-heading button:hover:not(:disabled) {
    border-color: ${theme.borderStrong};
    color: ${theme.text};
  }

  #infoBanner .ta-activity-heading button:disabled {
    cursor: default;
    opacity: .55;
  }

  #infoBanner .ta-activity-feedback {
    margin: 4px 12px;
    color: ${theme.textMuted};
    font-size: 12px;
  }

  #infoBanner .ta-activity-feedback:empty {
    margin: 0;
  }

  #infoBanner .ta-activity-filter {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 12px 0;
    color: ${theme.textMuted};
    font-size: 12px;
  }

  #infoBanner .ta-activity-filter select {
    min-width: 0;
    min-height: 36px;
    flex: 1;
    padding: 4px 8px;
    border: 1px solid ${theme.border};
    border-radius: 7px;
    background: ${theme.surface};
    color: ${theme.text};
    font: inherit;
  }

  #infoBanner .ta-activity-empty-filter {
    margin: 8px 12px;
    padding: 8px 10px;
    color: ${theme.textMuted};
    font-size: 13px;
  }

  #infoBanner .ta-activity-log {
    margin: 8px 12px;
    padding: 6px;
    border: 1px solid ${theme.border};
    border-radius: 9px;
    background: ${theme.surface};
    list-style: none;
    display: grid;
    gap: 6px;
    font: 13px/1.45 system-ui, sans-serif;
    overflow-wrap: anywhere;
  }

  #infoBanner .ta-activity-log:empty::before {
    content: 'No activity yet.';
    padding: 4px 6px;
    color: ${theme.textMuted};
  }

  #infoBanner .ta-activity-empty-filter:not([hidden]) + .ta-activity-log {
    display: none;
  }

  #infoBanner :is(.ta-activity-entry, .ta-activity-empty-filter)[hidden] {
    display: none;
  }

  #infoBanner .ta-activity-entry {
    min-width: 0;
    padding: 6px 8px;
    color: ${theme.textMuted};
  }

  #infoBanner .ta-activity-swipe {
    padding: 8px;
    border: 1px solid ${theme.border};
    border-radius: 7px;
    background: ${theme.backgroundElevated};
  }

  #infoBanner .ta-activity-meta {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  #infoBanner .ta-activity-time {
    margin-inline-start: auto;
    color: ${theme.textMuted};
    white-space: nowrap;
  }

  #infoBanner :is(.ta-activity-time, .ta-activity-duration, .ta-activity-timings dd) {
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  #infoBanner .ta-activity-outcome {
    padding: 2px 6px;
    border-radius: 5px;
    background: ${theme.surfaceMuted};
    color: ${theme.text};
    font-size: 12px;
  }

  #infoBanner [data-outcome="Liked"] .ta-activity-outcome {
    background: ${theme.successSoft};
    color: ${theme.success};
  }

  #infoBanner [data-outcome="Super Liked"] .ta-activity-outcome {
    background: ${theme.accentSoft};
    color: ${theme.accentHover};
  }

  #infoBanner [data-outcome="Paused"] .ta-activity-outcome {
    background: ${theme.warningSoft};
    color: ${theme.warning};
  }

  #infoBanner .ta-activity-reason {
    margin: 5px 0 0;
    color: ${theme.text};
  }

  #infoBanner .ta-activity-details {
    margin-top: 3px;
  }

  #infoBanner .ta-activity-details summary {
    display: list-item;
    width: fit-content;
    padding: 2px 0;
    cursor: pointer;
    font-size: 12px;
  }

  #infoBanner .ta-activity-details summary:hover {
    color: ${theme.text};
  }

  #infoBanner .ta-activity-details summary:focus-visible {
    outline: 2px solid ${theme.accentHover};
    outline-offset: 2px;
    border-radius: 3px;
  }

  #infoBanner .ta-activity-timings {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, max-content);
    gap: 4px 12px;
    margin: 5px 0 0;
    padding-top: 6px;
    border-top: 1px solid ${theme.border};
    font-size: 12px;
  }

  #infoBanner .ta-activity-timings dd {
    margin: 0;
    max-width: 16ch;
    text-align: right;
  }
`;

export { SIDEBAR_LAYOUT_STYLES };
