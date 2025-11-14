import { logger, generateRandomNumber } from '../misc/helper';
import Interactions from '../misc/Interactions';
import ProfileAnalyzer from './ProfileAnalyzer';
import SuperLiker from './SuperLiker';

class Swiper {
  selector = '.tinderAutopilot';

  isRunning = false;

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
    logger('Autopilot stopped ⛔️');
  };

  canSwipe = () => {
    const likeButton = this.hasLike();
    const hasProfile = this.hasProfile();
    const noBlockingModals = !document.querySelector('.beacon__circle') && 
                            !document.querySelector('[data-testid="modal"]') &&
                            !document.querySelector('.modal') &&
                            !document.querySelector('[role="dialog"]');
    
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
      const events = [
        new KeyboardEvent('keydown', { key: key, code: key, keyCode: keyCode, which: keyCode, bubbles: true, cancelable: true, view: window }),
        new KeyboardEvent('keypress', { key: key, code: key, keyCode: keyCode, which: keyCode, bubbles: true, cancelable: true, view: window }),
        new KeyboardEvent('keyup', { key: key, code: key, keyCode: keyCode, which: keyCode, bubbles: true, cancelable: true, view: window })
      ];
      
      // Try dispatching on different elements
      const targets = [
        document,
        document.body,
        document.activeElement,
        document.querySelector('[data-testid="card-stack"]'),
        document.querySelector('.recsCardboard__cards'),
        document.querySelector('.gamepad-card'),
        window
      ].filter(Boolean);
      
      for (const target of targets) {
        for (const event of events) {
          target.dispatchEvent(event);
        }
      }
      
      return true;
    } catch (e) {
      logger(`⚠️ Error pressing key ${key}: ${e.message}`);
      return false;
    }
  };

  // Save current profile ID to detect changes
  getCurrentProfileId = () => {
    try {
      // Try to get a unique identifier from the current profile
      const nameElement = document.querySelector('h1[aria-label*="years"]') || 
                          document.querySelector('[itemprop="name"]') ||
                          document.querySelector('h1');
      
      if (nameElement) {
        return nameElement.textContent;
      }
      
      // Fallback: use first image src as identifier
      const firstImage = document.querySelector('.keen-slider__slide img, [data-testid="card-stack"] img');
      if (firstImage && firstImage.src) {
        return firstImage.src;
      }
      
      return Date.now().toString(); // Fallback to timestamp
    } catch (e) {
      return Date.now().toString();
    }
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

    console.log('🔍 Checking for profile...');
    
    for (const selector of profileSelectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`  ${selector}: ${elements.length} elements`);
      
      for (const element of elements) {
        if (element && element.offsetParent !== null && element.offsetWidth > 0 && element.offsetHeight > 0) {
          console.log(`✅ Profile found with selector: ${selector}`);
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
      console.log(`  Images ${selector}: ${images.length} found`);
      if (images.length > 0) {
        for (const img of images) {
          if (img.offsetParent !== null && img.complete && img.naturalWidth > 0) {
            console.log(`✅ Profile image found: ${img.src.substring(0, 50)}...`);
            return true;
          }
        }
      }
    }

    console.log('❌ No profile detected');
    return false;
  };

  hasLike = () => {
    // Prefer explicit Like selectors and exclude Boost
    const positiveSelectors = [
      "button[aria-label='Like']",
      "button[aria-label*='Like']",
      "button[data-testid='like']",
      "button[data-testid='gamepad-like']",
      "button[data-testid='gamepad-like-button']",
      "button[title='Like']",
      "button[title*='Like']",
      ".gamepad__button--like"
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
      console.warn('XPath fallback failed', e);
    }

    return null;
  };

  getLikeInterval = () => {
    try {
      const stored = localStorage.getItem('TinderAutopilot/likeInterval');
      return stored ? parseInt(stored) * 1000 : 3000; // Convert to milliseconds
    } catch (e) {
      return 3000; // Default 3 seconds
    }
  };

  pressLike = async () => {
    // Check if we can swipe (has profile available)
    if (!this.canSwipe()) {
      return false;
    }

    // Check if profile should be skipped based on bio (opens modal, checks, closes)
    const shouldSkip = await this.profileAnalyzer.checkProfileWithModal();
    
    if (shouldSkip) {
      // Profile blocked - try multiple methods to dislike
      logger('🚫 Profile should be skipped, attempting to dislike...');
      
      // Method 1: Try clicking dislike button
      const dislikeButton = this.hasDislike();
      if (dislikeButton) {
        try {
          dislikeButton.click();
          logger('⏭️ ❌ Skipped profile using dislike button');
          return true;
        } catch (e) {
          logger(`⚠️ Error clicking dislike button: ${e.message}`);
        }
      }
      
      // Method 2: Try keyboard shortcut (ArrowLeft for dislike)
      logger('⌨️ Trying keyboard shortcut for dislike...');
      const currentProfileId = this.getCurrentProfileId();
      
      // Try pressing the ArrowLeft key
      this.pressKey('ArrowLeft', 37);
      
      // Wait for action to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if profile changed
      const newProfileId = this.getCurrentProfileId();
      if (currentProfileId !== newProfileId || !this.hasProfile()) {
        logger('⏭️ ❌ Skipped profile using keyboard shortcut');
        return true;
      }
      
      // Try alternative keyboard shortcuts
      logger('⌨️ Trying alternative keyboard shortcuts...');
      const shortcuts = [
        { key: 'a', keyCode: 65 },  // 'a' key sometimes used for pass
        { key: 'x', keyCode: 88 },  // 'x' key for reject
        { key: 'Escape', keyCode: 27 }  // Escape to close/skip
      ];
      
      for (const shortcut of shortcuts) {
        this.pressKey(shortcut.key, shortcut.keyCode);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const latestProfileId = this.getCurrentProfileId();
        if (currentProfileId !== latestProfileId || !this.hasProfile()) {
          logger(`⏭️ ❌ Skipped profile using '${shortcut.key}' key`);
          return true;
        }
      }
      
      // Method 3: Try clicking in the left area of the card (swipe left gesture)
      logger('👆 Trying to simulate left swipe...');
      try {
        const cardSelectors = [
          '.keen-slider__slide:not(.keen-slider__slide--clone)',
          '[data-testid="card-stack"] > div > div',
          '.Expand',
          '.StretchedBox'
        ];
        
        for (const selector of cardSelectors) {
          const card = document.querySelector(selector);
          if (card && card.offsetParent !== null) {
            const rect = card.getBoundingClientRect();
            const leftX = rect.left + 10;
            const centerY = rect.top + rect.height / 2;
            
            const clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: leftX,
              clientY: centerY
            });
            
            card.dispatchEvent(clickEvent);
            await new Promise(resolve => setTimeout(resolve, 300));
            
            if (!this.hasProfile()) {
              logger('⏭️ ❌ Skipped profile using left click simulation');
              return true;
            }
            break;
          }
        }
      } catch (e) {
        logger(`⚠️ Left swipe simulation failed: ${e.message}`);
      }
      
      // Last resort: Report that we couldn't dislike and return false to try again
      logger('❌ CRITICAL: Could not dislike profile! Manual intervention may be needed.');
      logger('🛑 Stopping autopilot to prevent unwanted likes...');
      this.isRunning = false; // Stop the autopilot
      return false;
    }

    // Profile passed all filters - try Super Like first (safely) then Like
    if (this.superLiker && this.superLiker.pressSuperLike && this.superLiker.pressSuperLike()) {
      return true;
    }

    // Profile passed all filters - click like button
    const likeButton = this.hasLike();
    if (likeButton) {
      likeButton.click();
      logger('✅ ❤️ Liked profile');
      
      // Update like counter
      const likeCountEl = document.getElementById('likeCount');
      if (likeCountEl) {
        likeCountEl.innerHTML = parseInt(likeCountEl.innerHTML, 10) + 1;
      }
      
      return true;
    } else {
      logger('⚠️ No like button found');
      return false;
    }
  };

  hasDislike = () => {
    logger('🔍 Searching for dislike button...');
    
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
            if (!ariaLabel.includes('like') && !title.includes('like') && !testId.includes('like') &&
                !ariaLabel.includes('super') && !title.includes('super') && !testId.includes('super') &&
                !ariaLabel.includes('boost') && !title.includes('boost') && !testId.includes('boost')) {
              logger(`✅ Found dislike button as first button in gamepad: ${selector}`);
              return firstButton;
            } else if (ariaLabel.includes('nope') || ariaLabel.includes('pass') || 
                       title.includes('nope') || title.includes('pass')) {
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
      const buttons = Array.from(document.querySelectorAll('button')).filter(btn => {
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
        
        if (!hasText || ariaLabel.includes('pass') || ariaLabel.includes('nope') || 
            ariaLabel.includes('dislike') || ariaLabel.includes('não') || ariaLabel.includes('nao') || !ariaLabel.includes('profile')) {
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
        if (content.includes('pass') || content.includes('nope') || content.includes('dislike') || content.includes('não') || content.includes('nao')) {
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
          document.getElementById('matchCount').innerHTML =
            parseInt(document.getElementById('matchCount').innerHTML, 10) + 1;
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

      const waitForMatchPage = setInterval(() => {
        if (this.interactions.isOnMatchesPage()) {
          clearInterval(waitForMatchPage);
          setTimeout(this.run, generateRandomNumber());
        }
      }, 250);
    }

    if (this.interactions.closeInstructions()) {
      setTimeout(this.run, generateRandomNumber());
      return;
    }

    if (this.interactions.closeModal()) {
      setTimeout(this.run, generateRandomNumber());
      return;
    }

    if (this.interactions.closeMatchFound()) {
      setTimeout(this.run, generateRandomNumber());
      return;
    }

    if (!this.canSwipe()) {
      logger('No profiles found. Waiting 4s');
      setTimeout(this.run, generateRandomNumber(3000, 4000));
      return;
    }

    // Keep Swiping
    if (this.matchFound()) {
      setTimeout(this.run, generateRandomNumber(500, 900));
      return;
    }

    // What we came here to do, swipe right!
    this.pressLike().then((success) => {
      if (success) {
        const interval = this.getLikeInterval();
        setTimeout(this.run, interval);
      } else {
        logger('No profiles found. Waiting 4s');
        setTimeout(this.run, generateRandomNumber(3000, 4000));
      }
    });
  };
}

export default Swiper;
