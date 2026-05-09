const generateRandomNumber = (min = 800, max = 1500) => {
  return Math.random() * (max - min) + min;
};

const randomDelay = async () => {
  const rand = generateRandomNumber(350, 600);
  return new Promise((resolve) => setTimeout(resolve, rand));
};

const logger = (v) => {
  console.log(v);
  const now = new Date();
  const txt = document.querySelector('.txt');
  if (!txt) return; // CRITICAL: Prevent memory leak - exit if no log container

  const message = /* html */ `<p class="settings__bottomSubtitle Px(12px)--s Px(17px)--ml Lts(0) Fw($regular) C($c-secondary) Fz($xs) Ta(s)"><span>
  ${`0${now.getHours()}`.slice(-2)}:${`0${now.getMinutes()}`.slice(
    -2
  )}:${`0${now.getSeconds()}`.slice(-2)}.</span>
  ${v}</span></p>`;
  txt.innerHTML = message + txt.innerHTML;

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

const waitUntilElementExists = (selector, callback) => {
  const el = document.querySelector(selector);
  if (el) {
    callback(el);
  }
  setTimeout(() => waitUntilElementExists(selector, callback), 500);
};

export { logger, randomDelay, generateRandomNumber, waitUntilElementExists };
