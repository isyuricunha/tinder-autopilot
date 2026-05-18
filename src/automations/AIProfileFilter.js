import { logger } from '../misc/helper';

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
    return localStorage.getItem('TinderAutopilot/aiApiUrl') || '';
  }

  loadApiKey() {
    return localStorage.getItem('TinderAutopilot/aiApiKey') || '';
  }

  loadModel() {
    return localStorage.getItem('TinderAutopilot/aiModel') || 'gpt-4o-mini';
  }

  loadFilterRules() {
    const stored = localStorage.getItem('TinderAutopilot/aiFilterRules');
    if (stored) return stored;
    // Default rules
    return 'Ignore profiles that are: trans, man, male, couples, onlyfans, or commercial.';
  }

  loadUseVision() {
    const stored = localStorage.getItem('TinderAutopilot/aiUseVision');
    return stored === 'true';
  }

  loadReasoningEffort() {
    const stored = localStorage.getItem('TinderAutopilot/aiReasoningEffort');
    if (stored && ['low', 'medium', 'high'].includes(stored)) {
      return stored;
    }
    return 'medium'; // default
  }

  static isEnabled() {
    try {
      const checkbox = document.querySelector('.tinderAutopilotAIProfileFilter .toggleSwitch > div');
      if (!checkbox) return false;
      const style = checkbox.style.cssText;
      return (
        style.includes('linear-gradient(135deg, #ff6b35, #ff8c42)') ||
        style.includes('linear-gradient(135deg, rgb(255, 107, 53), rgb(255, 140, 66))')
      );
    } catch (e) {
      return false;
    }
  }

  // ----------------------------------------------------------------
  // Main analysis entry point
  // ----------------------------------------------------------------
  /**
   * Analyze a Tinder profile using an LLM.
   * @param {Object} params
   * @param {string} params.bio - The extracted bio text
   * @param {string|null} params.name - The profile name
   * @param {string|null} params.imageBase64 - Optional screenshot base64
   * @returns {Promise<{shouldSwipe: boolean, reason: string}>}
   */
  async analyze({ bio, name, imageBase64 }) {
    if (!this.apiUrl) {
      logger('⚠️ AI Filter URL not configured, skipping AI analysis');
      return { shouldSwipe: 'neutral', reason: 'AI not configured' };
    }

    try {
      const body = this.buildRequestBody(bio, imageBase64, name);
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
  buildRequestBody(bio, imageBase64, name) {
    const systemMessage = this.buildSystemMessage();
    const config = this.getEffortConfig();

    const content = [];

    // Always include text prompt
    const nameSection = name ? `NAME: ${name}\n` : '';
    content.push({
      type: 'text',
      text: `${nameSection}BIO: ${bio || '(no bio)'}`
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
- Examine the profile bio carefully for explicit and implicit red flags.
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
    try {
      const choice = data.choices?.[0]?.message?.content;
      if (!choice) {
        logger('⚠️ AI response missing content');
        return { shouldSwipe: true, reason: 'Empty response' };
      }

      const parsed = JSON.parse(choice);
      const shouldSwipe = parsed.shouldSwipe === 'yes';
      const reason = parsed.reason || `confidence: ${parsed.confidence || '?'}`;

      logger(`🤖 AI says: ${shouldSwipe ? 'Swipe YES' : 'Swipe NO'} - ${reason}`);
      return { shouldSwipe, reason };
    } catch (error) {
      logger(`⚠️ Failed to parse AI response: ${error.message}`);
      return { shouldSwipe: true, reason: 'Parse error' };
    }
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

        // Use html2canvas or similar approach if available?
        // For now we rely on having a Vision-capable model that can be given a URL,
        // but since we can't easily capture screenshot in content script without external lib,
        // we return null and fallback to text-only mode.
        // Alternatively, we could try to use HTML canvas to capture the element.

        // Attempt canvas capture for the element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const rect = target.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Draw the element to canvas
        ctx.drawWindow(window, rect.left + window.scrollX, rect.top + window.scrollY, rect.width, rect.height, 'rgb(255,255,255)');
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      } catch (e) {
        logger(`⚠️ Screenshot capture failed: ${e.message}`);
        resolve(null);
      }
    });
  }
}

export default AIProfileFilter;
