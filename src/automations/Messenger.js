import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import { sendMessageToMatch, getMessagesForMatch, getMatches } from '../misc/api';
import { randomDelay, logger } from '../misc/helper';
import { getCheckboxValue, setToggleState as setToggleControlState } from '../views/toggle-control';
import { normalizeMessageForComparison, hasMessageBeenSent } from '../misc/message-normalizer';
import {
  clearMessengerMatchQueue,
  createMessengerSessionState,
  normalizeMessengerMatchQueue
} from './messenger-state';

class Messenger {
  selector = '.tinderAutopilotMessage';

  newSelector = '.tinderAutopilotMessageNewOnly';

  nextPageToken;

  isRunningMessage;

  allMatches = [];

  checkedMessage = 0;

  loopMatches = async () => {
    const response = await getMatches(getCheckboxValue(this.newSelector), this.nextPageToken);
    this.nextPageToken = get(response, 'data.next_page_token');
    this.allMatches = normalizeMessengerMatchQueue(this.allMatches);
    this.allMatches.push.apply(this.allMatches, get(response, 'data.matches', []));
  };

  start = () => {
    const state = createMessengerSessionState();

    this.allMatches = state.allMatches;
    this.checkedMessage = state.checkedMessage;
    this.isRunningMessage = state.isRunningMessage;
    this.nextPageToken = state.nextPageToken;

    logger('Starting messages');

    this.runMessage().catch((error) => {
      logger(` Error running messenger: ${error.message}`);
      this.stop();
    });
  };

  stop = () => {
    logger('Messaging stopped ⛔️');
    this.isRunningMessage = false;
    setToggleControlState(this.selector, false);
  };

  runMessage = async () => {
    await this.loopMatches();
    while (this.nextPageToken) {
      const matches = normalizeMessengerMatchQueue(this.allMatches);
      logger(`Currently have ${matches.length} matches`);
      await this.loopMatches();
    }

    const matches = normalizeMessengerMatchQueue(this.allMatches);
    logger(`Retrieved all match history: ${matches.length}`);

    // To start with old matches we can reverse the array
    // this.allMatches = this.allMatches.reverse();

    logger(`Looking for matches we have not sent yet to`);
    await this.sendMessagesTo(matches.slice().reverse());
  };

  normalizeMessageForComparison = normalizeMessageForComparison;

  hasMessageBeenSent = hasMessageBeenSent;

  sendMessagesTo = async (r = []) => {
    const matchList = keyBy(normalizeMessengerMatchQueue(r), 'id');

    // Release the reversed allMatches array after creating the lookup to free memory
    this.allMatches = clearMessengerMatchQueue();

    const batchSize = 10; // Process in smaller batches to prevent memory issues
    const matchIds = Object.keys(matchList);

    logger(`Processing ${matchIds.length} matches in batches of ${batchSize}`);

    for (let i = 0; i < matchIds.length; i += batchSize) {
      if (!this.isRunningMessage) break;

      const batch = matchIds.slice(i, i + batchSize);
      const batchPromises = [];

      for (const matchID of batch) {
        await randomDelay(100, 300); // Shorter delay between requests
        if (!this.isRunningMessage) break;

        const match = matchList[matchID];
        const tinderMatchID = get(match, 'id', '');
        const messageTemplate = get(document.getElementById('messageToSend'), 'value', '');
        const matchName = get(match, 'person.name', '');

        if (!tinderMatchID) {
          logger(` Skipping match - missing id`);
          continue;
        }

        if (!messageTemplate.trim() || !matchName) {
          logger(` Skipping match - missing template or name`);
          continue;
        }

        const messageToSend = messageTemplate.replace('{name}', matchName.toLowerCase());

        batchPromises.push(
          getMessagesForMatch(tinderMatchID)
            .then((messageList) => {
              this.checkedMessage += 1;
              logger(`Checked ${this.checkedMessage}/${matchIds.length}`);

              const alreadySent = this.hasMessageBeenSent(messageList, messageTemplate, matchName);
              return !alreadySent;
            })
            .then((shouldSend) => {
              if (shouldSend) {
                return sendMessageToMatch(tinderMatchID, { message: messageToSend }).then((b) => {
                  if (get(b, 'sent_date')) {
                    logger(` Message sent to ${matchName}`);
                  } else {
                    logger(` Failed to send message to ${matchName}`);
                  }
                  return b;
                });
              } else {
                logger(` Skipped ${matchName} - message already sent`);
                return null;
              }
            })
            .catch((error) => {
              logger(` Error processing ${matchName}: ${error.message}`);
              return null;
            })
        );
      }

      // Wait for current batch to complete before processing next
      if (batchPromises.length > 0) {
        await Promise.allSettled(batchPromises);

        // Memory cleanup between batches - clear references to allow GC
        batchPromises.length = 0;

        // Memory cleanup between batches
        if (i + batchSize < matchIds.length) {
          logger(`Batch ${Math.floor(i / batchSize) + 1} completed. Waiting before next batch...`);
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second pause between batches
        }
      }
    }

    logger(' All matches processed');
    this.stop();
  };
}

export default Messenger;
