import { logger, warnLog } from '../misc/helper';
import { extractProfileContext, parseProfileDistance } from '../misc/profile-context-extractor';
import { shouldUseSuperLike } from '../misc/super-like-rules';
import { findSuperLikeButton } from '../misc/tinder-dom-detectors';
import { getSetting, setSetting } from '../misc/settings-store';
import { getCheckboxValue } from '../views/toggle-control';

class SuperLiker {
  selector = '.tinderAutopilotSuperLike';

  constructor() {
    this.dailyLimit = 5; // Tinder's free daily limit
    this.lastSuperLikeDate = this.getLastSuperLikeDate();
    this.todayCount = this.getTodayCount();
  }

  getLastSuperLikeDate() {
    try {
      return getSetting('lastSuperLikeDate');
    } catch (e) {
      return '';
    }
  }

  getTodayCount() {
    try {
      const today = new Date().toDateString();
      const lastDate = this.getLastSuperLikeDate();

      if (lastDate === today) {
        return parseInt(getSetting('superLikeCount', '0'));
      } else {
        // Reset count for new day
        setSetting('superLikeCount', '0');
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
      setSetting('superLikeCount', this.todayCount.toString());
      setSetting('lastSuperLikeDate', today);
    } catch (e) {
      warnLog('Failed to update super like count', e);
    }
  }

  canSuperLike() {
    return this.todayCount < this.dailyLimit;
  }

  hasSuperLike() {
    const detectedSuperLike = findSuperLikeButton(document);
    if (detectedSuperLike) return detectedSuperLike;

    const selectors = [
      "button[aria-label*='Super Like' i]",
      "button[data-testid*='super-like' i]",
      "button[title*='Super Like' i]",
      "[data-testid*='gamepad-super-like' i]",
      "button[aria-label*='Star' i]"
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button && button.offsetParent !== null) {
        // Check if visible
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

  getProfileContext() {
    try {
      return extractProfileContext(document);
    } catch (_error) {
      return {};
    }
  }

  shouldSuperLike(profileContext = this.getProfileContext()) {
    const strategy = this.getSuperLikeStrategy();
    const decisionInput = {
      isEnabled: this.isEnabled(),
      canSuperLike: this.canSuperLike(),
      strategy,
      randomValue: Math.random()
    };

    switch (strategy) {
      case 'verified':
        decisionInput.isVerified = this.isProfileVerified();
        break;
      case 'photos':
        decisionInput.photoCount = this.getPhotoCount(profileContext);
        break;
      case 'distance':
        decisionInput.distance = this.getDistance(profileContext);
        break;
      default:
        break;
    }

    return shouldUseSuperLike(decisionInput);
  }

  isEnabled() {
    return getCheckboxValue(this.selector);
  }

  getSuperLikeStrategy() {
    try {
      return getSetting('superLikeStrategy', 'random');
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

  getPhotoCount(profileContext = this.getProfileContext()) {
    if (profileContext.photoCount) return profileContext.photoCount;

    const photoSelectors = ['.keen-slider__slide img', '[data-testid="photo"]', '.slider img'];

    let maxCount = 0;
    for (const selector of photoSelectors) {
      const photos = document.querySelectorAll(selector);
      maxCount = Math.max(maxCount, photos.length);
    }

    return maxCount || 1;
  }

  getDistance(profileContext = this.getProfileContext()) {
    const profileDistance = parseProfileDistance(profileContext.distance);
    if (profileDistance) return profileDistance;

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

    const profileContext = this.getProfileContext();

    if (this.shouldSuperLike(profileContext)) {
      superLikeButton.click();
      this.incrementSuperLikeCount();

      // Update counter in UI
      const counterElement = document.getElementById('superLikeCount');
      if (counterElement) {
        counterElement.textContent = parseInt(counterElement.textContent, 10) + 1;
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
