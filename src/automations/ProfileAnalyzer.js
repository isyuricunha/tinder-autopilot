import { logger } from '../misc/helper';

class ProfileAnalyzer {
  constructor() {
    this.bioBlacklist = this.loadBioBlacklist();
    this.genderFilter = this.loadGenderFilter();
    this.ageRange = this.loadAgeRange();
    this.maxDistance = this.loadMaxDistance();
    this.minPhotoCount = this.loadMinPhotoCount();
  }

  loadBioBlacklist() {
    try {
      const stored = localStorage.getItem('TinderAutopilot/bioBlacklist');
      if (stored) {
        const words = stored.toLowerCase().split(',').map(word => word.trim()).filter(word => word.length > 0);
        logger(`📝 Loaded ${words.length} banned words: ${words.join(', ')}`);
        return words;
      }
    } catch (e) {
      console.warn('Failed to load bio blacklist', e);
    }
    const defaults = ['trans', 'onlyfans', 'premium', 'cashapp', 'venmo'];
    logger(`📝 Using default banned words: ${defaults.join(', ')}`);
    return defaults;
  }

  loadGenderFilter() {
    try {
      const stored = localStorage.getItem('TinderAutopilot/genderFilter');
      if (stored) {
        return stored.toLowerCase().split(',').map(word => word.trim()).filter(word => word.length > 0);
      }
    } catch (e) {
      console.warn('Failed to load gender filter', e);
    }
    return []; // Empty means no filtering
  }

  loadAgeRange() {
    try {
      const minAge = localStorage.getItem('TinderAutopilot/minAge') || '18';
      const maxAge = localStorage.getItem('TinderAutopilot/maxAge') || '99';
      return { min: parseInt(minAge), max: parseInt(maxAge) };
    } catch (e) {
      console.warn('Failed to load age range', e);
      return { min: 18, max: 99 };
    }
  }

  loadMaxDistance() {
    try {
      const stored = localStorage.getItem('TinderAutopilot/maxDistance');
      return stored ? parseInt(stored) : 999; // 999 = no limit
    } catch (e) {
      console.warn('Failed to load max distance', e);
      return 999;
    }
  }

  loadMinPhotoCount() {
    try {
      const stored = localStorage.getItem('TinderAutopilot/minPhotoCount');
      return stored ? parseInt(stored) : 1; // Minimum 1 photo by default
    } catch (e) {
      console.warn('Failed to load min photo count', e);
      return 1;
    }
  }

  isBioFilterEnabled() {
    try {
      const checkbox = document.querySelector('.tinderAutopilotBioFilter .toggleSwitch > div');
      if (!checkbox) return false;
      
      const style = checkbox.style.cssText;
      const isEnabled = style.includes('linear-gradient(135deg, #ff6b35, #ff8c42)') || 
                        style.includes('linear-gradient(135deg, rgb(255, 107, 53), rgb(255, 140, 66))');
      
      logger(`🔍 Bio Filter Status: ${isEnabled}`);
      return isEnabled;
    } catch (e) {
      return false;
    }
  }

  // Open the profile modal by clicking on the card
  openProfile() {
    try {
      logger('🔍 Opening profile by clicking card...');
      
      // Find the profile card image or container to click
      const cardSelectors = [
        '.keen-slider__slide:not(.keen-slider__slide--clone) img',
        '[data-testid="card-stack"] img',
        '.Expand img',
        '.StretchedBox img',
        '.keen-slider__slide:not(.keen-slider__slide--clone)',
        '[data-testid="card-stack"] > div > div',
        '.Expand',
        '.StretchedBox'
      ];
      
      for (const selector of cardSelectors) {
        const cards = document.querySelectorAll(selector);
        for (const card of cards) {
          if (card && card.offsetParent !== null && card.offsetWidth > 0) {
            logger(`✅ Found card with selector: ${selector}`);
            card.click();
            return true;
          }
        }
      }
      
      logger('❌ No clickable card found');
      return false;
    } catch (e) {
      logger(`💥 Error opening profile: ${e.message}`);
      return false;
    }
  }

  // Check if profile modal is open
  isProfileModalOpen() {
    // Primary method: Check for profile-specific data-testid attributes
    // These only appear when the profile modal is actually open
    const profileElements = document.querySelectorAll('[data-testid*="profile"]');
    if (profileElements.length > 0) {
      logger(`✅ Profile modal detected via data-testid (${profileElements.length} elements)`);
      return true;
    }

    // Secondary method: Look for profile content containers
    const modalSelectors = [
      '.profileContent',
      '[class*="profileContent"]',
      '[class*="ProfileContent"]',
      '.Expand[class*="enterAnimation"]'
    ];

    for (const selector of modalSelectors) {
      const modal = document.querySelector(selector);
      if (modal && modal.offsetParent !== null) {
        // Verify it has substantial content (likely a profile)
        const textLength = modal.textContent?.length || 0;
        if (textLength > 100) {
          logger(`✅ Profile modal detected via ${selector} (${textLength} chars)`);
          return true;
        }
      }
    }

    logger('❌ Profile modal NOT detected');
    return false;
  }

  // Close the profile modal by clicking close button
  closeProfile() {
    try {
      const closeSelectors = [
        'button[aria-label*="Close"]',
        'button[aria-label*="Back"]',
        'button.Pos\\(a\\)',
        '[data-testid="modal-close-button"]',
        '.modal button:first-child',
        'button[title*="Close"]',
        'button[title*="Back"]'
      ];
      
      for (const selector of closeSelectors) {
        const closeBtn = document.querySelector(selector);
        if (closeBtn && closeBtn.offsetParent !== null) {
          logger('🚪 Closing profile by clicking close button');
          closeBtn.click();
          return true;
        }
      }
      
      logger('⚠️ No close button found');
      return false;
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
      await new Promise(resolve => setTimeout(resolve, 100));
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
        await new Promise(resolve => setTimeout(resolve, 300));
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
  }

  getBioText() {
    // Try multiple selectors for bio content in the modal
    const bioSelectors = [
      '[data-testid="bio"]',
      '[data-testid*="bio"]',
      '.profileCard__bio',
      '.bio',
      '[aria-label*="bio"]',
      '[aria-label*="Bio"]',
      '.profileContent__bio',
      '.profile-bio'
    ];

    // First, try to find the bio element directly
    for (const selector of bioSelectors) {
      const bioElement = document.querySelector(selector);
      if (bioElement && bioElement.textContent) {
        const bioText = bioElement.textContent.toLowerCase().trim();
        logger(`📝 Found bio via ${selector} (${bioText.length} chars)`);
        if (bioText.length > 0) {
          return bioText;
        }
      }
    }

    // Fallback 1: Look for profile-specific content containers
    try {
      const profileContainers = document.querySelectorAll('[data-testid*="profile"], .profileContent, [class*="ProfileContent"]');
      for (const container of profileContainers) {
        if (!container || !container.offsetParent) continue;
        
        // Clone and clean the container
        const clone = container.cloneNode(true);
        
        // Remove unwanted elements
        clone.querySelectorAll('button, nav, header, script, style, img, svg').forEach(el => el.remove());
        
        const textContent = clone.textContent?.trim();
        if (textContent && textContent.length > 10 && textContent.length < 2000) {
          const bioText = textContent.toLowerCase();
          logger(`📝 Extracted profile text from container (${bioText.length} chars)`);
          return bioText;
        }
      }
    } catch (e) {
      logger(`⚠️ Bio extraction from profile container failed: ${e.message}`);
    }

    // Fallback 2: Get all visible text content from the page and filter
    try {
      const bodyText = document.body.textContent?.toLowerCase() || '';
      // Bio text is typically between 10 and 500 characters
      // We'll return the full body text and let the filter check it
      if (bodyText.length > 0) {
        logger(`📝 Using full page text as fallback (${bodyText.length} chars)`);
        return bodyText;
      }
    } catch (e) {
      logger(`⚠️ Fallback bio extraction failed: ${e.message}`);
    }

    logger('⚠️ No bio text found');
    return '';
  }

  getGenderIdentity() {
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
    const profileText = this.getBioText();
    const genderKeywords = ['woman', 'man', 'trans woman', 'trans man', 'non-binary', 'genderfluid', 'agender'];
    
    for (const keyword of genderKeywords) {
      if (profileText.includes(keyword)) {
        return keyword;
      }
    }

    return null;
  }

  isGenderFilterEnabled() {
    try {
      const checkbox = document.querySelector('.tinderAutopilotGenderFilter .toggleSwitch > div');
      if (!checkbox) return false;
      
      const style = checkbox.style.cssText;
      return style.includes('linear-gradient(135deg, #ff6b35, #ff8c42)') || 
             style.includes('linear-gradient(135deg, rgb(255, 107, 53), rgb(255, 140, 66))');
    } catch (e) {
      return false;
    }
  }

  isAdvancedFilterEnabled() {
    try {
      const checkbox = document.querySelector('.tinderAutopilotAdvancedFilter .toggleSwitch > div');
      if (!checkbox) return false;
      
      const style = checkbox.style.cssText;
      return style.includes('linear-gradient(135deg, #ff6b35, #ff8c42)') || 
             style.includes('linear-gradient(135deg, rgb(255, 107, 53), rgb(255, 140, 66))');
    } catch (e) {
      return false;
    }
  }

  // Check bio for banned words (call this AFTER opening the profile modal)
  async shouldSkipProfile() {
    // Check bio filtering
    if (this.isBioFilterEnabled()) {
      const bioText = this.getBioText();
      if (bioText) {
        // Refresh blacklist from storage
        this.bioBlacklist = this.loadBioBlacklist();

        // Check if bio contains any blacklisted words
        for (const blacklistedWord of this.bioBlacklist) {
          if (bioText.includes(blacklistedWord)) {
            logger(`⛔ BLOCKED - Bio contains: "${blacklistedWord}"`);
            return true;
          }
        }
        logger(`✅ Bio checked - no banned words found`);
      } else {
        logger(`ℹ️ No bio found to check`);
      }
    }

    // Check gender filtering
    if (this.isGenderFilterEnabled()) {
      const genderIdentity = this.getGenderIdentity();
      if (genderIdentity) {
        // Refresh gender filter from storage
        this.genderFilter = this.loadGenderFilter();
        
        if (this.genderFilter.length > 0) {
          const shouldSkip = this.genderFilter.some(filterGender => 
            genderIdentity.includes(filterGender)
          );
          
          if (shouldSkip) {
            logger(`⚠️ Skipped profile - gender: "${genderIdentity}"`);
            return true;
          }
        }
      }
    }

    // Check advanced filtering (age, distance, photo count)
    if (this.isAdvancedFilterEnabled()) {
      // Refresh settings from storage
      this.ageRange = this.loadAgeRange();
      this.maxDistance = this.loadMaxDistance();
      this.minPhotoCount = this.loadMinPhotoCount();

      // Age filtering
      const age = this.getAge();
      if (age && (age < this.ageRange.min || age > this.ageRange.max)) {
        logger(`⚠️ Skipped profile - age ${age} outside range ${this.ageRange.min}-${this.ageRange.max}`);
        return true;
      }

      // Distance filtering
      const distance = this.getDistance();
      if (distance && distance.value > this.maxDistance) {
        logger(`⚠️ Skipped profile - distance ${distance.value}${distance.unit} > ${this.maxDistance}`);
        return true;
      }

      // Photo count filtering
      const photoCount = this.getPhotoCount();
      if (photoCount < this.minPhotoCount) {
        logger(`⚠️ Skipped profile - only ${photoCount} photos (min: ${this.minPhotoCount})`);
        return true;
      }
    }

    return false;
  }

  // Main method to check profile with modal opening
  async checkProfileWithModal() {
    try {
      // If bio filter is not enabled, skip the check
      if (!this.isBioFilterEnabled() && !this.isGenderFilterEnabled() && !this.isAdvancedFilterEnabled()) {
        logger('ℹ️ No filters enabled, allowing profile');
        return false; // Don't skip
      }

      logger('🚀 === STARTING BIO CHECK ===');
      logger(`📋 Filters enabled: Bio=${this.isBioFilterEnabled()}, Gender=${this.isGenderFilterEnabled()}, Advanced=${this.isAdvancedFilterEnabled()}`);
      
      // IMPORTANT: Check if modal is already open from previous cycle
      if (this.isProfileModalOpen()) {
        logger('⚠️ Modal already open from previous cycle - closing it first');
        this.closeProfile();
        await this.waitForModalClose(1500);
        // Wait a bit more before opening new one
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Open the profile
      const opened = this.openProfile();
      logger(`🔓 Profile open attempt: ${opened}`);
      
      if (!opened) {
        logger('❌ FAILED to open profile, ALLOWING by default (to be safe)');
        return false;
      }

      // Wait for modal to open
      logger('⏳ Waiting for modal to load...');
      const modalOpened = await this.waitForProfileModal(3000);
      logger(`📂 Modal opened: ${modalOpened}`);
      
      if (!modalOpened) {
        logger('❌ Modal did NOT open after 3s, ALLOWING profile');
        this.closeProfile(); // Try to close anything that might have opened
        await this.waitForModalClose(1000);
        return false;
      }

      // Check if should skip
      logger('🔬 Analyzing bio content...');
      const shouldSkip = await this.shouldSkipProfile();
      logger(`🎯 Final decision: ${shouldSkip ? 'BLOCK ❌' : 'ALLOW ✅'}`);

      // Close the profile modal and WAIT for it to actually close
      logger('🚪 Closing modal...');
      await new Promise(resolve => setTimeout(resolve, 200));
      this.closeProfile();
      
      // CRITICAL: Wait and verify modal actually closed
      await this.waitForModalClose(2000);
      
      // Extra safety wait
      await new Promise(resolve => setTimeout(resolve, 300));
      logger('🏁 === BIO CHECK COMPLETE ===');

      return shouldSkip;
    } catch (e) {
      logger(`💥 EXCEPTION in checkProfileWithModal: ${e.message}`);
      console.error('Error checking profile with modal:', e);
      // If there's an error, close modal and don't skip
      try {
        this.closeProfile();
        await this.waitForModalClose(1000);
      } catch (closeError) {
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
  getAge() {
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
  getPhotoCount() {
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
  getDistance() {
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
