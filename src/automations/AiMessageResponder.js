import get from 'lodash/get';
import { getMatches, getRawMessagesForMatch, sendMessageToMatch } from '../misc/api';
import { getExtensionStorageValue } from '../misc/extension-storage';
import { logger, randomDelay } from '../misc/helper';
import { generateAiMessageReply } from '../misc/ai-message-reply';
import { processAiReplyMatch } from '../misc/ai-message-reply-flow';
import { readAiReplySettings } from '../misc/ai-message-reply-settings';
import { getJsonSetting, getSetting } from '../misc/settings-store';
import { setToggleState as setToggleControlState } from '../views/toggle-control';

const AI_API_KEY_STORAGE_KEY = 'TinderAutopilot/aiApiKey';

class AiMessageResponder {
  selector = '.tinderAutopilotAIMessageReply';

  isRunning = false;

  checkedMessages = 0;

  sentMessages = 0;

  start = () => {
    if (this.isRunning) return;

    this.isRunning = true;
    this.checkedMessages = 0;
    this.sentMessages = 0;

    logger('Starting AI message replies');

    this.run().catch((error) => {
      logger(` Error running AI message replies: ${error.message}`);
      this.stop();
    });
  };

  stop = () => {
    logger('AI message replies stopped ⛔️');
    this.isRunning = false;
    setToggleControlState(this.selector, false);
  };

  getProfileData = () => {
    try {
      return getJsonSetting('ProfileData');
    } catch {
      return null;
    }
  };

  processMatch = async ({ apiKey, match, profileData, settings }) => {
    const matchName = get(match, 'person.name', 'match');
    const matchId = get(match, 'id', '');

    if (!matchId) {
      logger(' AI reply skipped match - missing id');
      return;
    }

    const rawMessages = await getRawMessagesForMatch(matchId);
    this.checkedMessages += 1;
    logger(`AI checked ${this.checkedMessages}`);

    const result = await processAiReplyMatch({
      apiKey,
      generateReply: generateAiMessageReply,
      match,
      profileData,
      rawMessages,
      sendMessage: sendMessageToMatch,
      settings
    });

    if (result.status === 'sent') {
      this.sentMessages += 1;
      logger(` AI reply sent to ${result.matchName || matchName}`);
      return;
    }

    if (result.status === 'failed') {
      logger(` AI reply failed for ${result.matchName || matchName}: ${result.reason}`);
      return;
    }

    logger(` AI reply skipped ${result.matchName || matchName}: ${result.reason}`);
  };

  run = async () => {
    const settings = readAiReplySettings(getSetting);
    if (!settings.apiUrl) {
      logger('⚠️ AI Reply URL not configured');
      this.stop();
      return;
    }

    const apiKey = (await getExtensionStorageValue(AI_API_KEY_STORAGE_KEY)) || '';
    const profileData = this.getProfileData();
    let nextPageToken = true;

    while (nextPageToken && this.isRunning) {
      const response = await getMatches(false, nextPageToken);
      nextPageToken = get(response, 'data.next_page_token');
      const matches = get(response, 'data.matches', []) || [];

      logger(`AI reply loaded ${matches.length} matches`);

      for (const match of matches) {
        if (!this.isRunning) break;

        try {
          await randomDelay();
          await this.processMatch({ apiKey, match, profileData, settings });
        } catch (error) {
          const matchName = get(match, 'person.name', 'match');
          logger(` Error processing AI reply for ${matchName}: ${error.message}`);
        }
      }

      matches.length = 0;
      if (nextPageToken && this.isRunning) {
        logger('AI reply page completed. Waiting before next page...');
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    logger(` AI message replies processed. Sent ${this.sentMessages}`);
    this.stop();
  };
}

export default AiMessageResponder;
