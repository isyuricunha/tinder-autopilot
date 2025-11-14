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
  async openProfile() {
    try {
      logger('🔍 Opening profile modal...');
      
      // Strategy 1: Find and click the actual info button on the card
      logger('🔍 Looking for info button on card...');
      
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
        // Button with focus styles
        'button.focus-button-style',
        // Any button at the bottom of the visible card
        '.keen-slider__slide--active button',
        '.keen-slider__slide:first-child button',
        // Last resort: any small button on the card
        '.recsCardboard button[type="button"]'
      ];
      
      for (const selector of infoButtonSelectors) {
        try {
          const buttons = document.querySelectorAll(selector);
          logger(`  Checking ${selector}: ${buttons.length} buttons found`);
          
          for (const button of buttons) {
            if (button && button.offsetParent !== null && !button.disabled) {
              // Check if button is at the bottom of screen (info buttons are usually there)
              const rect = button.getBoundingClientRect();
              const isAtBottom = rect.top > window.innerHeight * 0.6;
              
              // Check if button is small (info buttons are usually small)
              const isSmallButton = rect.width < 100 && rect.height < 100;
              
              if (isAtBottom || isSmallButton) {
                logger(`✅ Clicking potential info button: ${selector}`);
                logger(`  Position: ${rect.left},${rect.top} Size: ${rect.width}x${rect.height}`);
                button.click();
                
                // Wait and check if modal opened
                await new Promise(resolve => setTimeout(resolve, 500));
                if (this.isProfileModalOpen()) {
                  logger('✅ Successfully opened profile!');
                  return true;
                }
              }
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      // Strategy 2: Try UP arrow key as fallback
      logger('⌨️ Trying UP arrow key as fallback...');
      const upEvents = [
        new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, which: 38, bubbles: true, cancelable: true }),
        new KeyboardEvent('keyup', { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, which: 38, bubbles: true, cancelable: true })
      ];
      const upTargets = [
        document.activeElement,
        document.querySelector('[data-keyboard-gamepad="true"]'),
        document.querySelector('.recsCardboard__cardsContainer'),
        document.querySelector('[data-testid="card-stack"]'),
        document.body,
        document
      ].filter(Boolean);
      for (const ev of upEvents) {
        for (const tgt of upTargets) {
          tgt.dispatchEvent(ev);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (this.isProfileModalOpen()) {
        logger('✅ Opened profile with UP arrow!');
        return true;
      }
      
      // Strategy 3: Click on the card image itself (sometimes works)
      logger('👆 Trying to click on card image...');
      const imageSelectors = [
        '.keen-slider__slide--active img',
        '.keen-slider__slide:first-child img',
        '.StretchedBox img',
        '.Expand img'
      ];
      
      for (const selector of imageSelectors) {
        const img = document.querySelector(selector);
        if (img && img.offsetParent !== null) {
          const rect = img.getBoundingClientRect();
          // Click bottom part of image (often triggers info)
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: rect.left + rect.width / 2,
            clientY: rect.bottom - 50
          });
          
          logger(`👆 Clicking bottom of image: ${selector}`);
          img.dispatchEvent(clickEvent);
          
          await new Promise(resolve => setTimeout(resolve, 500));
          if (this.isProfileModalOpen()) {
            logger('✅ Opened profile by clicking image!');
            return true;
          }
        }
      }
      
      // Strategy 4: Try Enter or Space key as fallback
      logger('🔍 Trying Enter/Space keys...');
      const keyEvents = [
        new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }),
        new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }),
        new KeyboardEvent('keydown', { key: ' ', code: 'Space', keyCode: 32, which: 32, bubbles: true }),
        new KeyboardEvent('keyup', { key: ' ', code: 'Space', keyCode: 32, which: 32, bubbles: true })
      ];
      
      const keyTargets = [
        document.activeElement,
        document.querySelector('[data-keyboard-gamepad="true"]'),
        document.querySelector('.recsCardboard__cardsContainer'),
        document.querySelector('.keen-slider__slide:not(.keen-slider__slide--clone)'),
        document.querySelector('[data-testid="card-stack"]'),
        document.body,
        document
      ].filter(Boolean);
      
      for (const event of keyEvents) {
        for (const target of keyTargets) {
          target.dispatchEvent(event);
          await new Promise(resolve => setTimeout(resolve, 200));
          
          if (this.isProfileModalOpen()) {
            logger(`✅ Opened profile with ${event.key} key`);
            return true;
          }
        }
      }
      
      // Strategy 5: Click on specific areas of the card (fallback)
      logger('🔍 Trying to click card center...');
      const cardSelectors = [
        '.keen-slider__slide:not(.keen-slider__slide--clone)',
        '[data-keyboard-gamepad="true"]',
        '.recsCardboard__card',
        '[data-testid="card-stack"] > div > div',
        '.Expand.Animdur',
        '.gamepad-card-stack__card'
      ];
      
      for (const selector of cardSelectors) {
        const cards = document.querySelectorAll(selector);
        for (const card of cards) {
          if (card && card.offsetParent !== null && card.offsetWidth > 0) {
            // Click in the center of the card
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
            
            logger(`👆 Clicking center of card: ${selector}`);
            card.dispatchEvent(clickEvent);
            const dblClick = new MouseEvent('dblclick', { view: window, bubbles: true, cancelable: true, clientX: centerX, clientY: centerY });
            card.dispatchEvent(dblClick);
            
            // Wait and check if modal opened
            await new Promise(resolve => setTimeout(resolve, 500));
            if (this.isProfileModalOpen()) {
              logger('✅ Opened profile by clicking card!');
              return true;
            }
          }
        }
      }
      
      logger('❌ WARNING: Could not open profile with any method!');
      logger('🔍 The extension may not be able to check bios.');
      logger('💡 TIP: Try manually pressing UP arrow to see if profile opens.');
      
      // Return false - we couldn't open the profile
      return false;
    } catch (e) {
      logger(`💥 Error opening profile: ${e.message}`);
      return false;
    }
  }

  // Check if profile modal is open
  isProfileModalOpen() {
    // More specific check - profile modal should have BOTH scroll container AND specific profile elements
    
    // Look for the scrollable container
    const scrollContainer = document.querySelector('.Ovs\\(touch\\)');
    if (!scrollContainer || scrollContainer.offsetParent === null) {
      return false;
    }
    
    // But also verify it contains profile-specific content (not just any scrollable)
    const hasProfileContent = 
      scrollContainer.querySelector('section[aria-labelledby]') ||
      scrollContainer.querySelector('.Px\\(16px\\)--ml') ||
      scrollContainer.querySelector('h2') ||
      scrollContainer.querySelector('img') ||
      scrollContainer.querySelector('.keen-slider');
    
    if (!hasProfileContent) {
      return false;
    }
    
    // Additional check: the container should be large (profile modal size)
    const rect = scrollContainer.getBoundingClientRect();
    const isLargeEnough = rect.width > 300 && rect.height > 400;
    
    if (isLargeEnough) {
      logger(`✅ Profile modal detected (${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px)`);
      return true;
    }
    
    // Fallback: Look for specific profile modal classes
    const profileContentSelectors = [
      '.Expand.profileContent',
      '.profileContent',
      'div[class*="profileContent"]',
      '.Pos\\(r\\)--ml.Z\\(1\\).Bgc\\(\\$c-ds-background-primary\\).Ov\\(h\\).Expand.profileContent'
    ];

    for (const selector of profileContentSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          if (element && element.offsetParent !== null) {
            // Check if this is actually a profile with substantial content
            const hasText = element.textContent && element.textContent.length > 50;
            const hasImages = element.querySelector('img') || element.querySelector('.keen-slider');
            const hasSections = element.querySelector('section') || element.querySelector('ul');
            
            if (hasText || hasImages || hasSections) {
              // Additional check: profile should be wider than a card
              const rect = element.getBoundingClientRect();
              if (rect.width > 400 || rect.height > 500) {
                logger(`✅ Profile modal detected via ${selector} (${element.textContent?.length || 0} chars, ${rect.width}x${rect.height}px)`);
                return true;
              }
            }
          }
        }
      } catch (e) {
        // Continue checking other selectors
      }
    }
    
    // Strategy 2: Check for profile-specific elements that only appear in expanded view
    const profileOnlyElements = [
      '[aria-labelledby*=":r"]',
      '.Mb\\(16px\\).C\\(\\$c-ds-text-secondary\\)',
      '.keen-slider__slide:nth-child(3)',
      'button[aria-label*="back" i]',
      'button[aria-label*="close" i]',
      'button[title*="voltar" i]',
      'button[title*="fechar" i]'
    ];
    
    for (const selector of profileOnlyElements) {
      try {
        const element = document.querySelector(selector);
        if (element && element.offsetParent !== null) {
          logger(`✅ Profile modal detected via unique element: ${selector}`);
          return true;
        }
      } catch (e) {
        // Continue
      }
    }
    
    // Strategy 3: Check if the view has changed (card stack hidden)
    const cardStack = document.querySelector('.recsCardboard__cardsContainer');
    const hasHiddenCards = cardStack && (cardStack.style.display === 'none' || cardStack.style.visibility === 'hidden');
    if (hasHiddenCards) {
      logger('✅ Profile modal detected (card stack hidden)');
      return true;
    }
    
    // Strategy 4: Check URL or history state
    if (window.location.pathname.includes('/profile') || window.location.search.includes('profile=')) {
      logger('✅ Profile modal detected via URL');
      return true;
    }

    logger('❌ Profile modal NOT detected');
    return false;
  }

  // Close the profile modal by clicking close button
  closeProfile() {
    try {
      // Strategy 1: Try DOWN arrow key (most reliable for closing profile)
      logger('⌨️ Using DOWN arrow to close profile...');
      const downEvents = [
        new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40, bubbles: true, cancelable: true }),
        new KeyboardEvent('keyup', { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40, bubbles: true, cancelable: true })
      ];
      
      // Dispatch to multiple targets
      const targets = [
        document.activeElement,
        document.querySelector('.Ovs\\(touch\\)'),
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
        clientX: 10,  // Click far left
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
        new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true }),
        new KeyboardEvent('keyup', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true })
      ];
      for (const ev of escapeEvents) document.dispatchEvent(ev);

      const closeCandidates = Array.from(document.querySelectorAll('button, [role="button"]'));
      for (const btn of closeCandidates) {
        const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
        const title = (btn.getAttribute('title') || '').toLowerCase();
        const dtid = (btn.getAttribute('data-testid') || '').toLowerCase();
        const txt = (btn.textContent || '').toLowerCase();
        const content = `${aria} ${title} ${dtid} ${txt}`;
        if (content.includes('back') || content.includes('close') || content.includes('voltar') || content.includes('fechar')) {
          btn.click();
          break;
        }
      }
      
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
    // Look for bio in the scrollable profile content
    const scrollContainer = document.querySelector('.Ovs\\(touch\\)');
    if (!scrollContainer) {
      logger('📝 No scroll container found');
      return '';
    }
    
    // Bio is usually in a specific section BEFORE "Essentials"
    // Find all text elements within the scroll container
    const textElements = scrollContainer.querySelectorAll('.C\\(\\$c-ds-text-primary\\), .Typs\\(body-1-regular\\), .BreakWord');
    
    let bioText = '';
    let foundBio = false;
    
    try {
      for (const element of textElements) {
        const text = element.textContent?.trim() || '';
      
      // Skip navigation and UI text
      if (text.includes('Essentials') || 
          text.includes('Lifestyle') || 
          text.includes('Basics') ||
          text.includes('Looking for') ||
          text.includes('Languages') ||
          text.includes('Verified') ||
          text.includes('years') ||
          text.length < 10) {
        continue;
      }
      
      // Bio is usually a longer text block
      if (text.length > 30) {
        // Check if this element is actually visible and not a duplicate
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Check if parent is not a section header
          const parent = element.closest('section');
          if (!parent || !parent.querySelector('h2')) {
            bioText = text;
            foundBio = true;
            logger(`📝 Bio found: "${text.substring(0, 50)}..." (${text.length} chars)`);
            break;
          }
        }
      }
      } // Close the for loop
    } catch (e) {
      logger(`⚠️ Bio extraction from profile container failed: ${e.message}`);
    }

    if (!foundBio) {
      // Try more specific bio selectors within the scroll container
      const bioSelectors = [
        '.Px\\(16px\\)--ml.Pb\\(24px\\)--ml',
        '.My\\(12px\\)',
        '.BreakWord.Ws\\(nw\\)',
        '.C\\(\\$c-ds-text-primary\\).Whs\\(pl\\)'
      ];
      
      for (const selector of bioSelectors) {
        const bioElement = scrollContainer.querySelector(selector);
        if (bioElement && bioElement.textContent) {
          const text = bioElement.textContent.trim();
          if (text.length > 20 && 
              !text.includes('Essentials') && 
              !text.includes('Looking for')) {
            bioText = text;
            foundBio = true;
            logger(`📝 Bio found with selector ${selector}: "${text.substring(0, 50)}..." (${text.length} chars)`);
            break;
          }
        }
      }
    }
    
    if (!bioText) {
      try {
        const candidates = Array.from(scrollContainer.querySelectorAll('p, div, span')).filter(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          if (el.closest('h1,h2,h3,header,nav,button')) return false;
          const txt = (el.textContent || '').trim();
          return txt.length > 30;
        });
        candidates.sort((a, b) => (b.textContent || '').length - (a.textContent || '').length);
        if (candidates[0]) {
          bioText = (candidates[0].textContent || '').trim();
        }
      } catch (e) {
        // ignore
      }
    }
    
    if (!bioText) {
      logger('📝 No bio text found in profile - user may not have a bio');
    }
    
    return bioText;
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
      const opened = await this.openProfile();
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
