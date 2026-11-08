import { logger, warnLog } from '../misc/helper';
import { extractProfileContext, parseProfileDistance } from '../misc/profile-context-extractor';
import { getActiveProfileSurface, isVisibleProfileElement } from '../misc/profile-identity';
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

  shouldSuperLike(surface) {
    const profile = surface === document ? {} : extractProfileContext(surface);
    return shouldUseSuperLike({
      isEnabled: this.isEnabled(),
      canSuperLike: this.canSuperLike(),
      strategy: this.getSuperLikeStrategy(),
      isVerified: this.isProfileVerified(surface),
      photoCount: profile.photoCount,
      distance: parseProfileDistance(profile.distance)
    });
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

  isProfileVerified(surface) {
    if (surface === document) return false;
    const badge = surface.querySelector('[data-testid="verified"], [aria-label="Photo Verified" i]');
    if (isVisibleProfileElement(badge)) return true;

    return Array.from(surface.querySelectorAll('svg title')).some((title) =>
      /^(?:photo verified|foto verificada)$/i.test(title.textContent.trim()) &&
      isVisibleProfileElement(title.ownerSVGElement || title.parentElement)
    );
  }

  pressSuperLike() {
    if (!this.isEnabled() || !this.canSuperLike()) return false;
    const superLikeButton = this.hasSuperLike();
    if (!superLikeButton) return false;

    if (this.shouldSuperLike(getActiveProfileSurface(document))) {
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
