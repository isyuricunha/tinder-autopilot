import {
  createAutopilot,
  createAiSettings,
  createCounterLogs,
  createElement,
  createInfoBanner,
  createLoggerHeader,
  createMassMessage,
  createTopBanner
} from './templates';
import { SIDEBAR_THEME } from './sidebar-theme';

const createSidebarElement = () => {
  const element = document.createElement('aside');
  element.className = 'H(100%) Fld(c) Pos(r) Flxg(0) Fxs(0) Flxb(25%) Miw(325px) Maw(375px)';
  element.style.cssText = `background: ${SIDEBAR_THEME.background}; color: ${SIDEBAR_THEME.text}; z-index: 9999999; border-right: 1px solid ${SIDEBAR_THEME.border}; box-shadow: 4px 0 24px ${SIDEBAR_THEME.shadow};`;
  element.appendChild(createInfoBanner());
  return element;
};

const clearChildren = (element) => {
  if (!element) return false;

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  return true;
};

const createResetCountersButton = () =>
  createElement('div', { style: 'margin: 0 12px 12px 12px; display: flex; gap: 8px;' }, [
    createElement('button', {
      id: 'resetCounters',
      text: 'Reset Counters',
      style: `width: 100%; padding: 8px 12px; background: ${SIDEBAR_THEME.accentGradient}; color: ${SIDEBAR_THEME.text}; border: 1px solid ${SIDEBAR_THEME.accentBorder}; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px ${SIDEBAR_THEME.focusShadow};`,
      attributes: { type: 'button' }
    })
  ]);

const createActivityLog = () =>
  createElement('div', {
    className: 'txt',
    style: `overflow-y: auto; height: auto; max-height: 250px; margin: 12px; padding: 12px; background: ${SIDEBAR_THEME.surface}; border-radius: 8px; border: 1px solid ${SIDEBAR_THEME.border}; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; font-size: 11px; line-height: 1.4;`
  });

const renderSidebarContent = (container) => {
  if (!clearChildren(container)) return false;

  const scrollContainer = createElement(
    'div',
    {
      className: 'custom-scrollbar',
      style: `background: ${SIDEBAR_THEME.background}; padding-bottom: 24px; font-size: 16px; height: 100%; overflow-x: hidden; overflow-y: auto; scrollbar-width: thin; scrollbar-color: ${SIDEBAR_THEME.accent} ${SIDEBAR_THEME.surfaceMuted}; color: ${SIDEBAR_THEME.text};`
    },
    [
      createTopBanner(),
      createCounterLogs(),
      createResetCountersButton(),
      createAutopilot(),
      createMassMessage(),
      createLoggerHeader(),
      createActivityLog(),
      createAiSettings()
    ]
  );

  container.appendChild(
    createElement('nav', { style: `position: relative; height: 100%; background: ${SIDEBAR_THEME.background};` }, [
      createElement('div', { style: 'height: 100%;' }, [
        createElement(
          'div',
          {
            style: `overflow: hidden; background: ${SIDEBAR_THEME.background}; position: relative; height: 100%;`
          },
          [scrollContainer]
        )
      ])
    ])
  );

  return true;
};

export { createSidebarElement, renderSidebarContent };
