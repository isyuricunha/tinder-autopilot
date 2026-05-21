import { logger } from '../misc/helper';
import { getExtensionStorageValue } from '../misc/extension-storage';
import { getSetting } from '../misc/settings-store';
import { parseAiDecision } from '../misc/ai-response-parser';
import { formatProfileContextForPrompt } from '../misc/profile-context-extractor';
import {
  DEFAULT_AI_PROFILE_MODEL,
  DEFAULT_AI_PROFILE_REASONING_EFFORT,
  readAiProfileFilterSettings
} from '../misc/ai-profile-filter-settings';
import { getCheckboxValue } from '../views/toggle-control';

const AI_API_KEY_STORAGE_KEY = 'TinderAutopilot/aiApiKey';

/**
 * AIProfileFilter - LLM-powered profile filtering for Tinder Autopilot.
 * Supports any OpenAI-compatible API endpoint.
 */
class AIProfileFilter {
  constructor() {
    this.apiUrl = this.loadApiUrl();
    this.apiKey = this.loadApiKey();
    this.model = this.loadModel();
    this.filterRules = this.loadFilterRules();
    this.useVision = this.loadUseVision();
    this.reasoningEffort = this.loadReasoningEffort();
  }

  // ----------------------------------------------------------------
  // LocalStorage helpers
  // ----------------------------------------------------------------
  loadApiUrl() {
    return readAiProfileFilterSettings(getSetting).apiUrl;
  }

  loadApiKey() {
    return '';
  }

  loadModel() {
    return readAiProfileFilterSettings(getSetting).model || DEFAULT_AI_PROFILE_MODEL;
  }

  loadFilterRules() {
    const stored = getSetting('aiFilterRules');
    if (stored) return stored;
    // Default rules
    return 'Ignore profiles that are: trans, man, male, couples, onlyfans, or commercial.';
  }

  loadUseVision() {
    return readAiProfileFilterSettings(getSetting).useVision;
  }

  loadReasoningEffort() {
    return (
      readAiProfileFilterSettings(getSetting).reasoningEffort ||
      DEFAULT_AI_PROFILE_REASONING_EFFORT
    );
  }

  static isEnabled() {
    return getCheckboxValue('.tinderAutopilotAIProfileFilter');
  }

  // ----------------------------------------------------------------
  // Main analysis entry point
  // ----------------------------------------------------------------
  /**
   * Analyze a Tinder profile using an LLM.
   * @param {Object} params
   * @param {string} params.bio - The extracted bio text
   * @param {string|null} params.name - The profile name
   * @param {Object|null} params.profile - Structured profile details extracted from the DOM
   * @param {string|null} params.imageBase64 - Optional screenshot base64
   * @returns {Promise<{shouldSwipe: boolean, reason: string}>}
   */
  async analyze({ bio, name, profile, imageBase64 }) {
    this.apiKey = (await getExtensionStorageValue(AI_API_KEY_STORAGE_KEY)) || '';

    if (!this.apiUrl) {
      logger('⚠️ AI Filter URL not configured, skipping AI analysis');
      return { shouldSwipe: 'neutral', reason: 'AI not configured' };
    }

    try {
      const body = this.buildRequestBody(bio, imageBase64, name, profile);
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {})
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger(`⚠️ AI API error: ${response.status} ${errorText}`);
        return { shouldSwipe: 'neutral', reason: 'API error' };
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      logger(`⚠️ AI Filter failed: ${error.message}`);
      return { shouldSwipe: 'neutral', reason: `Error: ${error.message}` };
    }
  }

  // ----------------------------------------------------------------
  // Build OpenAI-compatible request body
  // ----------------------------------------------------------------
  buildRequestBody(bio, imageBase64, name, profile) {
    const systemMessage = this.buildSystemMessage();
    const config = this.getEffortConfig();

    const content = [];

    content.push({
      type: 'text',
      text: formatProfileContextForPrompt(profile, { bio, name })
    });

    // If vision is enabled and image is provided
    if (this.useVision && imageBase64) {
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`
        }
      });
    }

    const messages = [
      { role: 'system', content: systemMessage },
      {
        role: 'user',
        content: content
      }
    ];

    return {
      model: this.model,
      messages,
      response_format: { type: 'json_object' },
      max_tokens: config.maxTokens,
      temperature: config.temperature
    };
  }

  // ----------------------------------------------------------------
  // Reasoning effort configuration
  // ----------------------------------------------------------------
  getEffortConfig() {
    const configs = {
      low: { maxTokens: 128, temperature: 0.3 },
      medium: { maxTokens: 256, temperature: 0.2 },
      high: { maxTokens: 512, temperature: 0.1 }
    };
    return configs[this.reasoningEffort] || configs.medium;
  }

  buildSystemMessage() {
    const baseRules = this.filterRules;

    const effortPrompts = {
      low: `You are a fast Tinder profile filter. Decide quickly: swipe right (yes) or left (no).

USER RULES:
${baseRules}

RULES:
- If unclear, respond "yes".
- Be conservative: uncertain = yes.
- Respond ONLY in valid JSON.
- Keep "reason" very short (3-5 words max).`,

      medium: `You are a smart Tinder profile filter. Your job is to decide whether to swipe right (yes) or left (no) on a Tinder profile, based on the user's preference rules.

USER RULES:
${baseRules}

IMPORTANT:
- If it's not clear from the information, respond "yes" (better to like than to miss a potential match).
- Be conservative: if uncertain, swipe yes.
- Use every supplied profile field, not only the bio.
- Respond ONLY in valid JSON.
- The "reason" field is optional but helpful for logging.

RESPONSE FORMAT (valid JSON only):
{
  "shouldSwipe": "yes" | "no",
  "confidence": 1-10,
  "reason": "short explanation"
}`,

      high: `You are an expert Tinder profile analyst with deep understanding of dating profiles, red flags, and compatibility indicators. Perform a thorough analysis before deciding whether to swipe right (yes) or left (no).

USER RULES:
${baseRules}

ANALYSIS GUIDELINES:
- Examine the profile bio, age, gender, basics, lifestyle, interests, and looking-for fields carefully.
- Consider the name and any cultural context if relevant.
- Look for indicators of: authenticity, compatibility, lifestyle alignment, and potential dealbreakers.
- Evaluate if the profile seems genuine or potentially fake/commercial.
- Consider if there's enough information to make a confident decision.

DECISION RULES:
- If information is ambiguous or insufficient, default to "yes" (better to like than miss a potential match).
- Be conservative with rejections — only reject when there are clear red flags.
- When rejecting, provide a clear, specific reason.
- When accepting, briefly note what made it a good match.

RESPONSE FORMAT (valid JSON only):
{
  "shouldSwipe": "yes" | "no",
  "confidence": 1-10,
  "reason": "detailed explanation of your analysis and decision"
}`
    };

    return effortPrompts[this.reasoningEffort] || effortPrompts.medium;
  }

  // ----------------------------------------------------------------
  // Parse LLM response to structured decision
  // ----------------------------------------------------------------
  parseResponse(data) {
    const result = parseAiDecision(data);
    logger(`🤖 AI says: ${result.shouldSwipe ? 'Swipe YES' : 'Swipe NO'} - ${result.reason}`);
    return result;
  }

  // ----------------------------------------------------------------
  // Screenshot capture helper
  // ----------------------------------------------------------------
  async captureScreenshot() {
    return new Promise((resolve) => {
      try {
        // Attempt to find the profile card/modal container
        const selectors = [
          '[data-testid="card-stack"]',
          '.recsCardboard__card',
          '.keen-slider__slide:not(.keen-slider__slide--clone)',
          '.gamepad-card',
          '.Expand.enterAnimationContainer > div'
        ];

        let target = null;
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el && el.offsetParent !== null && el.offsetWidth > 100 && el.offsetHeight > 100) {
            target = el;
            break;
          }
        }

        if (!target) {
          resolve(null);
          return;
        }

        logger('⚠️ Vision capture unavailable in Chrome content scripts; using text-only AI');
        resolve(null);
      } catch (e) {
        logger(`⚠️ Screenshot capture failed: ${e.message}`);
        resolve(null);
      }
    });
  }
}

export default AIProfileFilter;
