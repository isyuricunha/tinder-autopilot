import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import { sendMessageToMatch, getMessagesForMatch, getMatches } from '../misc/api';
import { randomDelay, logger } from '../misc/helper';
import { readAutoMessageSettings } from '../misc/auto-message-settings';
import { getAutoMessageSafetyStopReason } from '../misc/auto-message-safety';
import { getJsonSetting, getSetting, setJsonSetting } from '../misc/settings-store';
import { getCheckboxValue, setToggleState as setToggleControlState } from '../views/toggle-control';
import { normalizeMessageForComparison, hasMessageBeenSent } from '../misc/message-normalizer';
import {
  AUTO_MESSAGE_DAILY_STATE_KEY,
  clearMessengerMatchQueue,
  createMessengerSessionState,
  getAutoMessageDailySentCount,
  getLocalDateKey,
  incrementAutoMessageDailySentCount,
  normalizeAutoMessageDailyState,
  normalizeMessengerMatchQueue
} from './messenger-state';

class Messenger {
  selector = '.tinderAutopilotMessage';

  newSelector = '.tinderAutopilotMessageNewOnly';

  nextPageToken;

  isRunningMessage;

  allMatches = [];

  checkedMessage = 0;

  sentMessages = 0;

  loopMatches = async () => {
    const response = await getMatches(getCheckboxValue(this.newSelector), this.nextPageToken);
    this.nextPageToken = get(response, 'data.next_page_token');
    this.allMatches = normalizeMessengerMatchQueue(this.allMatches);
    this.allMatches.push.apply(this.allMatches, get(response, 'data.matches', []));
  };

  loadDailyState = () => {
    try {
      return normalizeAutoMessageDailyState(getJsonSetting(AUTO_MESSAGE_DAILY_STATE_KEY, {}));
    } catch {
      return normalizeAutoMessageDailyState();
    }
  };

  saveDailyState = (state) => {
    setJsonSetting(AUTO_MESSAGE_DAILY_STATE_KEY, normalizeAutoMessageDailyState(state));
  };

  start = () => {
    const state = createMessengerSessionState();

    this.allMatches = state.allMatches;
    this.checkedMessage = state.checkedMessage;
    this.sentMessages = 0;
    this.isRunningMessage = state.isRunningMessage;
    this.nextPageToken = state.nextPageToken;

    logger('Starting messages');

    this.runMessage().catch((error) => {
      const safetyStopReason = getAutoMessageSafetyStopReason(error);
      if (safetyStopReason) {
        logger(
          ` Auto Message stopped: ${safetyStopReason}. Resolve Tinder manually before restarting.`
        );
      } else {
        logger(` Error running messenger: ${error.message}`);
      }
      this.stop();
    });
  };

  stop = () => {
    logger('Messaging stopped ⛔️');
    this.isRunningMessage = false;
    setToggleControlState(this.selector, false);
  };

  waitWhileRunning = async (delayMs) => {
    const endTime = Date.now() + Math.max(0, delayMs);
    while (this.isRunningMessage && Date.now() < endTime) {
      const nextDelay = Math.min(1000, endTime - Date.now());
      await new Promise((resolve) => setTimeout(resolve, nextDelay));
    }
  };

  waitAfterSentMessage = async (settings) => {
    const delayMs = Math.max(0, Number(settings.sendDelaySeconds || 0)) * 1000;
    if (!delayMs || !this.isRunningMessage) return;
    logger(`Waiting ${settings.sendDelaySeconds}s before the next Auto Message send...`);
    await this.waitWhileRunning(delayMs);
  };

  runMessage = async () => {
    const settings = readAutoMessageSettings(getSetting);
    logger(
      `Auto Message limits: ${settings.maxSendsPerRun}/run, ${settings.maxSendsPerDay}/day, ${settings.maxChecksPerRun} checks/run, ${settings.sendDelaySeconds}s send delay`
    );

    await this.loopMatches();
    while (this.nextPageToken && this.allMatches.length < settings.maxChecksPerRun) {
      const matches = normalizeMessengerMatchQueue(this.allMatches);
      logger(`Currently have ${matches.length} matches`);
      await this.loopMatches();
    }

    const matches = normalizeMessengerMatchQueue(this.allMatches);
    logger(`Retrieved match history: ${matches.length}`);

    // To start with old matches we can reverse the array
    // this.allMatches = this.allMatches.reverse();

    logger(`Looking for matches we have not sent yet to`);
    await this.sendMessagesTo(matches.slice().reverse(), settings);
  };

  normalizeMessageForComparison = normalizeMessageForComparison;

  hasMessageBeenSent = hasMessageBeenSent;

  sendMessagesTo = async (r = [], settings = readAutoMessageSettings(getSetting)) => {
    const matchList = keyBy(
      normalizeMessengerMatchQueue(r).slice(0, settings.maxChecksPerRun),
      'id'
    );

    // Release the reversed allMatches array after creating the lookup to free memory
    this.allMatches = clearMessengerMatchQueue();

    const matchIds = Object.keys(matchList);
    const dateKey = getLocalDateKey();
    let dailyState = this.loadDailyState();
    let dailySentCount = getAutoMessageDailySentCount(dailyState, dateKey);

    if (dailySentCount >= settings.maxSendsPerDay) {
      logger(`Auto Message daily limit reached (${dailySentCount}/${settings.maxSendsPerDay})`);
      this.stop();
      return;
    }

    logger(`Processing up to ${matchIds.length} matches one by one`);

    for (const matchID of matchIds) {
      if (!this.isRunningMessage) break;
      if (this.checkedMessage >= settings.maxChecksPerRun) {
        logger(`Auto Message check limit reached (${settings.maxChecksPerRun})`);
        break;
      }
      if (this.sentMessages >= settings.maxSendsPerRun) {
        logger(`Auto Message run limit reached (${settings.maxSendsPerRun})`);
        break;
      }
      if (dailySentCount >= settings.maxSendsPerDay) {
        logger(`Auto Message daily limit reached (${dailySentCount}/${settings.maxSendsPerDay})`);
        break;
      }

      await randomDelay();
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

      try {
        const messageList = await getMessagesForMatch(tinderMatchID);
        this.checkedMessage += 1;
        logger(
          `Checked ${this.checkedMessage}/${Math.min(matchIds.length, settings.maxChecksPerRun)}`
        );

        if (!this.hasMessageBeenSent(messageList, messageTemplate, matchName)) {
          const sendResponse = await sendMessageToMatch(tinderMatchID, { message: messageToSend });
          if (get(sendResponse, 'sent_date')) {
            this.sentMessages += 1;
            dailyState = incrementAutoMessageDailySentCount(dailyState, { dateKey });
            this.saveDailyState(dailyState);
            dailySentCount = getAutoMessageDailySentCount(dailyState, dateKey);
            logger(
              ` Message sent to ${matchName} (${this.sentMessages}/${settings.maxSendsPerRun} run, ${dailySentCount}/${settings.maxSendsPerDay} day)`
            );
            if (
              this.isRunningMessage &&
              this.sentMessages < settings.maxSendsPerRun &&
              dailySentCount < settings.maxSendsPerDay
            ) {
              await this.waitAfterSentMessage(settings);
            }
          } else {
            logger(` Failed to send message to ${matchName}`);
          }
        } else {
          logger(` Skipped ${matchName} - message already sent`);
        }
      } catch (error) {
        const safetyStopReason = getAutoMessageSafetyStopReason(error);
        if (safetyStopReason) {
          logger(
            ` Auto Message stopped: ${safetyStopReason}. Resolve Tinder manually before restarting.`
          );
          this.stop();
          return;
        }
        logger(` Error processing ${matchName}: ${error.message}`);
      }
    }

    logger(` Auto Message processed. Checked ${this.checkedMessage}, sent ${this.sentMessages}`);
    this.stop();
  };
}

export default Messenger;
