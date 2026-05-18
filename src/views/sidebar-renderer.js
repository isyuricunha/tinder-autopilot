import { topBanner, autopilot, infoBanner, massMessage, loggerHeader, counterLogs } from './templates';

const createSidebarElement = () => {
  const element = document.createElement('aside');
  element.className = 'H(100%) Fld(c) Pos(r) Flxg(0) Fxs(0) Flxb(25%) Miw(325px) Maw(375px)';
  element.style.cssText =
    'background: #000000; color: #ffffff; z-index: 9999999; border-right: 1px solid #333333; box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);';
  element.innerHTML = infoBanner;
  return element;
};

const sidebarContent = () => `
  <nav style="position: relative; height: 100%; background: #000000;">
    <div style="height: 100%;">
      <div style="overflow: hidden; background: #000000; position: relative; height: 100%;">
        <div style="background: #000000; padding-bottom: 24px; font-size: 16px; height: 100%; overflow-x: hidden; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #ff6b35 #1a1a1a; color: #ffffff;" class="custom-scrollbar">
          ${topBanner}
          ${counterLogs(0, 0, 0)}
          <div style="margin: 0 12px 16px 12px; display: flex; gap: 8px;">
            <button id="resetCounters" style="width: 100%; padding: 10px 16px; background: linear-gradient(135deg, #ff6b35, #ff8c42); color: #000000; border: none; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);">Reset Counters</button>
          </div>
          ${autopilot}
          ${massMessage}
          ${loggerHeader}
          <div class="txt" style="overflow-y: auto; height: auto; max-height: 250px; margin: 12px; padding: 12px; background: #1a1a1a; border-radius: 12px; border: 1px solid #333333; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; font-size: 11px; line-height: 1.4;"></div>
        </div>
      </div>
    </div>
  </nav>
`;

const renderSidebarContent = (container) => {
  container.innerHTML = sidebarContent();
};

export { createSidebarElement, renderSidebarContent };
