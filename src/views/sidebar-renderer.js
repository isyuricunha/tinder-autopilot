import { getSetting, setSetting } from '../misc/settings-store';
import { insertCss } from '../misc/insert-css';
import {
  createCounterLogs,
  createElement,
  createGeneralSettings,
  createInfoBanner,
  createMessageSettings,
  createOperationalStatus,
  createSwipeSettings,
  createTopBanner
} from './templates';
import { SIDEBAR_LAYOUT_STYLES } from './sidebar-layout-styles';
import { SIDEBAR_THEME } from './sidebar-theme';

const ACTIVE_PANEL_SETTING = 'sidebarActivePanel';

const createSidebarElement = () => {
  const element = document.createElement('aside');
  element.setAttribute('aria-label', 'Tinder Autopilot');
  element.style.cssText = `height: 100%; flex: 0 0 clamp(290px, 25vw, 375px); max-width: 100%; min-width: 0; position: relative; background: ${SIDEBAR_THEME.background}; color: ${SIDEBAR_THEME.text}; z-index: 9999999; border-right: 1px solid ${SIDEBAR_THEME.border}; box-shadow: 4px 0 24px ${SIDEBAR_THEME.shadow};`;
  element.appendChild(createInfoBanner());
  return element;
};

const createActivityHeading = (title, buttonId, buttonLabel) =>
  createElement('div', { className: 'ta-activity-heading' }, [
    createElement('h4', { text: title }),
    createElement('button', {
      id: buttonId,
      text: buttonLabel,
      attributes: { type: 'button' }
    })
  ]);

const createActivity = () => [
  createActivityHeading('Swipe totals', 'resetCounters', 'Reset totals'),
  createCounterLogs(),
  createActivityHeading('Activity log', 'clearActivityLog', 'Clear log'),
  createElement('ol', {
    className: 'ta-activity-log',
    attributes: { role: 'list', 'aria-label': 'Recent activity' }
  })
];

const createSidebarNavigation = () => {
  const tabs = [
    { id: 'swipes', label: 'Swipes', description: 'Run Auto Like and choose which profiles to skip.', render: createSwipeSettings },
    { id: 'messages', label: 'Messages', description: 'Manage message automation and test AI replies.', render: createMessageSettings },
    { id: 'settings', label: 'Settings', description: 'Manage the shared AI connection and privacy.', render: createGeneralSettings },
    { id: 'activity', label: 'Activity', description: 'Review swipe totals and recent automation events.', render: createActivity }
  ].map(({ id, label, description, render }) => {
    const tabId = `ta-tab-${id}`;
    const panelId = `ta-panel-${id}`;
    const tab = createElement('button', {
      id: tabId,
      text: label,
      attributes: { type: 'button', role: 'tab', 'aria-controls': panelId }
    });
    const panel = createElement(
      'section',
      {
        id: panelId,
        className: 'ta-panel custom-scrollbar',
        attributes: { role: 'tabpanel', 'aria-labelledby': tabId, tabindex: '0' }
      },
      [
        createElement('div', { className: 'ta-panel-intro' }, [
          createElement('h3', { text: label }),
          createElement('p', { text: description })
        ]),
        render()
      ]
    );
    return { id, tab, panel };
  });

  const activateTab = (index) => {
    tabs.forEach(({ tab, panel }, position) => {
      const active = position === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
    });
  };

  const selectTab = (index) => {
    activateTab(index);
    setSetting(ACTIVE_PANEL_SETTING, tabs[index].id);
  };

  tabs.forEach(({ tab }, index) => {
    tab.addEventListener('click', () => selectTab(index));
    tab.addEventListener('keydown', (event) => {
      let nextIndex;
      switch (event.key) {
        case 'ArrowLeft':
          nextIndex = (index + tabs.length - 1) % tabs.length;
          break;
        case 'ArrowRight':
          nextIndex = (index + 1) % tabs.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = tabs.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      selectTab(nextIndex);
      tabs[nextIndex].tab.focus();
    });
  });

  const savedPanel = getSetting(ACTIVE_PANEL_SETTING);
  activateTab(Math.max(0, tabs.findIndex(({ id }) => id === savedPanel)));

  return {
    tablist: createElement('div', {
      className: 'ta-sidebar-tabs',
      attributes: { role: 'tablist', 'aria-label': 'Autopilot sections' }
    }, tabs.map(({ tab }) => tab)),
    panels: tabs.map(({ panel }) => panel)
  };
};

const renderSidebarContent = (container) => {
  if (!container) return false;

  insertCss(SIDEBAR_LAYOUT_STYLES, { id: 'sidebar-layout' });
  const { tablist, panels } = createSidebarNavigation();
  container.replaceChildren(
    createElement('div', { className: 'ta-sidebar-layout' }, [
      createTopBanner(),
      createOperationalStatus(),
      tablist,
      panels
    ])
  );
  return true;
};

export { createSidebarElement, renderSidebarContent };
