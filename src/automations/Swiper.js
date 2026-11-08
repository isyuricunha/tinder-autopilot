import { debugLog, logger, generateRandomNumber } from '../misc/helper';
import { incrementCounter } from '../misc/counter-store';
import Interactions from '../misc/Interactions';
import ProfileAnalyzer from './ProfileAnalyzer';
import SuperLiker from './SuperLiker';
import {
  findDislikeButton,
  findLikeButton,
  findVisibleDialog
} from '../misc/tinder-dom-detectors';
import { hasEnabledBioBlacklist } from '../misc/profile-filter-state';
import {
  getActiveProfileCard,
  getActiveProfileSurface,
  getProfileIdentity
} from '../misc/profile-identity';
import {
  KEYBOARD_SHORTCUT_EVENT_TYPES,
  buildKeyboardShortcutEventInit,
  getKeyboardShortcutTarget
} from '../misc/keyboard-shortcut-events';
import {
  canRetrySwipeActionForProfile,
  canUseSwipeActionButton,
  clearProfileActionFailure,
  hasProfileAdvanced,
  incrementProfileActionFailure,
  shouldStopAfterProfileActionFailures
} from '../misc/swipe-action-state';
import {
  shouldSkipProfileCheckAction,
  shouldStopProfileCheckAction
} from '../misc/profile-check-result';

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

class Swiper {
  selector = '.tinderAutopilot';

  isRunning = false;

  isProcessingSwipe = false;

  profileFirstSeen = {};

  profileActionFailures = {};

  maxProfileActionFailures = 2;

  activeTimers = new Set();

  activeIntervals = new Set();

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
    this.isProcessingSwipe = false;
    logger('Autopilot stopped ⛔️');
    this.clearAllTimers();
  };

  clearAllTimers = () => {
    this.activeTimers.forEach((timerId) => {
      clearTimeout(timerId);
    });
    this.activeTimers.clear();
    this.activeIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.activeIntervals.clear();
    logger('🧹 Cleared all active timers');
  };

  scheduleRun = (delay) => {
    if (!this.isRunning) return null;

    const timerId = setTimeout(() => {
      this.activeTimers.delete(timerId);
      this.run();
    }, delay);
    this.activeTimers.add(timerId);
    return timerId;
  };

  scheduleInterval = (callback, delay) => {
    if (!this.isRunning) return null;

    const intervalId = setInterval(callback, delay);
    this.activeIntervals.add(intervalId);
    return intervalId;
  };

  clearIntervalById = (intervalId) => {
    if (!intervalId) return;

    clearInterval(intervalId);
    this.activeIntervals.delete(intervalId);
  };

  scheduleProfileCleanup = (profileId) => {
    // Limit profileFirstSeen to 100 entries max
    const keys = Object.keys(this.profileFirstSeen);
    if (keys.length > 100) {
      // Remove oldest entries
      const toRemove = keys.slice(0, keys.length - 99);
      toRemove.forEach((key) => delete this.profileFirstSeen[key]);
      logger(`🧹 Cleaned up ${toRemove.length} old profile entries`);
    }
  };

  canSwipe = () => {
    const hasSwipeControls = this.hasLike() || this.hasDislike() || getActiveProfileCard(document);
    const hasProfile = this.hasProfile();
    const noBlockingModals =
      !document.querySelector('.beacon__circle') &&
      !document.querySelector('[data-testid="modal"]') &&
      !document.querySelector('.modal') &&
      !findVisibleDialog(document);

    if (!hasSwipeControls) {
      logger('🔍 Debug: No swipe controls or active card found');
    }
    if (!hasProfile) {
      logger('🔍 Debug: No profile detected');
    }

    return hasSwipeControls && hasProfile && noBlockingModals;
  };

  // Method to press keyboard shortcuts
  pressKey = (key, keyCode) => {
    try {
      if (findVisibleDialog(document)) return false;

      const target = getKeyboardShortcutTarget({
        body: document.body,
        activeCard: document.body ? null : getActiveProfileCard(document),
        documentElement: document.documentElement,
        documentNode: document
      });

      if (!target) return false;

      for (const eventType of KEYBOARD_SHORTCUT_EVENT_TYPES) {
        target.dispatchEvent(
          new KeyboardEvent(
            eventType,
            buildKeyboardShortcutEventInit({ key, keyCode, view: window })
          )
        );
      }

      return true;
    } catch (e) {
      logger(`⚠️ Error pressing key ${key}: ${e.message}`);
      return false;
    }
  };

  // Simulate a real swipe-left drag gesture on the visible card
  simulateSwipeLeft = async () => {
    try {
      let card = getActiveProfileCard(document);
      const cardSelectors = [
        '.keen-slider__slide:not(.keen-slider__slide--clone)',
        '[data-testid="card-stack"] > div > div',
        '.Expand',
        '.StretchedBox',
        '.gamepad-card'
      ];
      if (!card) {
        for (const sel of cardSelectors) {
          const el = document.querySelector(sel);
          if (el && el.offsetParent !== null && el.offsetWidth > 0 && el.offsetHeight > 0) {
            card = el;
            break;
          }
        }
      }
      if (!card) return false;
      const rect = card.getBoundingClientRect();
      const startX = rect.left + rect.width * 0.6;
      const startY = rect.top + rect.height * 0.5;
      const endX = rect.left - 50; // clearly left of the card
      const steps = 4;
      const dx = (endX - startX) / steps;
      const dy = 0;

      const dispatch = (type, x, y, extra = {}) => {
        try {
          if (window.PointerEvent) {
            card.dispatchEvent(
              new PointerEvent(type, {
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y,
                buttons: 1,
                pointerId: 1,
                pointerType: 'mouse',
                ...extra
              })
            );
          } else {
            const evtType = type.replace('pointer', 'mouse');
            card.dispatchEvent(
              new MouseEvent(evtType, {
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y,
                buttons: 1,
                ...extra
              })
            );
          }
        } catch { }
      };

      const dispatchTouch = (t, x, y) => {
        try {
          if ('TouchEvent' in window && 'Touch' in window) {
            const touch = new Touch({
              identifier: Date.now(),
              target: card,
              clientX: x,
              clientY: y,
              radiusX: 2,
              radiusY: 2,
              rotationAngle: 0,
              force: 0.5
            });
            const ev = new TouchEvent(t, {
              bubbles: true,
              cancelable: true,
              touches: t === 'touchend' ? [] : [touch],
              targetTouches: t === 'touchend' ? [] : [touch],
              changedTouches: [touch]
            });
            card.dispatchEvent(ev);
          }
        } catch { }
      };

      dispatch('pointerdown', startX, startY);
      dispatchTouch('touchstart', startX, startY);
      for (let i = 1; i <= steps; i++) {
        dispatch('pointermove', startX + dx * i, startY + dy * i);
        dispatchTouch('touchmove', startX + dx * i, startY + dy * i);
        await sleep(30);
      }
      dispatch('pointerup', startX + dx * steps, startY + dy * steps);
      dispatchTouch('touchend', startX + dx * steps, startY + dy * steps);

      await sleep(300);
      return true;
    } catch (e) {
      logger(`⚠️ Swipe simulation failed: ${e.message}`);
      return false;
    }
  };

  isVisibleElement = (element) => {
    if (!element || element.offsetParent === null) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  // Save current profile ID to detect changes
  getCurrentProfileId = () => {
    try {
      return getProfileIdentity(document);
    } catch (e) {
      return null;
    }
  };

  waitForLikeButton = async (timeout = 3000) => {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const isProfileModalOpen = this.profileAnalyzer.isProfileModalOpen();
      const likeButton = this.hasLike();
      const hasProfile = this.hasProfile();
      const hasBlockingDialog = Boolean(findVisibleDialog(document));

      if (
        canUseSwipeActionButton({
          actionButton: likeButton,
          hasBlockingDialog,
          hasProfile
        })
      ) {
        if (isProfileModalOpen) {
          logger('✅ Like button is available inside the open profile');
        }
        return likeButton;
      }

      await sleep(150);
    }

    return null;
  };

  waitForProfileAdvance = async (beforeProfileId, timeout = 2500) => {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      if (this.matchFound()) return true;

      const afterProfileId = this.getCurrentProfileId();
      if (
        hasProfileAdvanced({
          beforeProfileId,
          afterProfileId,
          hasProfile: this.hasProfile()
        })
      ) {
        return true;
      }

      await sleep(150);
    }

    return hasProfileAdvanced({
      beforeProfileId,
      afterProfileId: this.getCurrentProfileId(),
      hasProfile: this.hasProfile()
    });
  };

  incrementLikeCounter = () => {
    const likeCountEl = document.getElementById('likeCount');
    if (likeCountEl) {
      likeCountEl.textContent = incrementCounter('likeCount');
    }
  };

  incrementDislikeCounter = () => {
    const deslikeCountEl = document.getElementById('deslikeCount');
    if (deslikeCountEl) {
      deslikeCountEl.textContent = incrementCounter('deslikeCount');
    }
  };

  hasActionTargetAdvanced = (targetProfileId) =>
    hasProfileAdvanced({
      beforeProfileId: targetProfileId,
      afterProfileId: this.getCurrentProfileId(),
      hasProfile: this.hasProfile()
    });

  canRetryActionForProfile = (targetProfileId) =>
    canRetrySwipeActionForProfile({
      targetProfileId,
      currentProfileId: this.getCurrentProfileId(),
      hasProfile: this.hasProfile()
    });

  getScopedLikeButton = () => {
    const activeSurface = getActiveProfileSurface(document);
    return findLikeButton(activeSurface) || findLikeButton(document);
  };

  getScopedDislikeButton = () => {
    const activeSurface = getActiveProfileSurface(document);
    return findDislikeButton(activeSurface) || findDislikeButton(document);
  };

  stopFallbackForChangedTarget = (targetProfileId, phase) => {
    const currentProfileId = this.getCurrentProfileId();
    logger(
      `⏭️ Target profile changed before ${phase}; target=${targetProfileId || 'unknown'}, current=${currentProfileId || 'unknown'}`
    );
    this.recordProfileActionFailure(
      targetProfileId || currentProfileId,
      `Target profile changed before ${phase}`
    );
    return false;
  };

  finishDislikeAction = (targetProfileId, method) => {
    logger(`⏭️ ❌ Skipped profile using ${method}`);
    this.incrementDislikeCounter();
    this.clearProfileActionState(targetProfileId);
    return true;
  };

  finishLikeAction = (targetProfileId, method) => {
    logger(`✅ ❤️ Liked profile${method ? ` using ${method}` : ''}`);
    this.incrementLikeCounter();
    this.clearProfileActionState(targetProfileId);
    this.scheduleProfileCleanup(targetProfileId);
    return true;
  };

  clearProfileActionState = (profileId) => {
    delete this.profileFirstSeen[profileId];
    clearProfileActionFailure(this.profileActionFailures, profileId);
  };

  abortSwipeActionIfStopped = (phase) => {
    if (this.isRunning) return false;
    logger(`⏹️ ${phase} aborted because autopilot is stopped`);
    return true;
  };

  recordProfileActionFailure = (profileId, reason) => {
    const failureCount = incrementProfileActionFailure(this.profileActionFailures, profileId);
    logger(`⚠️ ${reason} (${failureCount}/${this.maxProfileActionFailures})`);

    if (shouldStopAfterProfileActionFailures(failureCount, this.maxProfileActionFailures)) {
      logger('🛑 Stopping autopilot because the same profile did not advance after repeated actions');
      this.isRunning = false;
    }
  };

  pressConfirmedLike = async (profileId) => {
    const beforeProfileId = profileId || this.getCurrentProfileId();
    const likeButton = await this.waitForLikeButton();

    if (this.abortSwipeActionIfStopped('Like action')) return false;

    if (likeButton) {
      if (beforeProfileId && !this.canRetryActionForProfile(beforeProfileId)) {
        return this.stopFallbackForChangedTarget(beforeProfileId, 'like button click');
      }

      likeButton.click();
      logger('✅ ❤️ Like clicked, waiting for next profile');

      if (await this.waitForProfileAdvance(beforeProfileId, 4500)) {
        return this.finishLikeAction(beforeProfileId, '');
      }

      if (this.hasActionTargetAdvanced(beforeProfileId)) {
        return this.finishLikeAction(beforeProfileId, 'delayed DOM update');
      }
    }

    if (this.abortSwipeActionIfStopped('Like fallback')) return false;

    if (this.canRetryActionForProfile(beforeProfileId)) {
      logger('⌨️ Trying keyboard shortcut for like (ArrowRight) as fallback...');
      if (
        this.pressKey('ArrowRight', 39) &&
        (await this.waitForProfileAdvance(beforeProfileId, 3500))
      ) {
        return this.finishLikeAction(beforeProfileId, 'keyboard ArrowRight');
      }

      if (this.hasActionTargetAdvanced(beforeProfileId)) {
        return this.finishLikeAction(beforeProfileId, 'delayed keyboard ArrowRight update');
      }
    } else {
      if (this.abortSwipeActionIfStopped('Like fallback')) return false;
      return this.stopFallbackForChangedTarget(beforeProfileId, 'like keyboard fallback');
    }

    if (this.abortSwipeActionIfStopped('Like failure handling')) return false;

    logger(`⚠️ Like click did not advance profile (id=${beforeProfileId})`);
    this.recordProfileActionFailure(beforeProfileId, 'Like action did not advance profile');
    return false;
  };

  hasProfile = () => {
    if (getActiveProfileCard(document)) return true;

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

    debugLog('Checking for profile...');

    for (const selector of profileSelectors) {
      const elements = document.querySelectorAll(selector);
      debugLog(`${selector}: ${elements.length} elements`);

      for (const element of elements) {
        if (
          element &&
          element.offsetParent !== null &&
          element.offsetWidth > 0 &&
          element.offsetHeight > 0
        ) {
          debugLog(`Profile found with selector: ${selector}`);
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
      debugLog(`Images ${selector}: ${images.length} found`);
      if (images.length > 0) {
        for (const img of images) {
          if (img.offsetParent !== null && img.complete && img.naturalWidth > 0) {
            debugLog(`Profile image found: ${img.src.substring(0, 50)}...`);
            return true;
          }
        }
      }
    }

    debugLog('No profile detected');
    return false;
  };

  hasLike = () => this.getScopedLikeButton();

  pressLike = async () => {
    // Check if we can swipe (has profile available)
    if (!this.canSwipe()) {
      return false;
    }

    // Track when current profile was first seen for gating
    const profileId = this.getCurrentProfileId();
    if (!this.profileFirstSeen[profileId]) {
      this.profileFirstSeen[profileId] = Date.now();
    }

    // Check if profile should be skipped based on bio (opens modal, checks, closes)
    const profileCheckAction = await this.profileAnalyzer.checkProfileWithModal();

    if (shouldStopProfileCheckAction(profileCheckAction)) {
      logger('🛑 Stopping autopilot because AI Filter is unavailable');
      this.isRunning = false;
      return false;
    }

    const shouldSkip = shouldSkipProfileCheckAction(profileCheckAction);

    if (shouldSkip) {
      // Profile blocked - try multiple methods to dislike
      logger('🚫 Profile should be skipped, attempting to dislike...');
      const targetProfileId = profileId || this.getCurrentProfileId();
      // Make sure any modal/overlay is closed
      try {
        this.profileAnalyzer.closeProfile();
        await this.profileAnalyzer.waitForModalClose(1200);
      } catch { }

      if (this.abortSwipeActionIfStopped('Dislike action')) return false;
      if (findVisibleDialog(document)) return false;

      let lastDislikeMethod = '';

      // Method 1: Try clicking dislike button
      const dislikeButton = this.hasDislike();
      if (dislikeButton) {
        try {
          if (!this.canRetryActionForProfile(targetProfileId)) {
            return this.stopFallbackForChangedTarget(targetProfileId, 'dislike button click');
          }

          dislikeButton.click();
          lastDislikeMethod = 'dislike button';

          if (await this.waitForProfileAdvance(targetProfileId, 3500)) {
            return this.finishDislikeAction(targetProfileId, 'dislike button');
          }

          logger('🚪 Waiting for modal to close after dislike...');
          await this.profileAnalyzer.waitForModalClose(1200);

          if (this.profileAnalyzer.isProfileModalOpen()) {
            logger('🚪 Modal still open, forcing close...');
            this.profileAnalyzer.closeProfile();
            await this.profileAnalyzer.waitForModalClose(1200);
          }

          if (this.hasActionTargetAdvanced(targetProfileId)) {
            return this.finishDislikeAction(targetProfileId, 'dislike button');
          }

          logger(
            `⚠️ Dislike button click did not change target profile (id=${targetProfileId})`
          );
        } catch (e) {
          logger(`⚠️ Error clicking dislike button: ${e.message}`);
        }
      }

      // Use Tinder's ArrowLeft shortcut even when no button was found.
      if (this.abortSwipeActionIfStopped('Dislike fallback')) return false;
      if (lastDislikeMethod && this.hasActionTargetAdvanced(targetProfileId)) {
        return this.finishDislikeAction(targetProfileId, lastDislikeMethod);
      }
      if (!this.canRetryActionForProfile(targetProfileId)) {
        return this.stopFallbackForChangedTarget(targetProfileId, 'dislike keyboard fallback');
      }

      if (this.pressKey('ArrowLeft', 37)) {
        lastDislikeMethod = 'keyboard ArrowLeft';
        if (await this.waitForProfileAdvance(targetProfileId, 3000)) {
          return this.finishDislikeAction(targetProfileId, lastDislikeMethod);
        }
      }

      // Method 3: Simulate a real swipe-left drag
      if (this.abortSwipeActionIfStopped('Dislike drag fallback')) return false;
      if (lastDislikeMethod && this.hasActionTargetAdvanced(targetProfileId)) {
        return this.finishDislikeAction(targetProfileId, lastDislikeMethod);
      }
      if (!this.canRetryActionForProfile(targetProfileId)) {
        return this.stopFallbackForChangedTarget(targetProfileId, 'swipe-left drag');
      }

      const swipeOk = !findVisibleDialog(document) && (await this.simulateSwipeLeft());
      if (swipeOk) {
        if (await this.waitForProfileAdvance(targetProfileId, 2500)) {
          return this.finishDislikeAction(targetProfileId, 'swipe-left drag');
        }
        logger(
          `⚠️ Swipe-left drag did not change target profile (id=${targetProfileId})`
        );
      }

      // Last resort: Report that we couldn't dislike and return false to try again
      logger('❌ Could not dislike profile! Manual intervention may be needed.');
      logger('🛑 Stopping autopilot to prevent unwanted likes...');
      this.isRunning = false; // Stop the autopilot
      return false;
    }

    // Enforce minimum wait only when Bio Filtering is actively enabled.
    this.profileAnalyzer.bioBlacklist = this.profileAnalyzer.loadBioBlacklist();
    const hasActiveBioFilter = hasEnabledBioBlacklist({
      isBioFilterEnabled: this.profileAnalyzer.isBioFilterEnabled(),
      bioBlacklist: this.profileAnalyzer.bioBlacklist
    });
    const minGateMs = hasActiveBioFilter ? 5000 : 0;
    if (minGateMs > 0) {
      const elapsed = Date.now() - (this.profileFirstSeen[profileId] || Date.now());
      if (elapsed < minGateMs) {
        const waitMs = minGateMs - elapsed;
        logger(`⏳ Waiting ${waitMs}ms before like due to bio filter`);
        await sleep(waitMs);
      }
    }

    // Profile passed all filters - try Super Like first (safely) then Like
    if (this.superLiker && this.superLiker.pressSuperLike && this.superLiker.pressSuperLike()) {
      if (await this.waitForProfileAdvance(profileId)) {
        this.clearProfileActionState(profileId);
        return true;
      }
      this.recordProfileActionFailure(profileId, 'Super Like action did not advance profile');
      return false;
    }

    return this.pressConfirmedLike(profileId);
  };

  hasDislike = () => this.getScopedDislikeButton();

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

      const waitForMatchPage = this.scheduleInterval(() => {
        if (this.interactions.isOnMatchesPage()) {
          this.clearIntervalById(waitForMatchPage);
          this.scheduleRun(generateRandomNumber());
        }
      }, 250);
      return;
    }

    if (this.interactions.closeInstructions()) {
      this.scheduleRun(generateRandomNumber());
      return;
    }

    if (this.interactions.closeMatchFound()) {
      this.scheduleRun(generateRandomNumber());
      return;
    }

    if (this.interactions.closeModal()) {
      this.scheduleRun(generateRandomNumber());
      return;
    }

    if (!this.canSwipe()) {
      logger('No profiles found. Waiting 4s');
      this.scheduleRun(generateRandomNumber(3000, 4000));
      return;
    }

    // Keep Swiping
    if (this.matchFound()) {
      this.scheduleRun(generateRandomNumber(500, 900));
      return;
    }

    if (this.isProcessingSwipe) {
      logger('Swipe action already in progress. Waiting before next cycle');
      this.scheduleRun(800);
      return;
    }

    // What we came here to do, swipe right!
    this.isProcessingSwipe = true;
    this.pressLike()
      .then((success) => {
        if (success) {
          this.scheduleRun(generateRandomNumber(3000, 4000));
        } else if (this.isRunning) {
          logger('No profiles found. Waiting 4s');
          this.scheduleRun(generateRandomNumber(3000, 4000));
        }
      })
      .catch((error) => {
        logger(`⚠️ Swipe cycle failed: ${error.message}`);
        this.scheduleRun(generateRandomNumber(3000, 4000));
      })
      .finally(() => {
        this.isProcessingSwipe = false;
      });
  };
}

export default Swiper;
