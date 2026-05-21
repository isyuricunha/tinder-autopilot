import { logger } from '../misc/helper';
import {
  applyUnansweredMessagesFilter,
  clearUnansweredMessagesFilter,
  findMessageScrollContainer,
  findMessagesTab,
  getNextScrollEndState,
  getScrollMetrics,
  getMessageListItems,
  scrollMessageListToEnd,
  scrollMessageListToTop
} from '../misc/message-list-filter';

const MAX_SCROLL_STEPS = 360;
const SCROLL_DELAY_MS = 1200;
const STABLE_END_CHECKS = 4;

class HideUnanswered {
  selector = '.tinderAutopilotHideMine';

  totalMessages = 0;

  lastScrollHeight = 0;

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
    const metrics = getScrollMetrics(scrollContainer);
    const newTotal = getMessageListItems(document).length;
    const nextScrollState = getNextScrollEndState({
      metrics,
      previousState: {
        scrollHeight: this.lastScrollHeight,
        stableEndChecks: this.stableEndChecks,
        totalMessages: this.totalMessages
      },
      stableEndChecksRequired: STABLE_END_CHECKS,
      totalMessages: newTotal
    });

    if (nextScrollState.hasListChanged) {
      this.counter = 0;
    }

    const shouldKeepScrolling =
      this.counter < MAX_SCROLL_STEPS &&
      (!nextScrollState.hasStableEnd || nextScrollState.hasListChanged);

    if (shouldKeepScrolling) {
      this.counter += 1;
      scrollMessageListToEnd(document);
      if (scrollContainer.scrollTop === currentScrollTop && !metrics.isAtBottom) {
        scrollContainer.scrollTop = currentScrollTop + (scrollContainer.clientHeight || 600);
      }
      setTimeout(() => this.scrollMatchesToEnd(cb), SCROLL_DELAY_MS);
    } else {
      logger(`Finished scrolling, total matches found: ${newTotal}`);
      cb();
    }

    this.totalMessages = nextScrollState.totalMessages;
    this.lastScrollHeight = nextScrollState.scrollHeight;
    this.stableEndChecks = nextScrollState.stableEndChecks;
  };

  start = () => {
    const runFilter = () => {
      this.totalMessages = getMessageListItems(document).length;
      this.lastScrollHeight = getScrollMetrics(findMessageScrollContainer(document)).scrollHeight;
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
