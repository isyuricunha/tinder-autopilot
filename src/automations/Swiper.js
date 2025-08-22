import { logger, generateRandomNumber } from '../misc/helper';
import Interactions from '../misc/Interactions';
import ProfileAnalyzer from './ProfileAnalyzer';
import SuperLiker from './SuperLiker';

class Swiper {
  selector = '.tinderAutopilot';

  isRunning = false;

  constructor() {
    this.interactions = new Interactions();
    this.profileAnalyzer = new ProfileAnalyzer();
    this.superLiker = new SuperLiker();
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
    const likeButton = this.hasLike();
    const hasProfile = this.hasProfile();
    const noBlockingModals = !document.querySelector('.beacon__circle') && 
                            !document.querySelector('[data-testid="modal"]') &&
                            !document.querySelector('.modal') &&
                            !document.querySelector('[role="dialog"]');
    
    if (!likeButton) {
      logger('🔍 Debug: No like button found');
    }
    if (!hasProfile) {
      logger('🔍 Debug: No profile detected');
    }
    
    return likeButton && hasProfile && noBlockingModals;
  };

  hasProfile = () => {
    // Updated selectors for current Tinder UI (2024)
    const profileSelectors = [
      // Main card containers
      '[data-testid="card-stack"]',
      '[data-testid="profileCard"]', 
      '.recsCardboard__card',
      '.Expand.enterAnimationContainer > div',
      
      // Image containers
      '.keen-slider__slide:not(.keen-slider__slide--clone)',
      '.StretchedBox img',
      
      // Profile content areas
      '[data-testid="card-stack"] > div > div',
      '.gamepad-card',
      '.profileCard',
      
      // Fallback selectors
      '.Expand',
      '.StretchedBox'
    ];

    console.log('🔍 Checking for profile...');
    
    for (const selector of profileSelectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`  ${selector}: ${elements.length} elements`);
      
      for (const element of elements) {
        if (element && element.offsetParent !== null && element.offsetWidth > 0 && element.offsetHeight > 0) {
          console.log(`✅ Profile found with selector: ${selector}`);
          return true;
        }
      }
    }

    // Check for profile images specifically
    const imageSelectors = [
      'img[src*="images-ssl.gotinder.com"]',
      'img[src*="gotinder.com"]',
      'img[src*="tinder"]',
      '.keen-slider img',
      '[data-testid="card-stack"] img'
    ];
    
    for (const selector of imageSelectors) {
      const images = document.querySelectorAll(selector);
      console.log(`  Images ${selector}: ${images.length} found`);
      if (images.length > 0) {
        for (const img of images) {
          if (img.offsetParent !== null && img.complete && img.naturalWidth > 0) {
            console.log(`✅ Profile image found: ${img.src.substring(0, 50)}...`);
            return true;
          }
        }
      }
    }

    console.log('❌ No profile detected');
    return false;
  };

  hasLike = () => {
    // Prefer explicit Like selectors and exclude Boost
    const positiveSelectors = [
      "button[aria-label='Like']",
      "button[aria-label*='Like']",
      "button[data-testid='like']",
      "button[data-testid='gamepad-like']",
      "button[data-testid='gamepad-like-button']",
      "button[title='Like']",
      "button[title*='Like']",
      ".gamepad__button--like"
    ];

    // Search within the gamepad/footer area if present to reduce false positives
    const gamepadContainers = [
      document.querySelector('[data-testid="gamepad"]'),
      document.querySelector('.gamepad'),
      document.querySelector('.Pos\\(a\\).B\\(0\\).Start\\(0\\).End\\(0\\)')
    ].filter(Boolean);

    const candidates = [];

    if (gamepadContainers.length) {
      for (const container of gamepadContainers) {
        for (const sel of positiveSelectors) {
          container.querySelectorAll(sel).forEach((btn) => candidates.push(btn));
        }
      }
    } else {
      // Fallback to document-wide search
      for (const sel of positiveSelectors) {
        document.querySelectorAll(sel).forEach((btn) => candidates.push(btn));
      }
    }

    // Filter out Boost and non-visible/disabled
    const like = candidates.find((btn) => {
      if (!btn || btn.disabled || btn.offsetParent === null) return false;
      const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
      const title = (btn.getAttribute('title') || '').toLowerCase();
      const dtid = (btn.getAttribute('data-testid') || '').toLowerCase();
      const text = (btn.textContent || '').toLowerCase();
      const content = `${aria} ${title} ${dtid} ${text}`;
      const isLike = content.includes('like');
      const isBoost = content.includes('boost');
      return isLike && !isBoost;
    });

    if (like) return like;

    // XPath fallback strictly for Like and excluding Boost
    try {
      const xpaths = [
        "//button[translate(@aria-label,'LIKE','like')='like']",
        "//button[contains(translate(@aria-label,'LIKE','like'),'like') and not(contains(translate(@aria-label,'BOOST','boost'),'boost'))]",
        "//button[contains(translate(@title,'LIKE','like'),'like') and not(contains(translate(@title,'BOOST','boost'),'boost'))]",
        "//span[normalize-space(.)='Like']/ancestor::button[1]"
      ];

      for (const xpath of xpaths) {
        const node = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (node && node.offsetParent !== null) return node.closest('button') || node;
      }
    } catch (e) {
      console.warn('XPath fallback failed', e);
    }

    return null;
  };

  getLikeInterval = () => {
    try {
      const stored = localStorage.getItem('TinderAutopilot/likeInterval');
      return stored ? parseInt(stored) * 1000 : 3000; // Convert to milliseconds
    } catch (e) {
      return 3000; // Default 3 seconds
    }
  };

  pressLike = () => {
    const likeButton = this.hasLike();
    if (!likeButton && !this.canSwipe()) {
      return false;
    }

    // Check if profile should be skipped based on bio
    if (this.profileAnalyzer.shouldSkipProfile()) {
      // Skip this profile by pressing dislike instead
      const dislikeButton = this.hasDislike();
      if (dislikeButton) {
        dislikeButton.click();
        logger('⏭️ Skipped profile due to bio filter');
        return true;
      }
    }

    likeButton.click();
    document.getElementById('likeCount').innerHTML =
      parseInt(document.getElementById('likeCount').innerHTML, 10) + 1;
    return true;
  };

  hasDislike = () => {
    const selectors = [
      "button[aria-label*='Pass']",
      "button[data-testid='dislike']",
      "button[title*='Pass']",
      ".recsCardboard__cardsContainer button:first-child",
      "[data-testid='gamepad-dislike']"
    ];
    
    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button && button.offsetParent !== null) {
        return button;
      }
    }
    
    return null;
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

    // Try Super Like first if enabled and conditions are met
    if (this.superLiker.pressSuperLike()) {
      const interval = this.getLikeInterval();
      setTimeout(this.run, interval);
      return;
    }

    // What we came here to do, swipe right!
    if (this.pressLike()) {
      const interval = this.getLikeInterval();
      setTimeout(this.run, interval);
      return;
    }

    logger('No profiles found. Waiting 4s');
    setTimeout(this.run, generateRandomNumber(3000, 4000));
  };
}

export default Swiper;
