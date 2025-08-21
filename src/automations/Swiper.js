import { logger, generateRandomNumber } from '../misc/helper';
import Interactions from '../misc/Interactions';

class Swiper {
  selector = '.tinderAutopilot';

  isRunning = false;

  constructor() {
    this.interactions = new Interactions();
  }

  start = () => {
    logger('Starting to swipe using a randomized interval');
    this.isRunning = true;
    this.run();
  };

  stop = () => {
    this.isRunning = false;
    logger('Autopilot stopped ⛔️');
  };

  canSwipe = () => {
    return this.hasLike() && !document.querySelector('.beacon__circle');
  };

  hasLike = () => {
    // Try multiple selectors for like button (Tinder UI changes frequently)
    const selectors = [
      "button[aria-label*='Like']",
      "button[data-testid='like']",
      "button[title*='Like']",
      ".recsCardboard__cardsContainer button:last-child",
      "[data-testid='gamepad-like']"
    ];
    
    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button && button.offsetParent !== null) { // Check if visible
        return button;
      }
    }
    
    // Fallback to XPath
    try {
      const xpath = "//span[text()='Like']";
      const matchingElement = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      return matchingElement?.closest('button');
    } catch (e) {
      return null;
    }
  };

  pressLike = () => {
    const likeButton = this.hasLike();
    if (!likeButton && !this.canSwipe()) {
      return false;
    }

    likeButton.click();
    document.getElementById('likeCount').innerHTML =
      parseInt(document.getElementById('likeCount').innerHTML, 10) + 1;
    return true;
  };

  matchFound = () => {
    // Try multiple selectors for match modal close button
    const selectors = [
      'button[aria-label="Close"]',
      'button[title="Back to Tinder"]',
      '[data-testid="matchModalCloseButton"]',
      '.modal button[aria-label*="Close"]',
      '.matchModal button:first-child'
    ];
    
    for (const selector of selectors) {
      const buttons = document.querySelectorAll(selector);
      if (buttons.length > 0) {
        const button = buttons[0];
        if (button && button.offsetParent !== null) {
          document.getElementById('matchCount').innerHTML =
            parseInt(document.getElementById('matchCount').innerHTML, 10) + 1;
          logger("Congrats! We've got a match! 🤡");
          button.click();
          return true;
        }
      }
    }
    
    return false;
  };

  run = () => {
    if (!this.isRunning) {
      return;
    }

    // Must be on matches page
    if (!this.interactions.isOnMatchesPage()) {
      logger('Going to main page to start liking');
      this.interactions.goToMainPage();

      const waitForMatchPage = setInterval(() => {
        if (this.interactions.isOnMatchesPage()) {
          clearInterval(waitForMatchPage);
          setTimeout(this.run, generateRandomNumber());
        }
      }, 250);
    }

    if (this.interactions.closeInstructions()) {
      setTimeout(this.run, generateRandomNumber());
      return;
    }

    if (this.interactions.closeModal()) {
      setTimeout(this.run, generateRandomNumber());
      return;
    }

    if (this.interactions.closeMatchFound()) {
      setTimeout(this.run, generateRandomNumber());
      return;
    }

    if (!this.canSwipe()) {
      logger('No profiles found. Waiting 4s');
      setTimeout(this.run, generateRandomNumber(3000, 4000));
      return;
    }

    // Keep Swiping
    if (this.matchFound()) {
      setTimeout(this.run, generateRandomNumber(500, 900));
      return;
    }

    // What we came here to do, swipe right!
    if (this.pressLike()) {
      setTimeout(this.run, generateRandomNumber(500, 900));
      return;
    }

    logger('No profiles found. Waiting 4s');
    setTimeout(this.run, generateRandomNumber(3000, 4000));
  };
}

export default Swiper;
