import { logger } from '../misc/helper';

class HideUnanswered {
  selector = '.tinderAutopilotHideMine';

  totalMessages = 0;

  counter = 0;

  finishHiding = () => {
    // Try multiple selectors for message items
    const messageSelectors = [
      '.messageListItem__message svg',
      '[data-testid="message-item"] svg',
      '.message-item svg',
      '.chat-message svg'
    ];
    
    let messageItems = [];
    for (const selector of messageSelectors) {
      messageItems = document.querySelectorAll(selector);
      if (messageItems.length > 0) break;
    }
    
    messageItems.forEach((t) => {
      const messageItem = t.closest('.messageListItem') || 
                         t.closest('[data-testid="message-item"]') ||
                         t.closest('.message-item') ||
                         t.closest('.chat-message');
      
      if (!messageItem) return;
      
      const checkmarkSelectors = [
        'svg[aria-label="Message Sent"]',
        'svg[data-testid="message-sent"]',
        '.message-sent-icon',
        'svg[title*="Sent"]'
      ];
      
      let checkmarkIcon = null;
      for (const selector of checkmarkSelectors) {
        checkmarkIcon = messageItem.querySelector(selector);
        if (checkmarkIcon) break;
      }
      
      const replySelectors = [
        '.messageListItem__message:last-child',
        '[data-testid="last-message"]',
        '.message-item:last-child',
        '.chat-message:last-child'
      ];
      
      let replyMessage = null;
      for (const selector of replySelectors) {
        replyMessage = messageItem.querySelector(selector);
        if (replyMessage) break;
      }

      if (!checkmarkIcon && !replyMessage) {
        messageItem.style.display = 'none';
      }
    });

    const listSelectors = ['.messageListItem', '[data-testid="message-item"]', '.message-item'];
    let allItems = [];
    for (const selector of listSelectors) {
      allItems = document.querySelectorAll(selector);
      if (allItems.length > 0) break;
    }
    
    const unansweredCount = Array.prototype.slice
      .call(allItems)
      .filter((item) => item.style.display !== 'none').length;

    // Scroll back to top of messages
    const scrollContainerSelectors = [
      '.matchListTitle',
      '[data-testid="match-list"]',
      '.match-list',
      '.messages-container'
    ];
    
    for (const selector of scrollContainerSelectors) {
      const container = document.querySelector(selector);
      if (container && container.parentElement) {
        container.parentElement.scrollTop = 0;
        break;
      }
    }

    logger(`Total matches that need a response: ${unansweredCount}`);
  };



  scrollMatchesToEnd = (cb) => {
    // Try multiple selectors for scroll container
    const scrollSelectors = ['.matchListTitle', '[data-testid="match-list"]', '.match-list'];
    let scrollContainer = null;
    
    for (const selector of scrollSelectors) {
      const element = document.querySelector(selector);
      if (element && element.parentElement) {
        scrollContainer = element.parentElement;
        break;
      }
    }
    
    if (!scrollContainer) {
      logger('Could not find scroll container');
      cb();
      return;
    }
    
    const currHeight = scrollContainer.scrollTop;
    const totalHeight = scrollContainer.scrollHeight;
    
    // Try multiple selectors for message list
    const listSelectors = ['div.messageList', '[data-testid="message-list"]', '.message-list'];
    let messageList = null;
    
    for (const selector of listSelectors) {
      messageList = document.querySelector(selector);
      if (messageList) break;
    }
    
    const newTotal = messageList ? messageList.children.length : 0;

    if (this.counter < 30 && currHeight < totalHeight) {
      this.counter += 1;
      scrollContainer.scrollTop += window.outerHeight;
      setTimeout(() => this.scrollMatchesToEnd(cb), 100);
    } else {
      logger(`Finished scrolling, total matches found: ${newTotal}`);
      cb();
    }

    if (newTotal > this.totalMessages) {
      this.counter = 0;
    }

    this.totalMessages = newTotal;
  };

  start = () => {
    // Try multiple selectors for messages tab
    const tabSelectors = [
      '#messages-tab',
      '[data-testid="messages-tab"]',
      'a[href="/app/messages"]',
      '.messages-tab'
    ];
    
    let tabClicked = false;
    for (const selector of tabSelectors) {
      const tab = document.querySelector(selector);
      if (tab) {
        tab.click();
        tabClicked = true;
        break;
      }
    }
    
    if (!tabClicked) {
      const fallbackSelectors = ['a[href="/app/recs"]', '[data-testid="recs-tab"]'];
      for (const selector of fallbackSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          element.click();
          break;
        }
      }
    }

    // Get initial message count
    const listSelectors = ['div.messageList', '[data-testid="message-list"]', '.message-list'];
    let messageList = null;
    
    for (const selector of listSelectors) {
      messageList = document.querySelector(selector);
      if (messageList) break;
    }
    
    this.totalMessages = messageList ? messageList.children.length : 0;
    this.counter = 0;

    this.scrollMatchesToEnd(this.finishHiding);
  };

  stop = () => {
    document.querySelectorAll('.messageListItem__message svg').forEach((t) => {
      t.closest('.messageListItem').style.display = 'flex';
    });
  };
}

export default HideUnanswered;
