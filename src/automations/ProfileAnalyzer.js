import { errorLog, logger, warnLog } from '../misc/helper';
import { getSetting } from '../misc/settings-store';
import {
  isGenderBlocked,
  parseFilterList,
  shouldSkipAdvancedProfile
} from '../misc/profile-filter-utils';
import { extractProfileContext, parseProfileDistance } from '../misc/profile-context-extractor';
import { hasEnabledBioBlacklist, shouldRequireProfileModal } from '../misc/profile-filter-state';
import { getActiveProfileCard } from '../misc/profile-identity';
import { findOpenProfileButton } from '../misc/tinder-dom-detectors';
import { findProfileCloseControl, isProfileModalOpen } from '../misc/profile-modal-state';
import { getCheckboxValue } from '../views/toggle-control';
import AIProfileFilter from './AIProfileFilter';

class ProfileAnalyzer {
  constructor() {
    this.bioBlacklist = this.loadBioBlacklist();
    this.genderFilter = this.loadGenderFilter();
    this.ageRange = this.loadAgeRange();
    this.maxDistance = this.loadMaxDistance();
    this.minPhotoCount = this.loadMinPhotoCount();
    this.aiFilter = new AIProfileFilter();
  }

  loadBioBlacklist() {
    try {
      const stored = getSetting('bioBlacklist');
      if (stored) {
        const words = parseFilterList(stored);
        logger(`📝 Loaded ${words.length} banned words: ${words.join(', ')}`);
        return words;
      }
    } catch (e) {
      warnLog('Failed to load bio blacklist', e);
    }
    const defaults = ['trans', 'onlyfans', 'premium', 'cashapp', 'venmo'];
    logger(`📝 Using default banned words: ${defaults.join(', ')}`);
    return defaults;
  }

  loadGenderFilter() {
    try {
      const stored = getSetting('genderFilter');
      if (stored) {
        return parseFilterList(stored);
      }
    } catch (e) {
      warnLog('Failed to load gender filter', e);
    }
    return []; // Empty means no filtering
  }

  loadAgeRange() {
    try {
      const minAge = getSetting('minAge', '18');
      const maxAge = getSetting('maxAge', '99');
      return { min: parseInt(minAge), max: parseInt(maxAge) };
    } catch (e) {
      warnLog('Failed to load age range', e);
      return { min: 18, max: 99 };
    }
  }

  loadMaxDistance() {
    try {
      const stored = getSetting('maxDistance');
      return stored ? parseInt(stored) : 999; // 999 = no limit
    } catch (e) {
      warnLog('Failed to load max distance', e);
      return 999;
    }
  }

  loadMinPhotoCount() {
    try {
      const stored = getSetting('minPhotoCount');
      return stored ? parseInt(stored) : 1; // Minimum 1 photo by default
    } catch (e) {
      warnLog('Failed to load min photo count', e);
      return 1;
    }
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
  async openProfile() {
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
        logger('🚪 Profile close command sent using profile close control');
        return true;
      }

      if (!this.isProfileModalOpen()) {
        logger('🚪 No profile modal detected; skipping profile close command');
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
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (!this.isProfileModalOpen()) {
        logger('✅ Modal confirmed closed');
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    logger('⚠️ Modal may still be open after timeout');
    return false;
  }
  // Wait for profile modal to open and load
  async waitForProfileModal(maxWait = 2000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      if (this.isProfileModalOpen()) {
        // Wait a bit more for content to load
        await new Promise((resolve) => setTimeout(resolve, 300));
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return false;
  }

  async waitForBioContent(maxWait = 5000) {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      const text = (this.getBioText() || '').trim();
      if (text && text.length >= 10) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    return false;
  }

  getBioText() {
    // Strategy 1: Find "About me" / "Sobre mim" heading and get the bio text from the same card
    try {
      const aboutMeHeadings = ['About me', 'Sobre mim'];
      const aboutMeHeading = Array.from(document.querySelectorAll('h2')).find(el =>
        aboutMeHeadings.includes(el.textContent?.trim())
      );

      if (aboutMeHeading) {
        // Find the parent card containing the heading
        const aboutMeCard = aboutMeHeading.closest('[class*="Bgc($c-ds-background-primary)"]') ||
          aboutMeHeading.closest('section') ||
          aboutMeHeading.parentElement;

        if (aboutMeCard) {
          // Get all text elements within the card
          const bioElements = aboutMeCard.querySelectorAll('.Typs\\(body-1-regular\\)');
          for (const bioEl of bioElements) {
            const bioText = bioEl.textContent?.trim().replace(/\s+/g, ' ');
            if (bioText && bioText.length > 0 && bioText.length < 2000) {
              // Make sure we're not getting the heading text itself
              if (bioText !== 'About me' && bioText !== 'Sobre mim') {
                return bioText;
              }
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }

    // Strategy 2: Fallback - direct selector (may pick wrong element but maintains compatibility)
    try {
      const bioElement = document.querySelector('.Typs\\(body-1-regular\\)');
      if (bioElement) {
        const bioText = bioElement.textContent?.trim().replace(/\s+/g, ' ') || '';
        if (bioText.length > 0 && bioText.length < 2000) {
          return bioText;
        }
      }
    } catch (e) {
      // ignore
    }

    // Strategy 3: Fallback to original structural selector approach
    const scrollContainer =
      document.querySelector('div[class*="M(16px)"]') || document.querySelector('.M\\(16px\\)');
    const scope =
      scrollContainer && scrollContainer.offsetParent !== null ? scrollContainer : document;

    let bioText = '';
    let foundBio = false;

    try {
      if (scrollContainer && scrollContainer.offsetParent !== null) {
        const allText = scrollContainer.textContent || '';

        const uiMarkers = [
          'Essentials',
          'Lifestyle',
          'Basics',
          'Looking for',
          'Languages',
          'Verified',
          'years',
          'last message',
          'mensagem',
          'Share',
          'Report',
          'Block'
        ];

        let bioCandidate = allText;
        let firstMarkerIndex = allText.length;

        for (const marker of uiMarkers) {
          const index = allText.indexOf(marker);
          if (index !== -1 && index < firstMarkerIndex) {
            firstMarkerIndex = index;
          }
        }

        if (firstMarkerIndex > 0) {
          bioCandidate = allText.substring(0, firstMarkerIndex);
        }

        bioCandidate = bioCandidate.trim().replace(/\s+/g, ' ');

        if (bioCandidate.length > 10 && bioCandidate.length < 2000) {
          bioText = bioCandidate;
          foundBio = true;
        }
      }
    } catch (e) {
      // ignore
    }

    // Strategy 4: Try finding bio text using structural selectors
    if (!foundBio) {
      try {
        const profileSections = scope.querySelectorAll(
          'section, div[class*="profile"], div[class*="content"]'
        );

        for (const section of profileSections) {
          const text = section.textContent?.trim() || '';
          if (text.length > 20 && text.length < 2000) {
            const filteredText = text
              .split(/Essentials|Lifestyle|Basics|Looking for|Languages|Verified/i)[0]
              .trim();

            if (filteredText.length > 10 && !filteredText.match(/^\d+$/)) {
              bioText = filteredText;
              foundBio = true;
              break;
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // Strategy 5: Fallback - look for any substantial text block
    if (!bioText) {
      try {
        const candidates = Array.from(scope.querySelectorAll('p, div, span')).filter((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          if (el.closest('h1,h2,h3,header,nav,button')) return false;
          const txt = (el.textContent || '').trim();
          return txt.length > 30 && txt.length < 2000;
        });
        candidates.sort((a, b) => (b.textContent || '').length - (a.textContent || '').length);
        if (candidates[0]) {
          bioText = (candidates[0].textContent || '').trim();
          foundBio = true;
        }
      } catch (e) {
        // ignore
      }
    }

    return bioText;
  }

  // Extract profile name from the DOM
  getProfileName() {
    try {
      // Strategy 1: Look for h1 with aria-label containing name and age
      const h1Elements = document.querySelectorAll('h1');
      for (const h1 of h1Elements) {
        const ariaLabel = h1.getAttribute('aria-label');
        if (ariaLabel) {
          // aria-label often contains "Name Age years"
          const match = ariaLabel.match(/^([^\d]+)/);
          if (match) {
            const name = match[1].replace(/years?\s*$/, '').trim();
            if (name && name.length > 0 && name.length < 100) {
              return name;
            }
          }
        }
      }

      // Strategy 2: Look for display-1 class elements containing the name
      const nameSelectors = [
        '[class*="display-1"]',
        '[class*="display-2"]',
        '[class*="Fxs(1)"][class*="Fxw(w)"] span:first-child'
      ];

      for (const selector of nameSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          const text = el.textContent?.trim();
          if (text && text.length > 0 && text.length < 100 && !/^\d+$/.test(text)) {
            if (!/years?$/i.test(text)) {
              return text;
            }
          }
        }
      }

      // Strategy 3: Look for the first span within h1 that is not just a number
      const h1Span = document.querySelector('h1 span:first-child');
      if (h1Span) {
        const name = h1Span.textContent?.trim();
        if (name && name.length > 0 && name.length < 100 && !/^\d+$/.test(name)) {
          return name;
        }
      }

      return null;
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

  getGenderIdentity(profileContext = this.getProfileContext()) {
    if (profileContext.gender) {
      return profileContext.gender.toLowerCase().trim();
    }

    // Look for gender/identity information in profile essentials
    const genderSelectors = [
      '[data-testid="gender"]',
      '.profileCard__gender',
      '.gender',
      '[class*="gender"]',
      '[class*="identity"]'
    ];

    for (const selector of genderSelectors) {
      const genderElement = document.querySelector(selector);
      if (genderElement && genderElement.textContent) {
        return genderElement.textContent.toLowerCase().trim();
      }
    }

    // Fallback: look in profile text for common gender identifiers
    const profileText = (this.getBioText() || '').toLowerCase();
    const genderKeywords = [
      'trans woman',
      'trans man',
      'non-binary',
      'genderfluid',
      'agender',
      'woman',
      'man',
      'mulher',
      'homem'
    ];

    for (const keyword of genderKeywords) {
      if (profileText.includes(keyword)) {
        return keyword;
      }
    }

    return null;
  }

  getProfileContextForAI() {
    const profileContext = this.getProfileContext();
    const fallbackDistance = this.getDistance(profileContext);

    return {
      ...profileContext,
      name: profileContext.name || this.getProfileName(),
      age: profileContext.age || this.getAge(profileContext),
      bio: profileContext.bio || this.getBioText() || '',
      gender: profileContext.gender || this.getGenderIdentity(profileContext),
      distance:
        profileContext.distance ||
        (fallbackDistance ? `${fallbackDistance.value} ${fallbackDistance.unit}` : null),
      photoCount: profileContext.photoCount || this.getPhotoCount(profileContext)
    };
  }

  isGenderFilterEnabled() {
    return getCheckboxValue('.tinderAutopilotGenderFilter');
  }

  isAdvancedFilterEnabled() {
    return getCheckboxValue('.tinderAutopilotAdvancedFilter');
  }

  // Check bio for banned words (call this AFTER opening the profile modal)
  async shouldSkipProfile() {
    const profileContext = this.getProfileContext();
    if (this.isBioFilterEnabled()) {
      this.bioBlacklist = this.loadBioBlacklist();
      const bioText = (profileContext.bio || this.getBioText() || '').toLowerCase();

      if (bioText) {
        for (const blacklistedWord of this.bioBlacklist) {
          if (bioText.includes(blacklistedWord)) {
            return true;
          }
        }
      }
    }

    // Check gender filtering
    if (this.isGenderFilterEnabled()) {
      const genderIdentity = this.getGenderIdentity(profileContext);
      this.genderFilter = this.loadGenderFilter();

      if (isGenderBlocked(genderIdentity, this.genderFilter)) {
        return true;
      }
    }

    // Check advanced filtering (age, distance, photo count)
    if (this.isAdvancedFilterEnabled()) {
      // Refresh settings from storage
      this.ageRange = this.loadAgeRange();
      this.maxDistance = this.loadMaxDistance();
      this.minPhotoCount = this.loadMinPhotoCount();

      const age = this.getAge(profileContext);
      const distance = this.getDistance(profileContext);
      const photoCount = this.getPhotoCount(profileContext);

      if (
        shouldSkipAdvancedProfile({
          age,
          distance,
          photoCount,
          ageRange: this.ageRange,
          maxDistance: this.maxDistance,
          minPhotoCount: this.minPhotoCount
        })
      ) {
        return true;
      }
    }

    return false;
  }

  // Main method to check profile with modal opening
  async checkProfileWithModal() {
    try {
      const hasActiveBioFilter = this.hasActiveBioFilter();
      const isGenderFilterEnabled = this.isGenderFilterEnabled();
      const isAdvancedFilterEnabled = this.isAdvancedFilterEnabled();

      // Check if AI filter is enabled
      const isAIFilterEnabled = AIProfileFilter.isEnabled();
      const requireModal = shouldRequireProfileModal({
        hasActiveBioFilter,
        isGenderFilterEnabled,
        isAdvancedFilterEnabled,
        isAIFilterEnabled
      });

      // If no filters enabled at all, skip the check
      if (!requireModal) {
        return false; // Don't skip
      }

      // IMPORTANT: Check if modal is already open from previous cycle
      if (this.isProfileModalOpen()) {
        this.closeProfile();
        await this.waitForModalClose(1500);
        // Wait a bit more before opening new one
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Open the profile
      const opened = await this.openProfile();

      if (!opened) {
        if (requireModal) {
          return true;
        }
        return false;
      }

      // Wait for modal to open
      const modalOpened = await this.waitForProfileModal(
        requireModal ? 5000 : 3000
      );

      if (!modalOpened) {
        if (requireModal) {
          this.closeProfile();
          await this.waitForModalClose(1000);
          return true;
        }
        this.closeProfile();
        await this.waitForModalClose(1000);
        return false;
      }

      // Check if should skip
      if (hasActiveBioFilter) {
        await this.waitForBioContent(5000);
      }
      let shouldSkip = await this.shouldSkipProfile();

      // If traditional filters passed, run AI filter if enabled
      if (!shouldSkip && isAIFilterEnabled) {
        const profileContext = this.getProfileContextForAI();
        logger('🤖 AI Filter enabled, analyzing profile...');
        try {
          const aiResult = await this.aiFilter.analyze({
            bio: profileContext.bio,
            name: profileContext.name,
            profile: profileContext
          });

          if (aiResult.shouldSwipe === 'neutral') {
            // IA failed — do not change the traditional filter decision
            logger(`🤖 AI Filter failed/neutral, relying on traditional filter result`);
          } else if (!aiResult.shouldSwipe) {
            // IA explicitly says NO
            shouldSkip = true;
            logger(`🤖 AI Filter rejected profile: ${aiResult.reason}`);
          } else {
            // IA explicitly says YES
            logger(`🤖 AI Filter approved profile: ${aiResult.reason}`);
          }
        } catch (error) {
          logger(`⚠️ AI Filter analysis failed: ${error.message}`);
        }
      }

      // Close the profile modal and WAIT for it to actually close
      await new Promise((_resolve) => setTimeout(_resolve, 200));
      this.closeProfile();

      await this.waitForModalClose(2000);

      // Extra safety wait
      await new Promise((_resolve) => setTimeout(_resolve, 300));

      return shouldSkip;
    } catch (e) {
      errorLog('Error checking profile with modal:', e);
      // If there's an error, close modal and don't skip
      try {
        this.closeProfile();
        await this.waitForModalClose(1000);
      } catch (_closeError) {
        // Ignore close errors
      }
      return false;
    }
  }

  analyzeProfile() {
    const bioText = this.getBioText();
    const analysis = {
      hasBio: bioText.length > 0,
      bioLength: bioText.length,
      containsBlacklistedWords: this.shouldSkipProfile(),
      bioText: bioText.substring(0, 100) // First 100 chars for logging
    };

    return analysis;
  }

  // Get age from profile
  getAge(profileContext = this.getProfileContext()) {
    if (profileContext.age) return profileContext.age;

    const ageSelectors = [
      '[data-testid="age"]',
      '.profileCard__age',
      '.age',
      '[class*="age"]',
      'h1', // Age often appears in main heading
      '.Fz\\(\\$xl\\)' // Tinder's specific class for age
    ];

    for (const selector of ageSelectors) {
      const ageElement = document.querySelector(selector);
      if (ageElement) {
        const ageText = ageElement.textContent;
        const ageMatch = ageText.match(/\b(\d{2})\b/); // Look for 2-digit age
        if (ageMatch && parseInt(ageMatch[1]) >= 18 && parseInt(ageMatch[1]) <= 99) {
          return parseInt(ageMatch[1]);
        }
      }
    }

    return null;
  }

  // Get photo count from profile
  getPhotoCount(profileContext = this.getProfileContext()) {
    if (profileContext.photoCount) return profileContext.photoCount;

    // Look for photo indicators
    const photoSelectors = [
      '.keen-slider__slide img',
      '[data-testid="photo"]',
      '.profileCard__photo',
      '.photo',
      '[class*="photo"]',
      '.slider img',
      '.carousel img'
    ];

    let photoCount = 0;
    for (const selector of photoSelectors) {
      const photos = document.querySelectorAll(selector);
      if (photos.length > photoCount) {
        photoCount = photos.length;
      }
    }

    // Fallback: look for photo dots/indicators
    if (photoCount === 0) {
      const dotSelectors = [
        '.keen-slider__dot',
        '[class*="dot"]',
        '[class*="indicator"]',
        '.slider-dots > *',
        '.carousel-indicators > *'
      ];

      for (const selector of dotSelectors) {
        const dots = document.querySelectorAll(selector);
        if (dots.length > 0) {
          photoCount = dots.length;
          break;
        }
      }
    }

    return photoCount || 1; // Default to 1 if can't detect
  }

  // Get distance from profile
  getDistance(profileContext = this.getProfileContext()) {
    const profileDistance = parseProfileDistance(profileContext.distance);
    if (profileDistance) return profileDistance;

    const distanceSelectors = [
      '[data-testid="distance"]',
      '.profileCard__distance',
      '.distance',
      '[class*="distance"]',
      '[class*="miles"]',
      '[class*="km"]'
    ];

    for (const selector of distanceSelectors) {
      const distanceElement = document.querySelector(selector);
      if (distanceElement) {
        const distanceText = distanceElement.textContent;
        const distanceMatch = distanceText.match(/(\d+)\s*(miles?|km|kilometers?)/i);
        if (distanceMatch) {
          return {
            value: parseInt(distanceMatch[1]),
            unit: distanceMatch[2].toLowerCase()
          };
        }
      }
    }

    return null;
  }
}

export default ProfileAnalyzer;
