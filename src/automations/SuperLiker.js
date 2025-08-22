import { logger, generateRandomNumber } from '../misc/helper';
import { getCheckboxValue } from '../views/Sidebar';

class SuperLiker {
  selector = '.tinderAutopilotSuperLike';

  constructor() {
    this.dailyLimit = 5; // Tinder's free daily limit
    this.lastSuperLikeDate = this.getLastSuperLikeDate();
    this.todayCount = this.getTodayCount();
  }

  getLastSuperLikeDate() {
    try {
      return localStorage.getItem('TinderAutopilot/lastSuperLikeDate') || '';
    } catch (e) {
      return '';
    }
  }

  getTodayCount() {
    try {
      const today = new Date().toDateString();
      const lastDate = this.getLastSuperLikeDate();
      
      if (lastDate === today) {
        return parseInt(localStorage.getItem('TinderAutopilot/superLikeCount') || '0');
      } else {
        // Reset count for new day
        localStorage.setItem('TinderAutopilot/superLikeCount', '0');
        return 0;
      }
    } catch (e) {
      return 0;
    }
  }

  incrementSuperLikeCount() {
    try {
      const today = new Date().toDateString();
      this.todayCount++;
      localStorage.setItem('TinderAutopilot/superLikeCount', this.todayCount.toString());
      localStorage.setItem('TinderAutopilot/lastSuperLikeDate', today);
    } catch (e) {
      console.warn('Failed to update super like count', e);
    }
  }

  canSuperLike() {
    return this.todayCount < this.dailyLimit;
  }

  hasSuperLike() {
    // Try multiple selectors for Super Like button
    const selectors = [
      "button[aria-label*='Super Like']",
      "button[data-testid='super-like']",
      "button[title*='Super Like']",
      ".recsCardboard__cardsContainer button:nth-child(3)", // Middle button
      "[data-testid='gamepad-super-like']",
      "button[aria-label*='Star']"
    ];
    
    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button && button.offsetParent !== null) { // Check if visible
        return button;
      }
    }
    
    // Fallback to XPath
    try {
      const xpath = "//span[text()='Super Like']";
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
  }

  shouldSuperLike() {
    if (!this.isEnabled()) return false;
    if (!this.canSuperLike()) return false;

    // Get Super Like strategy from settings
    const strategy = this.getSuperLikeStrategy();
    
    switch (strategy) {
      case 'random':
        // 10% chance to Super Like
        return Math.random() < 0.1;
      
      case 'verified':
        // Super Like verified profiles only
        return this.isProfileVerified();
      
      case 'photos':
        // Super Like profiles with many photos
        return this.getPhotoCount() >= 5;
      
      case 'distance':
        // Super Like nearby profiles
        const distance = this.getDistance();
        return distance && distance.value <= 10;
      
      default:
        return false;
    }
  }

  isEnabled() {
    try {
      const checkbox = document.querySelector(`${this.selector} .toggleSwitch > div`);
      return checkbox && checkbox.style.cssText.includes('background: linear-gradient(135deg, #ff6b35, #ff8c42)');
    } catch (e) {
      return false;
    }
  }

  getSuperLikeStrategy() {
    try {
      return localStorage.getItem('TinderAutopilot/superLikeStrategy') || 'random';
    } catch (e) {
      return 'random';
    }
  }

  isProfileVerified() {
    const verifiedSelectors = [
      '[data-testid="verified"]',
      '.verified',
      '[class*="verified"]',
      '[aria-label*="verified"]',
      '.checkmark',
      '[class*="checkmark"]'
    ];

    for (const selector of verifiedSelectors) {
      const element = document.querySelector(selector);
      if (element) return true;
    }

    return false;
  }

  getPhotoCount() {
    const photoSelectors = [
      '.keen-slider__slide img',
      '[data-testid="photo"]',
      '.slider img'
    ];

    let maxCount = 0;
    for (const selector of photoSelectors) {
      const photos = document.querySelectorAll(selector);
      maxCount = Math.max(maxCount, photos.length);
    }

    return maxCount || 1;
  }

  getDistance() {
    const distanceSelectors = [
      '[data-testid="distance"]',
      '[class*="distance"]',
      '[class*="miles"]',
      '[class*="km"]'
    ];

    for (const selector of distanceSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent;
        const match = text.match(/(\d+)\s*(miles?|km|kilometers?)/i);
        if (match) {
          return {
            value: parseInt(match[1]),
            unit: match[2].toLowerCase()
          };
        }
      }
    }

    return null;
  }

  pressSuperLike() {
    const superLikeButton = this.hasSuperLike();
    if (!superLikeButton) return false;

    if (this.shouldSuperLike()) {
      superLikeButton.click();
      this.incrementSuperLikeCount();
      
      // Update counter in UI
      const counterElement = document.getElementById('superLikeCount');
      if (counterElement) {
        counterElement.innerHTML = parseInt(counterElement.innerHTML, 10) + 1;
      }
      
      logger(`⭐ Super Like used! (${this.todayCount}/${this.dailyLimit} today)`);
      return true;
    }

    return false;
  }

  getRemainingCount() {
    return Math.max(0, this.dailyLimit - this.todayCount);
  }
}

export default SuperLiker;
