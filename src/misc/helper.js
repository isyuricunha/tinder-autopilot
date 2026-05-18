import { isDebugEnabled } from './settings-store';

const generateRandomNumber = (min = 800, max = 1500) => {
  return Math.random() * (max - min) + min;
};

const randomDelay = async () => {
  const rand = generateRandomNumber(350, 600);
  return new Promise((resolve) => setTimeout(resolve, rand));
};

const writeConsole = (level, values) => {
  if ((level === 'debug' || level === 'info') && !isDebugEnabled()) return;
  const consoleMethod = console[level] || console.log;
  consoleMethod.apply(console, values);
};

const debugLog = (...values) => writeConsole('debug', values);

const warnLog = (...values) => writeConsole('warn', values);

const errorLog = (...values) => writeConsole('error', values);

const logger = (v, level = 'info') => {
  writeConsole(level, [v]);
  const now = new Date();
  const txt = document.querySelector('.txt');
  if (!txt) return; // CRITICAL: Prevent memory leak - exit if no log container

  const message = document.createElement('p');
  message.className =
    'settings__bottomSubtitle Px(12px)--s Px(17px)--ml Lts(0) Fw($regular) C($c-secondary) Fz($xs) Ta(s)';

  const timestamp = document.createElement('span');
  timestamp.textContent = `${`0${now.getHours()}`.slice(-2)}:${`0${now.getMinutes()}`.slice(
    -2
  )}:${`0${now.getSeconds()}`.slice(-2)}. `;

  message.appendChild(timestamp);
  message.appendChild(document.createTextNode(String(v)));
  txt.prepend(message);

  // CRITICAL FIX: Limit DOM accumulation to 50 lines max
  // Remove old logs to prevent memory leak
  const paragraphs = txt.querySelectorAll('p');
  if (paragraphs.length > 50) {
    // Remove oldest paragraphs (they're at the end since we prepend)
    for (let i = paragraphs.length - 1; i >= 50; i--) {
      paragraphs[i].remove();
    }
  }
};

const waitUntilElementExists = (selector, callback, timeout = 30000) => {
  const el = document.querySelector(selector);
  if (el) {
    callback(el);
    return () => {};
  }

  let isDone = false;
  let timeoutId;

  const observer = new MutationObserver(() => {
    const element = document.querySelector(selector);
    if (!element || isDone) return;

    isDone = true;
    clearTimeout(timeoutId);
    observer.disconnect();
    callback(element);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  timeoutId = setTimeout(() => {
    isDone = true;
    observer.disconnect();
  }, timeout);

  return () => {
    isDone = true;
    clearTimeout(timeoutId);
    observer.disconnect();
  };
};

export {
  logger,
  debugLog,
  warnLog,
  errorLog,
  randomDelay,
  generateRandomNumber,
  waitUntilElementExists
};
