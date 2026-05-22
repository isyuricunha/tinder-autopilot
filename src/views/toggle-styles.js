const { SIDEBAR_THEME } = require('./sidebar-theme');

const onToggle = `display: flex; align-items: center; justify-content: center; border-radius: 20px; width: 56px; height: 32px; border: 1px solid ${SIDEBAR_THEME.accent}; transition: all 0.2s ease; background: ${SIDEBAR_THEME.accentGradient}; box-shadow: 0 0 0 1px ${SIDEBAR_THEME.accentBorder}, 0 8px 18px ${SIDEBAR_THEME.shadow}`;
const onToggleInner = `border-radius: 50%; background: ${SIDEBAR_THEME.background}; border: 1px solid rgba(255, 255, 255, 0.42); width: 24px; height: 24px; transition: all 0.2s ease; transform: translateX(12px); box-shadow: 0 2px 8px ${SIDEBAR_THEME.shadow}`;

const offToggle = `display: flex; align-items: center; justify-content: center; border-radius: 20px; width: 56px; height: 32px; border: 1px solid ${SIDEBAR_THEME.borderStrong}; transition: all 0.2s ease; background: ${SIDEBAR_THEME.surfaceMuted}; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03)`;
const offToggleInner = `border-radius: 50%; background: ${SIDEBAR_THEME.backgroundElevated}; border: 1px solid ${SIDEBAR_THEME.borderStrong}; width: 24px; height: 24px; transition: all 0.2s ease; transform: translateX(-12px); box-shadow: 0 2px 8px ${SIDEBAR_THEME.shadow}`;

module.exports = {
  onToggle,
  onToggleInner,
  offToggle,
  offToggleInner
};
