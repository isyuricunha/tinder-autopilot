import { logger } from '../misc/helper';

class ProfileAnalyzer {
  constructor() {
    this.bioBlacklist = this.loadBioBlacklist();
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

  shouldSkipProfile() {
    if (!this.isBioFilterEnabled()) {
      return false;
    }

    const bioText = this.getBioText();
    if (!bioText) {
      return false; // No bio found, don't skip
    }

    // Refresh blacklist from storage
    this.bioBlacklist = this.loadBioBlacklist();

    // Check if bio contains any blacklisted words
    for (const blacklistedWord of this.bioBlacklist) {
      if (bioText.includes(blacklistedWord)) {
        logger(`⚠️ Skipped profile - bio contains: "${blacklistedWord}"`);
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
      '[class*="age"]'
    ];

    for (const selector of ageSelectors) {
      const ageElement = document.querySelector(selector);
      if (ageElement) {
        const ageText = ageElement.textContent;
        const ageMatch = ageText.match(/\d+/);
        if (ageMatch) {
          return parseInt(ageMatch[0]);
        }
      }
    }

    return null;
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
