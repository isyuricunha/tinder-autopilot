import { logger } from './helper';

class Interactions {
  isOnMatchesPage = () => {
    return (
      window.location.toString().indexOf('app/recs') !== -1 ||
      window.location.toString().indexOf('app/matches') !== -1
    );
  };

  goToMainPage = () => {
    // Try multiple selectors for navigation
    const selectors = [
      "a[href='/app/recs']",
      "a[href='/app/matches']", 
      "[data-testid='recs-tab']",
      "[data-testid='matches-tab']",
      "nav button[aria-label*='Discover']",
      "nav div:nth-child(1) > span",
      ".navTab:first-child button"
    ];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        const element = elements[0];
        if (element && element.offsetParent !== null) {
          element.click();
          return true;
        }
      }
    }
    
    return false;
  };

  closeInstructions = () => {
    // Homescreen modal blocks us
    try {
      if (document.querySelector('[data-testid="addToHomeScreen"]')) {
        document
          .querySelector('[data-testid="addToHomeScreen"]')
          .parentElement.querySelector('button:nth-of-type(2)')
          .click();
        logger('Closing add to homescreen modal');
        return true;
      }
    } catch (e) {
      return false;
    }
  };

  closeMatchFound = () => {
    try {
      const selectors = [
        '[title="Back to Tinder"]',
        'button[aria-label="Close"]',
        '[data-testid="matchModalCloseButton"]',
        '.modal button:first-child',
        'button[title*="Close"]'
      ];
      
      for (const selector of selectors) {
        const modal = document.querySelector(selector);
        if (modal && modal.offsetParent !== null) {
          modal.click();
          logger('Closing match found');
          return true;
        }
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  closeModal = () => {
    try {
      const modal = document.querySelector('[role="dialog"]').parentElement.parentElement;
      if (modal) {
        document.querySelector('[role="dialog"]').parentElement.click();
        logger('Closing modal');
        return true;
      }
    } catch (e) {
      return false;
    }
  };
}

export default Interactions;
