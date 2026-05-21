import { logger } from '../misc/helper';
import {
  applyUnansweredMessagesFilter,
  clearUnansweredMessagesFilter,
  findMessageScrollContainer,
  findMessagesTab,
  getMessageListItems,
  scrollMessageListToTop
} from '../misc/message-list-filter';

const MAX_SCROLL_STEPS = 120;
const SCROLL_DELAY_MS = 100;

class HideUnanswered {
  selector = '.tinderAutopilotHideMine';

  totalMessages = 0;

  counter = 0;

  finishHiding = () => {
    const result = applyUnansweredMessagesFilter(document);
    scrollMessageListToTop(document);

    logger(`Total matches that need a response: ${result.visible}`);
  };

  scrollMatchesToEnd = (cb) => {
    const scrollContainer = findMessageScrollContainer(document);

    if (!scrollContainer) {
      logger('Could not find scroll container');
      cb();
      return;
    }

    const currentScrollTop = scrollContainer.scrollTop || 0;
    const viewportHeight = scrollContainer.clientHeight || window.outerHeight || 0;
    const totalHeight = scrollContainer.scrollHeight || 0;
    const newTotal = getMessageListItems(document).length;
    const hasMoreScroll = currentScrollTop + viewportHeight < totalHeight - 4;

    if (this.counter < MAX_SCROLL_STEPS && hasMoreScroll) {
      this.counter += 1;
      scrollContainer.scrollTop = currentScrollTop + viewportHeight;
      setTimeout(() => this.scrollMatchesToEnd(cb), SCROLL_DELAY_MS);
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
    const runFilter = () => {
      this.totalMessages = getMessageListItems(document).length;
      this.counter = 0;

      this.scrollMatchesToEnd(this.finishHiding);
    };

    const messagesTab = findMessagesTab(document);
    if (messagesTab && messagesTab.getAttribute?.('aria-selected') !== 'true') {
      messagesTab.click();
      setTimeout(runFilter, 300);
      return;
    }

    runFilter();
  };

  stop = () => {
    clearUnansweredMessagesFilter(document);
  };
}

export default HideUnanswered;
