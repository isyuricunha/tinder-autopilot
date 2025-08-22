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
        return stored.toLowerCase().split(',').map(word => word.trim()).filter(word => word.length > 0);
      }
    } catch (e) {
      console.warn('Failed to load bio blacklist', e);
    }
    return ['trans', 'onlyfans', 'premium', 'cashapp', 'venmo'];
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
      return checkbox && checkbox.className.includes('justify-content: center');
    } catch (e) {
      return false;
    }
  }

  getBioText() {
    // Try multiple selectors for bio content
    const bioSelectors = [
      '[data-testid="bio"]',
      '.profileCard__bio',
      '.bio',
      '.Expand[aria-label*="bio"]',
      '.Expand[aria-label*="Bio"]',
      '[aria-label*="bio"]',
      '.profileContent__bio',
      '.profile-bio'
    ];

    for (const selector of bioSelectors) {
      const bioElement = document.querySelector(selector);
      if (bioElement && bioElement.textContent) {
        return bioElement.textContent.toLowerCase().trim();
      }
    }

    // Fallback: look for any text content in profile area
    try {
      const profileCards = document.querySelectorAll('[class*="profile"], [class*="card"]');
      for (const card of profileCards) {
        const textContent = card.textContent?.toLowerCase().trim();
        if (textContent && textContent.length > 10 && textContent.length < 500) {
          return textContent;
        }
      }
    } catch (e) {
      console.warn('Bio extraction fallback failed', e);
    }

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
      return checkbox && checkbox.className.includes('justify-content: center');
    } catch (e) {
      return false;
    }
  }

  isAdvancedFilterEnabled() {
    try {
      const checkbox = document.querySelector('.tinderAutopilotAdvancedFilter .toggleSwitch > div');
      return checkbox && checkbox.style.cssText.includes('background: linear-gradient(135deg, #ff6b35, #ff8c42)');
    } catch (e) {
      return false;
    }
  }

  shouldSkipProfile() {
    // Check bio filtering
    if (this.isBioFilterEnabled()) {
      const bioText = this.getBioText();
      if (bioText) {
        // Refresh blacklist from storage
        this.bioBlacklist = this.loadBioBlacklist();

        // Check if bio contains any blacklisted words
        for (const blacklistedWord of this.bioBlacklist) {
          if (bioText.includes(blacklistedWord)) {
            logger(`⚠️ Skipped profile - bio contains: "${blacklistedWord}"`);
            return true;
          }
        }
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
