import { logger } from '../misc/helper';
import {
  applyUnansweredMessagesFilter,
  clearUnansweredMessagesFilter,
  findMessageScrollContainer,
  findMessagesTab,
  getMessageListItems,
  scrollMessageListToTop
} from '../misc/message-list-filter';

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

    const currHeight = scrollContainer.scrollTop;
    const totalHeight = scrollContainer.scrollHeight;
    const newTotal = getMessageListItems(document).length;

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
