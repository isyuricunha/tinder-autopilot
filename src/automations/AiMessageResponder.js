import get from 'lodash/get';
import { getMatches, getRawMessagesForMatch, sendMessageToMatch } from '../misc/api';
import { logger, randomDelay } from '../misc/helper';
import { generateAiMessageReply } from '../misc/ai-message-reply';
import {
  buildPendingAiReplyContext,
  processAiReplyMatch
} from '../misc/ai-message-reply-flow';
import { readAiReplySettings } from '../misc/ai-message-reply-settings';
import { getJsonSetting, getSetting, setJsonSetting } from '../misc/settings-store';
import { detectAiReplyManualTakeover } from '../misc/ai-reply-manual-takeover';
import {
  getContinuousThrottlePauseMs,
  shouldPauseContinuousScan
} from '../misc/ai-reply-continuous-cycle';
import {
  AI_REPLY_CONTINUOUS_STATE_KEY,
  getAiReplyDailyMatchCount,
  incrementAiReplyDailyMatchCount,
  markAiReplyContinuousProcessed,
  normalizeAiReplyContinuousState,
  shouldSkipAiReplyContinuousSignature
} from '../misc/ai-reply-continuous-state';
import {
  markSelectedAiApiKeyResult,
  selectAiApiKeyForRequest
} from '../misc/ai-key-pool-storage';
import { setToggleState as setToggleControlState } from '../views/toggle-control';

const TRANSIENT_AI_REPLY_FAILURE_REASONS = [
  'AI API error',
  'AI reply failed',
  'Fetch unavailable',
  'Invalid JSON response',
  'AI response stopped by token limit'
];

class AiMessageResponder {
  selector = '.tinderAutopilotAIMessageReply';

  continuousSelector = '.tinderAutopilotAIMessageReplyContinuous';

  isRunning = false;

  isContinuousMode = false;

  activeSelector = this.selector;

  onModeChange = null;

  checkedMessages = 0;

  sentMessages = 0;

  cycleSentMessages = 0;

  cycleSentSincePause = 0;

  continuousState = normalizeAiReplyContinuousState();

  start = () => {
    this.startMode({ continuous: false });
  };

  startContinuous = () => {
    this.startMode({ continuous: true });
  };

  startMode = ({ continuous }) => {
    const selector = continuous ? this.continuousSelector : this.selector;
    if (this.isRunning) {
      logger('AI message replies already running');
      setToggleControlState(selector, false);
      return;
    }

    this.isRunning = true;
    this.isContinuousMode = Boolean(continuous);
    this.activeSelector = selector;
    this.checkedMessages = 0;
    this.sentMessages = 0;
    this.cycleSentMessages = 0;
    this.cycleSentSincePause = 0;

    setToggleControlState(continuous ? this.selector : this.continuousSelector, false);
    this.emitModeChange(continuous ? 'continuous' : 'once');

    logger(continuous ? 'Starting continuous AI message replies' : 'Starting AI message replies');

    this.run().catch((error) => {
      logger(` Error running AI message replies: ${error.message}`);
      this.stop();
    });
  };

  stop = () => {
    logger(
      this.isContinuousMode
        ? 'Continuous AI message replies stopped ⛔️'
        : 'AI message replies stopped ⛔️'
    );
    this.isRunning = false;
    setToggleControlState(this.selector, false);
    setToggleControlState(this.continuousSelector, false);
    this.emitModeChange('off');
  };

  emitModeChange = (mode) => {
    if (typeof this.onModeChange !== 'function') return;
    this.onModeChange(mode);
  };

  getProfileData = () => {
    try {
      return getJsonSetting('ProfileData');
    } catch {
      return null;
    }
  };

  getContinuousState = () => {
    try {
      return normalizeAiReplyContinuousState(getJsonSetting(AI_REPLY_CONTINUOUS_STATE_KEY, {}));
    } catch {
      return normalizeAiReplyContinuousState();
    }
  };

  saveContinuousState = () => {
    setJsonSetting(
      AI_REPLY_CONTINUOUS_STATE_KEY,
      normalizeAiReplyContinuousState(this.continuousState)
    );
  };

  shouldRecordContinuousResult = (result) => {
    if (!result) return false;
    if (result.status === 'sent') return true;
    const reason = String(result.reason || '');
    return !TRANSIENT_AI_REPLY_FAILURE_REASONS.some((failureReason) =>
      reason.includes(failureReason)
    );
  };

  buildContinuousSkipResult = (context, reason) => ({
    didSend: false,
    matchId: context.matchId,
    matchName: context.matchName,
    reason,
    status: 'skipped'
  });

  guardContinuousContext = (context, settings) => {
    const manualTakeoverReason = detectAiReplyManualTakeover(context.conversationTurns);
    if (manualTakeoverReason) {
      this.continuousState = markAiReplyContinuousProcessed(this.continuousState, {
        matchId: context.matchId,
        reason: manualTakeoverReason,
        signature: context.latestMessageSignature,
        status: 'manual'
      });
      this.saveContinuousState();
      return this.buildContinuousSkipResult(context, manualTakeoverReason);
    }

    if (
      shouldSkipAiReplyContinuousSignature(
        this.continuousState,
        context.matchId,
        context.latestMessageSignature
      )
    ) {
      return this.buildContinuousSkipResult(
        context,
        'Continuous AI reply already processed this latest message'
      );
    }

    const dailyCount = getAiReplyDailyMatchCount(this.continuousState, context.matchId);
    if (dailyCount >= settings.continuousMaxPerMatchPerDay) {
      const reason = 'Continuous AI reply daily match limit reached';
      this.continuousState = markAiReplyContinuousProcessed(this.continuousState, {
        matchId: context.matchId,
        reason,
        signature: context.latestMessageSignature,
        status: 'limited'
      });
      this.saveContinuousState();
      return this.buildContinuousSkipResult(context, reason);
    }

    return null;
  };

  rememberContinuousResult = (context, result) => {
    if (!this.shouldRecordContinuousResult(result)) return;

    if (result.status === 'sent') {
      this.continuousState = incrementAiReplyDailyMatchCount(
        this.continuousState,
        context.matchId
      );
    }

    this.continuousState = markAiReplyContinuousProcessed(this.continuousState, {
      matchId: context.matchId,
      reason: result.reason,
      signature: context.latestMessageSignature,
      status: result.status
    });
    this.saveContinuousState();
  };

  recordAiKeyResult = async ({ result, selectedKey }) => {
    if (!selectedKey) return;
    await markSelectedAiApiKeyResult({
      selectedKey,
      status: result?.statusCode || 200
    });
  };

  processMatch = async ({ match, profileData, settings }) => {
    const matchName = get(match, 'person.name', 'match');
    const matchId = get(match, 'id', '');

    if (!matchId) {
      logger(' AI reply skipped match - missing id');
      return;
    }

    const rawMessages = await getRawMessagesForMatch(matchId);
    this.checkedMessages += 1;
    logger(`AI checked ${this.checkedMessages}`);

    const pendingContext = buildPendingAiReplyContext({
      contextWindow: settings.contextWindow,
      match,
      profileData,
      rawMessages
    });

    if (this.isContinuousMode && pendingContext.status === 'pending') {
      const guardResult = this.guardContinuousContext(pendingContext, settings);
      if (guardResult) return guardResult;
    }

    if (pendingContext.status !== 'pending') {
      logger(` AI reply skipped ${pendingContext.matchName || matchName}: ${pendingContext.reason}`);
      return pendingContext;
    }

    const keySelection = await selectAiApiKeyForRequest({
      providerType: settings.providerType
    });

    const result = await processAiReplyMatch({
      apiKey: keySelection.apiKey,
      generateReply: generateAiMessageReply,
      loadRawMessages: getRawMessagesForMatch,
      match,
      profileData,
      rawMessages,
      sendMessage: sendMessageToMatch,
      settings
    });
    await this.recordAiKeyResult({
      result,
      selectedKey: keySelection.selectedKey
    });

    if (this.isContinuousMode && pendingContext.status === 'pending') {
      this.rememberContinuousResult(pendingContext, result);
    }

    if (result.status === 'sent') {
      this.sentMessages += 1;
      this.cycleSentMessages += 1;
      this.cycleSentSincePause += 1;
      logger(` AI reply sent to ${result.matchName || matchName}`);
      return result;
    }

    if (result.status === 'failed') {
      logger(` AI reply failed for ${result.matchName || matchName}: ${result.reason}`);
      return result;
    }

    logger(` AI reply skipped ${result.matchName || matchName}: ${result.reason}`);
    return result;
  };

  waitWhileRunning = async (delayMs) => {
    const endTime = Date.now() + Math.max(0, delayMs);
    while (this.isRunning && Date.now() < endTime) {
      const nextDelay = Math.min(1000, endTime - Date.now());
      await new Promise((resolve) => setTimeout(resolve, nextDelay));
    }
  };

  waitAfterSentReply = async (settings) => {
    const delayMs = Math.max(0, Number(settings.replyDelaySeconds || 0)) * 1000;
    if (!delayMs || !this.isRunning) return;
    await this.waitWhileRunning(delayMs);
  };

  shouldPauseContinuousScan = (settings) =>
    shouldPauseContinuousScan({
      isContinuousMode: this.isContinuousMode,
      maxSentBeforePause: settings.continuousMaxSentPerCycle,
      sentSincePause: this.cycleSentSincePause
    });

  waitAfterContinuousThrottle = async (settings) => {
    if (!this.shouldPauseContinuousScan(settings)) return;

    const pauseMs = getContinuousThrottlePauseMs({
      replyDelaySeconds: settings.replyDelaySeconds
    });
    logger(
      `Continuous AI reply throttle reached (${this.cycleSentSincePause}). Waiting ${Math.round(
        pauseMs / 1000
      )}s before continuing this scan...`
    );
    this.cycleSentSincePause = 0;
    await this.waitWhileRunning(pauseMs);
  };

  runCycle = async ({ profileData, settings }) => {
    this.cycleSentMessages = 0;
    this.cycleSentSincePause = 0;
    if (!settings.apiUrl) {
      logger('⚠️ AI Reply URL not configured');
      this.stop();
      return { sent: 0 };
    }

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
          const result = await this.processMatch({ match, profileData, settings });
          if (result?.status === 'sent') {
            await this.waitAfterSentReply(settings);
            await this.waitAfterContinuousThrottle(settings);
          }
        } catch (error) {
          const matchName = get(match, 'person.name', 'match');
          logger(` Error processing AI reply for ${matchName}: ${error.message}`);
        }
      }

      matches.length = 0;
      if (nextPageToken && this.isRunning) {
        logger('AI reply page completed. Waiting before next page...');
        await this.waitWhileRunning(1500);
      }
    }

    return { sent: this.cycleSentMessages };
  };

  run = async () => {
    this.continuousState = this.getContinuousState();

    while (this.isRunning) {
      const settings = readAiReplySettings(getSetting);
      const profileData = this.getProfileData();
      const cycleResult = await this.runCycle({ profileData, settings });

      if (!this.isContinuousMode || !this.isRunning) break;

      logger(
        `Continuous AI reply cycle finished. Sent ${cycleResult.sent}. Waiting ${settings.continuousIntervalMinutes} min...`
      );
      await this.waitWhileRunning(settings.continuousIntervalMinutes * 60 * 1000);
    }

    if (this.isRunning) {
      logger(` AI message replies processed. Sent ${this.sentMessages}`);
      this.stop();
    }
  };
}

export default AiMessageResponder;
