import { debugLog, errorLog, logger } from '../misc/helper';
import { getSetting } from '../misc/settings-store';
import {
  PROFILE_LIMIT_DEFAULTS,
  isGenderBlocked,
  normalizeBioFilterText,
  parseFilterList,
  getAdvancedProfileRejectionReason
} from '../misc/profile-filter-utils';
import { extractProfileContext, parseProfileDistance } from '../misc/profile-context-extractor';
import { hasEnabledBioBlacklist, shouldRequireProfileModal } from '../misc/profile-filter-state';
import { isAiProfileFilterFailure } from '../misc/ai-profile-filter-result';
import { PROFILE_CHECK_ACTIONS } from '../misc/profile-check-result';
import { SWIPE_PHASES } from '../misc/swipe-progress';
import { getActiveProfileCard, getExpandedProfileContent } from '../misc/profile-identity';
import { findOpenProfileButton } from '../misc/tinder-dom-detectors';
import {
  findProfileCloseControl,
  isProfileModalOpen,
  waitForProfileClose
} from '../misc/profile-modal-state';
import { getCheckboxValue } from '../views/toggle-control';
import AIProfileFilter from './AIProfileFilter';

class ProfileAnalyzer {
  constructor() {
    this.bioBlacklist = this.loadBioBlacklist();
    this.aiFilter = new AIProfileFilter();
  }

  loadBioBlacklist() {
    return parseFilterList(getSetting('bioBlacklist'));
  }

  loadGenderFilter() {
    return parseFilterList(getSetting('genderFilter'));
  }

  loadAgeRange() {
    return {
      min: this.readLimit('minAge'),
      max: this.readLimit('maxAge')
    };
  }

  readLimit(key) {
    const value = parseInt(getSetting(key), 10);
    return Number.isFinite(value) && value > 0 ? value : PROFILE_LIMIT_DEFAULTS[key];
  }

  loadMaxDistance() {
    return this.readLimit('maxDistance');
  }

  loadMinPhotoCount() {
    return this.readLimit('minPhotoCount');
  }

  isBioFilterEnabled() {
    return getCheckboxValue('.tinderAutopilotBioFilter');
  }

  hasActiveBioFilter() {
    this.bioBlacklist = this.loadBioBlacklist();
    return hasEnabledBioBlacklist({
      isBioFilterEnabled: this.isBioFilterEnabled(),
      bioBlacklist: this.bioBlacklist
    });
  }

  // Open the profile modal by clicking on the card
  async openProfile(isCancelled = () => false) {
    try {
      const activeCard = getActiveProfileCard(document);
      const isSafeButton = (btn) => {
        if (!btn) return false;
        const s = `${btn.getAttribute('aria-label') || ''} ${btn.getAttribute('title') || ''} ${btn.getAttribute('data-testid') || ''
          } ${btn.textContent || ''}`.toLowerCase();
        const forbidden = [
          'super',
          'star',
          'boost',
          'report',
          'denunciar',
          'bloquear',
          'block',
          'menu',
          'share',
          'compartilhar',
          'gostar',
          'like',
          'desfazer',
          'undo',
          'pass',
          'nope',
          'não',
          'nao',
          'recusar'
        ];
        if (forbidden.some((w) => s.includes(w))) return false;
        return true;
      };

      const openProfileButton = findOpenProfileButton(activeCard || document);
      if (openProfileButton && isSafeButton(openProfileButton)) {
        openProfileButton.click();
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (isCancelled()) return false;
        if (this.isProfileModalOpen()) {
          return true;
        }
      }

      // The info button is usually at the bottom of the current card
      const infoButtonSelectors = [
        // Most specific: button at bottom of card
        '.recsCardboard__cards button.Pos\\(a\\)',
        '.recsCardboard__cards .Pos\\(a\\) button',
        // Button with specific positioning
        'button.Pos\\(a\\).B\\(0\\)',
        'button.Pos\\(a\\).B\\(4px\\)',
        'button.Pos\\(a\\).Start\\(50%\\)',
        // Generic positioned button
        '.Expand button.Pos\\(a\\)',
        '.StretchedBox button.Pos\\(a\\)',
        // Any button at the bottom of the visible card
        '.keen-slider__slide--active button',
        '.keen-slider__slide:first-child button'
      ];

      let clicks = 0;
      let limitReached = false;
      const maxClicks = 1;
      for (const selector of infoButtonSelectors) {
        try {
          const scope = activeCard || document;
          const buttons = scope.querySelectorAll(selector);

          for (const button of buttons) {
            if (
              button &&
              button.offsetParent !== null &&
              !button.disabled &&
              isSafeButton(button)
            ) {
              // Check if button is at the bottom of screen (info buttons are usually there)
              const rect = button.getBoundingClientRect();
              const isAtBottom = rect.top > window.innerHeight * 0.6;

              // Check if button is small (info buttons are usually small)
              const isSmallButton = rect.width < 100 && rect.height < 100;

              if (isAtBottom || isSmallButton) {
                button.click();

                // Wait and check if modal opened
                await new Promise((resolve) => setTimeout(resolve, 500));
                if (isCancelled()) return false;
                if (this.isProfileModalOpen()) {
                  return true;
                }
                clicks += 1;
                if (clicks >= maxClicks) {
                  limitReached = true;
                  break;
                }
              }
            }
          }
          if (limitReached) break;
        } catch (e) {
          // Continue to next selector
        }
      }

      // Strategy 2: Try UP arrow key as fallback
      const upEvents = [
        new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          code: 'ArrowUp',
          keyCode: 38,
          which: 38,
          bubbles: true,
          cancelable: true
        }),
        new KeyboardEvent('keyup', {
          key: 'ArrowUp',
          code: 'ArrowUp',
          keyCode: 38,
          which: 38,
          bubbles: true,
          cancelable: true
        })
      ];
      const upTargets = [
        document.activeElement,
        document.querySelector('[data-keyboard-gamepad="true"]'),
        document.querySelector('.recsCardboard__cardsContainer'),
        document.querySelector('[data-testid="card-stack"]'),
        activeCard,
        document.body,
        document
      ].filter(Boolean);
      for (const ev of upEvents) {
        for (const tgt of upTargets) {
          tgt.dispatchEvent(ev);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (isCancelled()) return false;
      if (this.isProfileModalOpen()) {
        return true;
      }

      // Strategy 3 and 4 removed to avoid triggering unrelated UI (image click, Enter/Space)

      // Strategy 5: Click on specific areas of the card (fallback)
      const card = activeCard;
      if (card && card.offsetParent !== null && card.offsetWidth > 0) {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY
        });
        card.dispatchEvent(clickEvent);
        const dblClick = new MouseEvent('dblclick', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY
        });
        card.dispatchEvent(dblClick);
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (this.isProfileModalOpen()) {
          return true;
        }
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  // Check if profile modal is open
  isProfileModalOpen() {
    return isProfileModalOpen(document, window.location);
  }

  // Close the profile modal by clicking close button
  closeProfile() {
    try {
      const profileBackButton = findProfileCloseControl(document);
      if (profileBackButton) {
        profileBackButton.click();
        debugLog('Profile close control clicked');
        return true;
      }

      if (!this.isProfileModalOpen()) {
        debugLog('Profile already closed');
        return false;
      }

      // Strategy 1: Try DOWN arrow key (most reliable for closing profile)
      logger('⌨️ Using DOWN arrow to close profile...');
      const downEvents = [
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          code: 'ArrowDown',
          keyCode: 40,
          which: 40,
          bubbles: true,
          cancelable: true
        }),
        new KeyboardEvent('keyup', {
          key: 'ArrowDown',
          code: 'ArrowDown',
          keyCode: 40,
          which: 40,
          bubbles: true,
          cancelable: true
        })
      ];

      // Dispatch to multiple targets
      const targets = [
        document.activeElement,
        document.querySelector('div[class*="M(16px)"]') || document.querySelector('.M\\(16px\\)'),
        document.querySelector('.profileContent'),
        document.body,
        document
      ].filter(Boolean);

      for (const ev of downEvents) {
        for (const target of targets) {
          target.dispatchEvent(ev);
        }
      }

      // Strategy 2: Click outside the modal to close it
      const outsideClick = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 10, // Click far left
        clientY: window.innerHeight / 2
      });

      // Find backdrop or overlay to click
      const overlaySelectors = [
        '.Bdrs\\(8px\\)--ml',
        '.Bgc\\(\\$c-ds-background-overlay\\)',
        '[role="dialog"]',
        '.modal-overlay'
      ];

      for (const selector of overlaySelectors) {
        const overlay = document.querySelector(selector);
        if (overlay) {
          overlay.dispatchEvent(outsideClick);
          break;
        }
      }

      // Strategy 3: Try Escape as fallback
      const escapeEvents = [
        new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          which: 27,
          bubbles: true,
          cancelable: true
        }),
        new KeyboardEvent('keyup', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          which: 27,
          bubbles: true,
          cancelable: true
        })
      ];
      for (const ev of escapeEvents) document.dispatchEvent(ev);

      logger('🚪 Profile close command sent (DOWN arrow + Escape)');
      return true;
    } catch (e) {
      logger(`❌ Error closing profile: ${e.message}`);
      return false;
    }
  }

  // Wait for modal to actually close
  async waitForModalClose(timeout = 2000) {
    const closed = await waitForProfileClose({
      root: document.querySelector('#main-content')?.parentElement || document.body,
      isOpen: () => this.isProfileModalOpen(),
      timeout
    });
    if (!closed) logger('⚠️ Profile is still open after close timeout');
    return closed;
  }
  // Wait for profile modal to open and load
  async waitForProfileModal(maxWait = 2000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      if (getExpandedProfileContent(document)) {
        // Wait a bit more for content to load
        await new Promise((resolve) => setTimeout(resolve, 300));
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return false;
  }

  getProfileContext() {
    const surface = getExpandedProfileContent(document);
    return surface ? extractProfileContext(surface) : null;
  }

  isGenderFilterEnabled() {
    return getCheckboxValue('.tinderAutopilotGenderFilter');
  }

  isAdvancedFilterEnabled() {
    return getCheckboxValue('.tinderAutopilotAdvancedFilter');
  }

  getProfileRejectionReason(profile) {
    if (this.isBioFilterEnabled()) {
      const bio = normalizeBioFilterText(profile.bio);
      const matched = this.bioBlacklist.some((word) => {
        const term = normalizeBioFilterText(word);
        return term && bio.includes(term);
      });
      if (matched) return 'Bio matched a blocked term';
    }

    if (this.isGenderFilterEnabled() && isGenderBlocked(profile.gender, this.loadGenderFilter())) {
      return 'Gender matched a blocked label';
    }

    if (!this.isAdvancedFilterEnabled()) return '';
    return getAdvancedProfileRejectionReason({
      age: profile.age,
      distance: parseProfileDistance(profile.distance),
      photoCount: profile.photoCount,
      ageRange: this.loadAgeRange(),
      maxDistance: this.loadMaxDistance(),
      minPhotoCount: this.loadMinPhotoCount()
    });
  }

  // Main method to check profile with modal opening
  async checkProfileWithModal({ onPhase = () => {}, isCancelled = () => false } = {}) {
    const { allow, skip, stop } = PROFILE_CHECK_ACTIONS;
    try {
      const hasActiveBioFilter = this.hasActiveBioFilter();
      const isAIFilterEnabled = AIProfileFilter.isEnabled();
      if (!shouldRequireProfileModal({
        hasActiveBioFilter,
        isGenderFilterEnabled: this.isGenderFilterEnabled(),
        isAdvancedFilterEnabled: this.isAdvancedFilterEnabled(),
        isAIFilterEnabled
      })) {
        return { action: allow, reason: 'No profile filters enabled' };
      }

      if (this.isProfileModalOpen()) {
        onPhase(SWIPE_PHASES.closingProfile);
        this.closeProfile();
        const closed = await this.waitForModalClose(1500);
        if (isCancelled()) return { action: stop };
        if (!closed) return { action: stop, reason: 'Could not close the previous profile' };
      }

      onPhase(SWIPE_PHASES.openingProfile);
      const opened = await this.openProfile(isCancelled);
      if (isCancelled()) return { action: stop };
      if (!opened) return { action: stop, reason: 'Could not open profile for filtering' };

      const modalOpened = await this.waitForProfileModal(5000);
      if (isCancelled()) return { action: stop };
      if (!modalOpened) {
        onPhase(SWIPE_PHASES.closingProfile);
        this.closeProfile();
        await this.waitForModalClose(1000);
        return { action: stop, reason: 'Profile did not finish opening' };
      }

      onPhase(SWIPE_PHASES.readingProfile);
      const profile = this.getProfileContext();
      if (!profile) return { action: stop, reason: 'Could not identify the active profile to filter' };
      let reason = this.getProfileRejectionReason(profile);
      let action = reason ? skip : allow;
      if (action === allow && isAIFilterEnabled) {
        onPhase(SWIPE_PHASES.waitingForAi);
        const aiResult = await this.aiFilter.analyze({
          bio: profile.bio,
          name: profile.name,
          profile
        });
        if (isCancelled()) return { action: stop };

        if (isAiProfileFilterFailure(aiResult)) {
          return { action: stop, reason: aiResult.reason };
        }
        action = aiResult.shouldSwipe === false ? skip : allow;
        reason = aiResult.reason ? `AI: ${aiResult.reason}` : 'AI evaluated profile';
      }

      onPhase(SWIPE_PHASES.closingProfile);
      this.closeProfile();
      const closed = await this.waitForModalClose(2000);
      if (isCancelled()) return { action: stop };
      if (!closed) return { action: stop, reason: 'Could not close the filtered profile' };

      return { action, reason: reason || 'Passed enabled profile filters' };
    } catch (error) {
      errorLog('Error checking profile with modal:', error);
      if (!isCancelled()) {
        onPhase(SWIPE_PHASES.closingProfile);
        this.closeProfile();
        await this.waitForModalClose(1000);
      }
      return { action: stop, reason: 'Profile analysis failed' };
    }
  }
}

export default ProfileAnalyzer;
