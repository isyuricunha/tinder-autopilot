import { debugLog, logger, warnLog, generateRandomNumber } from '../misc/helper';
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
import { getActiveProfileCard, getProfileIdentity } from '../misc/profile-identity';
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
    const likeButton = this.hasLike();
    const hasProfile = this.hasProfile();
    const noBlockingModals =
      !document.querySelector('.beacon__circle') &&
      !document.querySelector('[data-testid="modal"]') &&
      !document.querySelector('.modal') &&
      !findVisibleDialog(document);

    if (!likeButton) {
      logger('🔍 Debug: No like button found');
    }
    if (!hasProfile) {
      logger('🔍 Debug: No profile detected');
    }

    return likeButton && hasProfile && noBlockingModals;
  };

  // Method to press keyboard shortcuts
  pressKey = (key, keyCode) => {
    try {
      const target = getKeyboardShortcutTarget({
        activeElement: document.activeElement,
        body: document.body,
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

  clearProfileActionState = (profileId) => {
    delete this.profileFirstSeen[profileId];
    clearProfileActionFailure(this.profileActionFailures, profileId);
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

    if (!likeButton) {
      this.recordProfileActionFailure(beforeProfileId, 'Like button was not ready after closing profile');
      return false;
    }

    likeButton.click();
    logger('✅ ❤️ Like clicked, waiting for next profile');

    if (await this.waitForProfileAdvance(beforeProfileId, 4500)) {
      logger('✅ ❤️ Liked profile');
      this.incrementLikeCounter();
      this.clearProfileActionState(profileId);
      this.scheduleProfileCleanup(profileId);
      return true;
    }

    if (this.hasActionTargetAdvanced(beforeProfileId)) {
      logger('✅ ❤️ Liked profile after delayed DOM update');
      this.incrementLikeCounter();
      this.clearProfileActionState(profileId);
      this.scheduleProfileCleanup(profileId);
      return true;
    }

    logger(`⚠️ Like click did not advance profile (id=${beforeProfileId})`);
    this.recordProfileActionFailure(beforeProfileId, 'Like action did not advance profile');
    return false;
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

  hasLike = () => {
    const detectedLike = findLikeButton(document);
    if (detectedLike) return detectedLike;

    // Prefer explicit Like selectors and exclude Boost
    const positiveSelectors = [
      "button[aria-label='Like']",
      "button[aria-label*='Like']",
      "button[data-testid='like']",
      "button[data-testid='gamepad-like']",
      "button[data-testid='gamepad-like-button']",
      "button[title='Like']",
      "button[title*='Like']",
      '.gamepad__button--like'
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
      warnLog('XPath fallback failed', e);
    }

    return null;
  };

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
    const shouldSkip = await this.profileAnalyzer.checkProfileWithModal();

    if (shouldSkip) {
      // Profile blocked - try multiple methods to dislike
      logger('🚫 Profile should be skipped, attempting to dislike...');
      const targetProfileId = profileId || this.getCurrentProfileId();
      // Make sure any modal/overlay is closed
      try {
        this.profileAnalyzer.closeProfile();
        await this.profileAnalyzer.waitForModalClose(1200);
      } catch { }

      // Track whether a real dislike action was already sent before trying any fallback.
      let dislikeExecuted = false;
      let sentDislikeAction = false;
      let lastDislikeMethod = '';

      // Method 1: Try clicking dislike button
      const dislikeButton = this.hasDislike();
      if (dislikeButton) {
        try {
          if (!this.canRetryActionForProfile(targetProfileId)) {
            return this.stopFallbackForChangedTarget(targetProfileId, 'dislike button click');
          }

          dislikeButton.click();
          dislikeExecuted = true;
          sentDislikeAction = true;
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

      // Method 2: Try keyboard shortcut (ArrowLeft for dislike)
      if (dislikeExecuted) {
        logger('⌨️ Trying keyboard shortcut for dislike (ArrowLeft) as fallback...');

        if (!this.canRetryActionForProfile(targetProfileId)) {
          if (sentDislikeAction) {
            return this.finishDislikeAction(targetProfileId, lastDislikeMethod);
          }
          return this.stopFallbackForChangedTarget(targetProfileId, 'keyboard fallback');
        }

        if (this.profileAnalyzer.isProfileModalOpen()) {
          logger('🚪 Modal still open, closing before keyboard fallback...');
          this.profileAnalyzer.closeProfile();
          await this.profileAnalyzer.waitForModalClose(1500);
        }

        if (!this.canRetryActionForProfile(targetProfileId)) {
          if (sentDislikeAction) {
            return this.finishDislikeAction(targetProfileId, lastDislikeMethod);
          }
          return this.stopFallbackForChangedTarget(targetProfileId, 'keyboard fallback');
        }

        this.pressKey('ArrowLeft', 37);
        sentDislikeAction = true;
        lastDislikeMethod = 'keyboard ArrowLeft';
        if (await this.waitForProfileAdvance(targetProfileId, 3000)) {
          return this.finishDislikeAction(targetProfileId, 'keyboard ArrowLeft');
        }
        logger(`↩️ ArrowLeft did not change target profile (id=${targetProfileId})`);
      }

      // Try alternative keyboard shortcuts
      logger('⌨️ Trying alternative keyboard shortcuts...');
      const shortcuts = [
        { key: 'a', keyCode: 65 }, // 'a' key sometimes used for pass
        { key: 'x', keyCode: 88 }, // 'x' key for reject
        { key: 'Escape', keyCode: 27 } // Escape to close/skip
      ];

      for (const shortcut of shortcuts) {
        if (!this.canRetryActionForProfile(targetProfileId)) {
          if (sentDislikeAction) {
            return this.finishDislikeAction(targetProfileId, lastDislikeMethod);
          }
          return this.stopFallbackForChangedTarget(targetProfileId, 'alternative shortcut');
        }

        this.pressKey(shortcut.key, shortcut.keyCode);
        sentDislikeAction = true;
        lastDislikeMethod = `'${shortcut.key}' key`;
        if (await this.waitForProfileAdvance(targetProfileId, 1800)) {
          return this.finishDislikeAction(targetProfileId, `'${shortcut.key}' key`);
        }
      }

      // Method 3: Simulate a real swipe-left drag
      logger('Simulating swipe-left drag...');
      if (!this.canRetryActionForProfile(targetProfileId)) {
        if (sentDislikeAction) {
          return this.finishDislikeAction(targetProfileId, lastDislikeMethod);
        }
        return this.stopFallbackForChangedTarget(targetProfileId, 'swipe-left drag');
      }

      const swipeOk = await this.simulateSwipeLeft();
      if (swipeOk) {
        sentDislikeAction = true;
        lastDislikeMethod = 'swipe-left drag';
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

  hasDislike = () => {
    logger('🔍 Searching for dislike button...');

    const detectedDislike = findDislikeButton(document);
    if (detectedDislike) {
      logger('✅ Found dislike button using DOM detector');
      return detectedDislike;
    }

    // Strategy 1: Find by aria-label or title
    const labelSelectors = [
      "button[aria-label*='Pass']",
      "button[aria-label*='Nope']",
      "button[aria-label*='pass']",
      "button[aria-label*='nope']",
      "button[aria-label*='Dislike']",
      "button[aria-label*='dislike']",
      "button[aria-label*='Não' i]",
      "button[aria-label*='Nao' i]",
      "button[aria-label*='Recusar' i]",
      "button[aria-label*='Não curtir' i]",
      "button[aria-label*='Nao curtir' i]",
      "button[title*='Pass']",
      "button[title*='Nope']",
      "button[title*='pass']",
      "button[title*='nope']",
      "button[title*='Dislike']",
      "button[title*='dislike']",
      "button[title*='Não' i]",
      "button[title*='Nao' i]",
      "button[title*='Recusar' i]",
      "button[title*='Não curtir' i]",
      "button[title*='Nao curtir' i]"
    ];

    for (const selector of labelSelectors) {
      const button = document.querySelector(selector);
      if (button && button.offsetParent !== null && !button.disabled) {
        logger(`✅ Found dislike button with selector: ${selector}`);
        return button;
      }
    }

    // Strategy 2: Find by data-testid
    const testIdSelectors = [
      "button[data-testid='dislike']",
      "button[data-testid='gamepad-dislike']",
      "button[data-testid='gamepad-dislike-button']",
      "button[data-testid='game-stamp-dislike']",
      "[data-testid='gamepad-dislike']",
      "[data-testid='dislike']",
      "[data-testid*='pass' i]",
      "button[data-testid*='pass' i]"
    ];

    for (const selector of testIdSelectors) {
      const button = document.querySelector(selector);
      if (button && button.offsetParent !== null && !button.disabled) {
        const actualButton = button.tagName === 'BUTTON' ? button : button.closest('button');
        if (actualButton) {
          logger(`✅ Found dislike button with data-testid: ${selector}`);
          return actualButton;
        }
      }
    }

    // Strategy 3: Find by position in gamepad (dislike is usually the first button)
    const gamepadSelectors = [
      '[data-testid="gamepad"]',
      '.gamepad',
      '.Pos\\(a\\).B\\(0\\).Start\\(0\\).End\\(0\\)',
      '.recsGamepad',
      '[class*="gamepad"]'
    ];

    for (const selector of gamepadSelectors) {
      const gamepad = document.querySelector(selector);
      if (gamepad) {
        // Find all buttons in the gamepad
        const buttons = gamepad.querySelectorAll('button');
        if (buttons.length >= 2) {
          // In Tinder, the order is usually: Dislike (1st), Super Like (2nd), Like (3rd)
          const firstButton = buttons[0];

          // Verify it's not a Super Like or Like button
          if (firstButton && firstButton.offsetParent !== null && !firstButton.disabled) {
            const ariaLabel = (firstButton.getAttribute('aria-label') || '').toLowerCase();
            const title = (firstButton.getAttribute('title') || '').toLowerCase();
            const testId = (firstButton.getAttribute('data-testid') || '').toLowerCase();

            // Make sure it's not Like or Super Like
            if (
              !ariaLabel.includes('like') &&
              !title.includes('like') &&
              !testId.includes('like') &&
              !ariaLabel.includes('super') &&
              !title.includes('super') &&
              !testId.includes('super') &&
              !ariaLabel.includes('boost') &&
              !title.includes('boost') &&
              !testId.includes('boost')
            ) {
              logger(`✅ Found dislike button as first button in gamepad: ${selector}`);
              return firstButton;
            } else if (
              ariaLabel.includes('nope') ||
              ariaLabel.includes('pass') ||
              title.includes('nope') ||
              title.includes('pass')
            ) {
              logger(`✅ Found dislike button by content in gamepad: ${selector}`);
              return firstButton;
            }
          }
        }
      }
    }

    // Strategy 4: Find by SVG content (X icon)
    try {
      const buttons = document.querySelectorAll('button');
      for (const button of buttons) {
        if (button.offsetParent !== null && !button.disabled) {
          const svg = button.querySelector('svg');
          if (svg) {
            // Check SVG paths for X-like shapes
            const paths = svg.querySelectorAll('path');
            for (const path of paths) {
              const d = path.getAttribute('d');
              // Look for X-shaped paths (common for dislike)
              if (d && (d.includes('M14.926') || d.includes('M8.5 8.5') || d.includes('close'))) {
                logger(`✅ Found dislike button by SVG X icon`);
                return button;
              }
            }

            // Check fill color - dislike button often has red/pink colors
            const fill = svg.getAttribute('fill') || '';
            const style = window.getComputedStyle(svg);
            const color = style.fill || style.color || '';

            if (fill.includes('#ff4458') || color.includes('rgb(255, 68, 88)')) {
              logger(`✅ Found dislike button by red/pink SVG color`);
              return button;
            }
          }
        }
      }
    } catch (e) {
      logger(`⚠️ Error searching for dislike button by SVG: ${e.message}`);
    }

    // Strategy 5: Find by computed styles and position
    try {
      // Get all buttons at the bottom of the screen
      const buttons = Array.from(document.querySelectorAll('button')).filter((btn) => {
        if (!btn.offsetParent || btn.disabled) return false;
        const rect = btn.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        // Button should be in the bottom 25% of the screen
        return rect.top > viewportHeight * 0.75;
      });

      // Sort buttons by horizontal position (left to right)
      buttons.sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        return aRect.left - bRect.left;
      });

      // Dislike button is typically the leftmost action button
      if (buttons.length >= 2) {
        const firstButton = buttons[0];
        // Verify it's not a navigation button
        const ariaLabel = (firstButton.getAttribute('aria-label') || '').toLowerCase();
        const hasText = firstButton.textContent.trim().length > 0;

        if (
          !hasText ||
          ariaLabel.includes('pass') ||
          ariaLabel.includes('nope') ||
          ariaLabel.includes('dislike') ||
          ariaLabel.includes('não') ||
          ariaLabel.includes('nao') ||
          !ariaLabel.includes('profile')
        ) {
          logger(`✅ Found dislike button by position (leftmost bottom button)`);
          return firstButton;
        }
      }
    } catch (e) {
      logger(`⚠️ Error finding dislike button by position: ${e.message}`);
    }

    // Strategy 6: Generic back/close buttons sometimes act as pass in expanded views
    try {
      const candidates = Array.from(document.querySelectorAll('button, [role="button"]'));
      for (const btn of candidates) {
        const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
        const title = (btn.getAttribute('title') || '').toLowerCase();
        const dtid = (btn.getAttribute('data-testid') || '').toLowerCase();
        const txt = (btn.textContent || '').toLowerCase();
        const content = `${aria} ${title} ${dtid} ${txt}`;
        if (
          content.includes('pass') ||
          content.includes('nope') ||
          content.includes('dislike') ||
          content.includes('não') ||
          content.includes('nao')
        ) {
          logger('✅ Found fallback dislike candidate by textual content');
          return btn.closest('button') || btn;
        }
      }
    } catch (e) {
      logger(`⚠️ Error searching generic buttons for dislike: ${e.message}`);
    }

    logger('❌ No dislike button found with any strategy');
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
        } else {
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
