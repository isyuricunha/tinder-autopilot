import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import { sendMessageToMatch, getMessagesForMatch, getMatches } from '../misc/api';
import { randomDelay, logger } from '../misc/helper';
import { getCheckboxValue, toggleCheckbox } from '../views/Sidebar';

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
    this.allMatches.push.apply(this.allMatches, get(response, 'data.matches', []));
  };

  start = () => {
    this.checkedMessage = 0;
    logger('Starting messages');
    this.isRunningMessage = true;
    this.nextPageToken = true;
    this.runMessage();
  };

  stop = () => {
    setTimeout(() => {
      logger('Messaging stopped ⛔️');
      this.isRunningMessage = false;
      toggleCheckbox(this.selector);
    }, 500);
  };

  runMessage = async () => {
    await this.loopMatches();
    while (this.nextPageToken) {
      logger(`Currently have ${this.allMatches.length} matches`);
      await this.loopMatches();
    }

    logger(`Retrieved all match history: ${this.allMatches.length}`);

    // To start with old matches we can reverse the array
    // this.allMatches = this.allMatches.reverse();

    logger(`Looking for matches we have not sent yet to`);
    this.sendMessagesTo(this.allMatches.reverse());
  };

  // Normalize message for duplicate detection (handles {name} variable)
  normalizeMessageForComparison = (messageTemplate, actualName) => {
    const messageWithName = messageTemplate.replace('{name}', actualName.toLowerCase());
    return messageWithName
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace('thanks', 'thank');
  };

  // Check if message was already sent by comparing normalized versions
  hasMessageBeenSent = (messageList, messageTemplate, matchName) => {
    if (!messageList || messageList.length === 0) return false;
    
    const normalizedTemplate = this.normalizeMessageForComparison(messageTemplate, matchName);
    
    // Also check variations without name replacement
    const templateWithoutName = messageTemplate.replace('{name}', '').trim().toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');
    
    return messageList.some(sentMsg => 
      sentMsg.includes(normalizedTemplate) || 
      (templateWithoutName && sentMsg.includes(templateWithoutName))
    );
  };

  sendMessagesTo = async (r) => {
    const matchList = keyBy(r, 'id');
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
        const messageTemplate = get(document.getElementById('messageToSend'), 'value', '');
        const matchName = get(match, 'person.name', '');
        
        if (!messageTemplate.trim() || !matchName) {
          logger(` Skipping match - missing template or name`);
          continue;
        }

        const messageToSend = messageTemplate.replace('{name}', matchName.toLowerCase());

        batchPromises.push(
          getMessagesForMatch(match.id)
            .then((messageList) => {
              this.checkedMessage += 1;
              logger(`Checked ${this.checkedMessage}/${this.allMatches.length}`);
              
              const alreadySent = this.hasMessageBeenSent(messageList, messageTemplate, matchName);
              return !alreadySent;
            })
            .then((shouldSend) => {
              if (shouldSend) {
                return sendMessageToMatch(match.id, { message: messageToSend }).then((b) => {
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
        
        // Memory cleanup between batches
        if (i + batchSize < matchIds.length) {
          logger(`Batch ${Math.floor(i/batchSize) + 1} completed. Waiting before next batch...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second pause between batches
        }
      }
    }

    logger(' All matches processed');
    this.stop();
  };
}

export default Messenger;