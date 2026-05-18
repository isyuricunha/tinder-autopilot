import {
  createAutopilot,
  createCounterLogs,
  createElement,
  createInfoBanner,
  createLoggerHeader,
  createMassMessage,
  createTopBanner
} from './templates';

const createSidebarElement = () => {
  const element = document.createElement('aside');
  element.className = 'H(100%) Fld(c) Pos(r) Flxg(0) Fxs(0) Flxb(25%) Miw(325px) Maw(375px)';
  element.style.cssText =
    'background: #000000; color: #ffffff; z-index: 9999999; border-right: 1px solid #333333; box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);';
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
  createElement('div', { style: 'margin: 0 12px 16px 12px; display: flex; gap: 8px;' }, [
    createElement('button', {
      id: 'resetCounters',
      text: 'Reset Counters',
      style:
        'width: 100%; padding: 10px 16px; background: linear-gradient(135deg, #ff6b35, #ff8c42); color: #000000; border: none; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);',
      attributes: { type: 'button' }
    })
  ]);

const createActivityLog = () =>
  createElement('div', {
    className: 'txt',
    style:
      "overflow-y: auto; height: auto; max-height: 250px; margin: 12px; padding: 12px; background: #1a1a1a; border-radius: 12px; border: 1px solid #333333; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; font-size: 11px; line-height: 1.4;"
  });

const renderSidebarContent = (container) => {
  if (!clearChildren(container)) return false;

  const scrollContainer = createElement(
    'div',
    {
      className: 'custom-scrollbar',
      style:
        'background: #000000; padding-bottom: 24px; font-size: 16px; height: 100%; overflow-x: hidden; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #ff6b35 #1a1a1a; color: #ffffff;'
    },
    [
      createTopBanner(),
      createCounterLogs(),
      createResetCountersButton(),
      createAutopilot(),
      createMassMessage(),
      createLoggerHeader(),
      createActivityLog()
    ]
  );

  container.appendChild(
    createElement('nav', { style: 'position: relative; height: 100%; background: #000000;' }, [
      createElement('div', { style: 'height: 100%;' }, [
        createElement(
          'div',
          { style: 'overflow: hidden; background: #000000; position: relative; height: 100%;' },
          [scrollContainer]
        )
      ])
    ])
  );

  return true;
};

export { createSidebarElement, renderSidebarContent };
