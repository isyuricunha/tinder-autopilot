import { logger } from '../misc/helper';
import {
  applyUnansweredMessagesFilter,
  clearUnansweredMessagesFilter,
  findMessageScrollContainer,
  findMessagesTab,
  getScrollMetrics,
  getMessageListItems,
  scrollMessageListToEnd,
  scrollMessageListToTop
} from '../misc/message-list-filter';

const MAX_SCROLL_STEPS = 240;
const SCROLL_DELAY_MS = 150;
const STABLE_END_CHECKS = 4;

class HideUnanswered {
  selector = '.tinderAutopilotHideMine';

  totalMessages = 0;

  counter = 0;

  stableEndChecks = 0;

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
    const { isAtBottom } = getScrollMetrics(scrollContainer);
    const newTotal = getMessageListItems(document).length;
    const hasNewMessages = newTotal > this.totalMessages;

    if (hasNewMessages) {
      this.counter = 0;
      this.stableEndChecks = 0;
    } else if (isAtBottom) {
      this.stableEndChecks += 1;
    } else {
      this.stableEndChecks = 0;
    }

    const shouldKeepScrolling =
      this.counter < MAX_SCROLL_STEPS &&
      (!isAtBottom || this.stableEndChecks < STABLE_END_CHECKS || hasNewMessages);

    if (shouldKeepScrolling) {
      this.counter += 1;
      scrollMessageListToEnd(document);
      if (scrollContainer.scrollTop === currentScrollTop && !isAtBottom) {
        scrollContainer.scrollTop = currentScrollTop + (scrollContainer.clientHeight || 600);
      }
      setTimeout(() => this.scrollMatchesToEnd(cb), SCROLL_DELAY_MS);
    } else {
      logger(`Finished scrolling, total matches found: ${newTotal}`);
      cb();
    }

    this.totalMessages = newTotal;
  };

  start = () => {
    const runFilter = () => {
      this.totalMessages = getMessageListItems(document).length;
      this.counter = 0;
      this.stableEndChecks = 0;

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
