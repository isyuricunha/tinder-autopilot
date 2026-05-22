import Messenger from '../automations/Messenger';
import AiMessageResponder from '../automations/AiMessageResponder';
import Swiper from '../automations/Swiper';
import HideUnanswered from '../automations/HideUnanswered';
import Anonymous from '../automations/Anonymous';
import {
  AI_REPLY_SETTING_KEYS,
  DEFAULT_AI_REPLY_ADDRESS_INFO,
  DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
  DEFAULT_AI_REPLY_CONTACT_INFO,
  DEFAULT_AI_REPLY_CONTEXT_WINDOW,
  DEFAULT_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES,
  DEFAULT_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY,
  DEFAULT_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE,
  DEFAULT_AI_REPLY_DELAY_SECONDS,
  DEFAULT_AI_REPLY_HARD_RULES,
  DEFAULT_AI_REPLY_MAX_TOKENS,
  DEFAULT_AI_REPLY_MODEL,
  DEFAULT_AI_REPLY_REASONING_EFFORT,
  DEFAULT_AI_REPLY_STYLE_EXAMPLES,
  DEFAULT_AI_REPLY_TONE,
  DEFAULT_AI_REPLY_USER_CONTEXT,
  normalizeAiReplyCompatibilityMode,
  normalizeAiReplyContinuousIntervalMinutes,
  normalizeAiReplyContinuousMaxPerMatchPerDay,
  normalizeAiReplyContinuousMaxSentPerCycle,
  normalizeAiReplyDelaySeconds,
  normalizeAiReplyMaxTokens,
  normalizeAiReplyReasoningEffort,
  normalizeAiReplyContextWindow,
  readAiReplySettings
} from '../misc/ai-message-reply-settings';
import {
  AI_PROFILE_SETTING_KEYS,
  DEFAULT_AI_PROFILE_MODEL,
  DEFAULT_AI_PROFILE_REASONING_EFFORT,
  normalizeAiReasoningEffort
} from '../misc/ai-profile-filter-settings';
import {
  AI_PROVIDER_SETTING_KEY,
  DEFAULT_AI_PROVIDER_TYPE,
  getAiProviderLabel,
  getAiProviderDefaultApiUrl,
  isKnownAiProviderDefaultApiUrl,
  normalizeAiProviderType,
  readAiProviderSettings
} from '../misc/ai-provider-settings';
import { waitUntilElementExists, logger, debugLog, warnLog } from '../misc/helper';
import { normalizeAiApiKeyInput, shouldSaveAiApiKeyInput } from '../misc/ai-api-key-utils';
import { fetchAiModelList } from '../misc/ai-model-list';
import {
  buildAiReplyRequestBody,
  generateAiMessageReply
} from '../misc/ai-message-reply';
import { parseAiReplyTestConversation } from '../misc/ai-reply-test-input';
import { insertCss } from '../misc/insert-css';
import {
  getExtensionStorageValue,
  setExtensionStorageValue,
  removeExtensionStorageValue
} from '../misc/extension-storage';
import {
  getRawStorageValue,
  getSetting,
  getToggleState,
  removeSetting,
  removeRawStorageValue,
  setJsonSetting,
  setSetting
} from '../misc/settings-store';
import { resetCounters, renderCounters } from '../misc/counter-store';
import { createSidebarElement, renderSidebarContent } from './sidebar-renderer';
import {
  EPHEMERAL_TOGGLE_SELECTORS,
  shouldPersistToggleState,
  shouldRestoreToggleState
} from './sidebar-toggle-state';
import {
  AI_REPLY_MODES,
  canStartAiReplyMode,
  getAiReplyModeFromResponderState,
  isAiReplyContinuousMode,
  normalizeAiReplyMode
} from './ai-reply-mode-state';
import {
  getCheckboxValue,
  toggleCheckbox,
  setToggleState as setToggleControlState
} from './toggle-control';
import { SIDEBAR_THEME } from './sidebar-theme';

const AI_API_KEY_STORAGE_KEY = 'TinderAutopilot/aiApiKey';
const AI_MODEL_DATALIST_ID = 'aiModelOptions';

class Sidebar {
  eventListeners = [];

  eventsBound = false;

  isMounted = false;

  cancelMountWait = null;

  constructor() {
    this.injectModernStyles();

    this.anonymous = new Anonymous();
    this.hideUnanswered = new HideUnanswered();
    this.swiper = new Swiper();
    this.messenger = new Messenger();
    this.aiMessageResponder = new AiMessageResponder();
    this.aiMessageResponder.onModeChange = this.updateAiReplyModeSelector;

    this.mountWhenReady();
  }

  addTrackedListener = (element, event, handler) => {
    if (element) {
      element.addEventListener(event, handler);
      this.eventListeners.push({ element, event, handler });
    }
  };

  removeAllListeners = () => {
    if (this.cancelMountWait) {
      this.cancelMountWait();
      this.cancelMountWait = null;
    }

    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  };

  injectModernStyles() {
    insertCss(
      `
      /* Custom Scrollbar */
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: ${SIDEBAR_THEME.surfaceMuted};
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: ${SIDEBAR_THEME.accentGradient};
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${SIDEBAR_THEME.accentHover};
      }
      
      /* Hover effects */
      .autopilot-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px ${SIDEBAR_THEME.shadow} !important;
        border-color: ${SIDEBAR_THEME.accentBorder} !important;
      }
      
      /* Activity log styling */
      .txt p {
        margin: 4px 0 !important;
        padding: 8px 12px !important;
        border-radius: 8px !important;
        background: ${SIDEBAR_THEME.accentSofter} !important;
        border-left: 3px solid ${SIDEBAR_THEME.accent} !important;
      }
      .txt span {
        color: ${SIDEBAR_THEME.accentHover} !important;
        font-weight: 600 !important;
      }
      
      /* Textarea focus effects */
      textarea:focus,
      input:focus,
      select:focus {
        outline: none !important;
        box-shadow: 0 0 0 2px ${SIDEBAR_THEME.focusShadow} !important;
        border-color: ${SIDEBAR_THEME.accent} !important;
      }
      
      /* Selection colors */
      ::selection {
        background: ${SIDEBAR_THEME.focusShadow};
        color: ${SIDEBAR_THEME.text};
      }
      ::-moz-selection {
        background: ${SIDEBAR_THEME.focusShadow};
        color: ${SIDEBAR_THEME.text};
      }
    `,
      { id: 'sidebar' }
    );
  }

  insertBefore = (el, referenceNode) => {
    if (referenceNode && referenceNode.parentNode) {
      referenceNode.parentNode.insertBefore(el, referenceNode);
      return true;
    }

    return false;
  };

  mountWhenReady = () => {
    if (this.mountSidebar()) return;

    this.cancelMountWait = waitUntilElementExists('aside:first-of-type', () => {
      this.mountSidebar();
    });
  };

  mountSidebar = () => {
    if (this.isMounted) return true;
    if (!this.sidebar()) return false;

    this.isMounted = true;

    if (!this.eventsBound) {
      this.events();
      this.eventsBound = true;
    }

    return true;
  };

  sidebar = () => {
    const existingInfoBanner = document.querySelector('#infoBanner');
    if (existingInfoBanner) {
      this.infoBanner = existingInfoBanner;
      return renderSidebarContent(this.infoBanner);
    }

    const referenceNode = document.querySelector('aside:first-of-type');
    if (!referenceNode) return false;

    const el = createSidebarElement();
    const isMounted = this.insertBefore(el, referenceNode);

    if (!isMounted) {
      warnLog('Could not mount Autopilot sidebar: Tinder sidebar target is not ready');
      return false;
    }

    this.infoBanner = el.querySelector('#infoBanner');
    return renderSidebarContent(this.infoBanner);
  };

  events = () => {
    // Initialize counter values from localStorage
    this.initializeCounters();

    // Reset counters button
    const resetButton = document.getElementById('resetCounters');
    if (resetButton) {
      this.addTrackedListener(resetButton, 'click', () => {
        resetCounters();
        this.initializeCounters();
        logger('🔄 Counters reset');
      });
    }

    // Auto unmatch
    waitUntilElementExists('img[alt="No Reason"]', () => {
      document.querySelector('ul li:last-of-type button').click();
      document.querySelector('.modal-slide-up div button[type="button"]').click();
    });

    this.bindCheckbox(this.anonymous.selector, this.anonymous.start, this.anonymous.stop);

    this.bindCheckbox(this.messenger.newSelector);

    this.bindCheckbox(this.swiper.selector, this.swiper.start, this.swiper.stop);

    this.bindCheckbox(this.messenger.selector, this.messenger.start, this.messenger.stop);

    this.bindAiReplyModeSelector();

    this.bindCheckbox(
      this.hideUnanswered.selector,
      this.hideUnanswered.start,
      this.hideUnanswered.stop
    );

    // Bind additional checkboxes for new features
    this.bindCheckbox('.tinderAutopilotBioFilter');
    this.bindCheckbox('.tinderAutopilotGenderFilter');
    this.bindCheckbox('.tinderAutopilotAdvancedFilter');
    this.bindCheckbox('.tinderAutopilotSuperLike');

    // Initialize saved toggle states from localStorage
    this.initializeToggles();
    this.updateAiReplyModeSelector(AI_REPLY_MODES.off);

    // Initialize slider values from localStorage
    this.initializeSliders();
    this.updateAiConnectionStatus({
      message: `API type: ${getAiProviderLabel(
        getSetting(AI_PROVIDER_SETTING_KEY, DEFAULT_AI_PROVIDER_TYPE)
      )}. Refresh models to load suggestions.`,
      status: 'idle'
    });

    // Set initial slider states based on toggle positions
    setTimeout(() => {
      this.updateSliderStates();
    }, 1000);

    // Also add a manual trigger for testing
    window.updateSliderStates = () => this.updateSliderStates();

    const messageField = document.getElementById('messageToSend');
    if (messageField) {
      this.addTrackedListener(messageField, 'blur', (e) => {
        setJsonSetting('MessengerDefault', e.target.value);
      });
    }

    const aiReplyToneField = document.getElementById('aiReplyTone');
    if (aiReplyToneField) {
      this.addTrackedListener(aiReplyToneField, 'blur', (e) => {
        const value = e.target.value.trim();
        setSetting('aiReplyTone', value);
        logger('💾 Saved AI Reply Style');
      });
    }

    const aiReplyUserContextField = document.getElementById('aiReplyUserContext');
    if (aiReplyUserContextField) {
      this.addTrackedListener(aiReplyUserContextField, 'blur', (e) => {
        const value = e.target.value.trim();
        setSetting('aiReplyUserContext', value);
        logger('💾 Saved AI Reply Owner Profile');
      });
    }

    const aiReplyStyleExamplesField = document.getElementById(
      AI_REPLY_SETTING_KEYS.styleExamples
    );
    if (aiReplyStyleExamplesField) {
      this.addTrackedListener(aiReplyStyleExamplesField, 'blur', (e) => {
        const value = e.target.value.trim();
        setSetting(AI_REPLY_SETTING_KEYS.styleExamples, value);
        logger('💾 Saved AI Reply Style Examples');
      });
    }

    const aiReplyContactInfoField = document.getElementById('aiReplyContactInfo');
    if (aiReplyContactInfoField) {
      this.addTrackedListener(aiReplyContactInfoField, 'blur', (e) => {
        const value = e.target.value.trim();
        setSetting('aiReplyContactInfo', value);
        logger('💾 Saved AI Reply Contact Info');
      });
    }

    const aiReplyAddressInfoField = document.getElementById('aiReplyAddressInfo');
    if (aiReplyAddressInfoField) {
      this.addTrackedListener(aiReplyAddressInfoField, 'blur', (e) => {
        const value = e.target.value.trim();
        setSetting('aiReplyAddressInfo', value);
        logger('💾 Saved AI Reply Location Info');
      });
    }

    const aiReplyHardRulesField = document.getElementById(AI_REPLY_SETTING_KEYS.hardRules);
    if (aiReplyHardRulesField) {
      this.addTrackedListener(aiReplyHardRulesField, 'blur', (e) => {
        const value = e.target.value.trim();
        setSetting(AI_REPLY_SETTING_KEYS.hardRules, value);
        logger('💾 Saved AI Reply Hard Rules');
      });
    }

    const previewAiReplyPromptButton = document.getElementById('previewAiReplyPrompt');
    if (previewAiReplyPromptButton) {
      this.addTrackedListener(previewAiReplyPromptButton, 'click', () => {
        this.previewAiReplyPrompt();
      });
    }

    const testAiReplyButton = document.getElementById('testAiReply');
    if (testAiReplyButton) {
      this.addTrackedListener(testAiReplyButton, 'click', () => {
        this.testAiReply(testAiReplyButton);
      });
    }

    // Save bio blacklist when user updates it
    const bioBlacklistField = document.getElementById('bioBlacklist');
    if (bioBlacklistField) {
      this.addTrackedListener(bioBlacklistField, 'blur', (e) => {
        const value = e.target.value.trim();
        setSetting('bioBlacklist', value);
        logger(`💾 Saved banned words: ${value}`);
      });
    }

    // Save gender filter when user updates it
    const genderFilterField = document.getElementById('genderFilter');
    if (genderFilterField) {
      this.addTrackedListener(genderFilterField, 'blur', (e) => {
        const value = e.target.value.trim();
        setSetting('genderFilter', value);
        logger(`💾 Saved gender filter: ${value}`);
      });
    }

    // Save AI filter settings when user updates them
    const aiApiUrlField = document.getElementById('aiApiUrl');
    if (aiApiUrlField) {
      this.addTrackedListener(aiApiUrlField, 'blur', (e) => {
        const value = e.target.value.trim();
        setSetting('aiApiUrl', value);
        logger(`💾 Saved AI API URL`);
      });
    }

    const aiProviderTypeField = document.getElementById(AI_PROVIDER_SETTING_KEY);
    if (aiProviderTypeField) {
      this.addTrackedListener(aiProviderTypeField, 'change', (e) => {
        const providerType = normalizeAiProviderType(e.target.value);
        setSetting(AI_PROVIDER_SETTING_KEY, providerType);

        const currentUrl = String(aiApiUrlField?.value || '').trim();
        if (aiApiUrlField && (!currentUrl || isKnownAiProviderDefaultApiUrl(currentUrl))) {
          const defaultUrl = getAiProviderDefaultApiUrl(providerType);
          aiApiUrlField.value = defaultUrl;
          setSetting('aiApiUrl', defaultUrl);
        }

        this.updateAiConnectionStatus({
          message: `API type: ${getAiProviderLabel(providerType)}. Refresh models to update suggestions.`,
          status: 'idle'
        });
        logger(`💾 Saved AI API Type`);
      });
    }

    const aiApiKeyField = document.getElementById('aiApiKey');
    if (aiApiKeyField) {
      this.addTrackedListener(aiApiKeyField, 'blur', (e) => {
        const value = normalizeAiApiKeyInput(e.target.value);
        if (!shouldSaveAiApiKeyInput(value)) return;

        setExtensionStorageValue(AI_API_KEY_STORAGE_KEY, value)
          .then((didSave) => {
            if (didSave) removeRawStorageValue(AI_API_KEY_STORAGE_KEY);
            logger(`💾 Saved AI API Key`);
          })
          .catch((error) => {
            logger(`⚠️ Failed to save AI API Key: ${error.message}`);
          });
      });
    }

    const clearAiApiKeyButton = document.getElementById('clearAiApiKey');
    if (clearAiApiKeyButton) {
      this.addTrackedListener(clearAiApiKeyButton, 'click', () => {
        removeExtensionStorageValue(AI_API_KEY_STORAGE_KEY)
          .then(() => {
            removeRawStorageValue(AI_API_KEY_STORAGE_KEY);
            if (aiApiKeyField) aiApiKeyField.value = '';
            logger('🧹 Cleared AI API Key');
          })
          .catch((error) => {
            logger(`⚠️ Failed to clear AI API Key: ${error.message}`);
          });
      });
    }

    const refreshAiModelsButton = document.getElementById('refreshAiModels');
    if (refreshAiModelsButton) {
      this.addTrackedListener(refreshAiModelsButton, 'click', () => {
        this.refreshAiModelOptions(refreshAiModelsButton);
      });
    }

    const aiProfileModelField = document.getElementById(AI_PROFILE_SETTING_KEYS.model);
    if (aiProfileModelField) {
      this.addTrackedListener(aiProfileModelField, 'blur', (e) => {
        const value = e.target.value.trim();
        setSetting(AI_PROFILE_SETTING_KEYS.model, value);
        logger(`💾 Saved AI Profile Model: ${value}`);
      });
    }

    const aiReplyModelField = document.getElementById(AI_REPLY_SETTING_KEYS.model);
    if (aiReplyModelField) {
      this.addTrackedListener(aiReplyModelField, 'blur', (e) => {
        const value = e.target.value.trim();
        setSetting(AI_REPLY_SETTING_KEYS.model, value);
        logger(`💾 Saved AI Reply Model: ${value}`);
      });
    }

    const aiProfileReasoningEffortField = document.getElementById(
      AI_PROFILE_SETTING_KEYS.reasoningEffort
    );
    if (aiProfileReasoningEffortField) {
      this.addTrackedListener(aiProfileReasoningEffortField, 'change', (e) => {
        const value = normalizeAiReasoningEffort(e.target.value);
        setSetting(AI_PROFILE_SETTING_KEYS.reasoningEffort, value);
        logger(`💾 Saved AI Profile Reasoning Effort: ${value}`);
      });
    }

    const aiReplyReasoningEffortField = document.getElementById(
      AI_REPLY_SETTING_KEYS.reasoningEffort
    );
    if (aiReplyReasoningEffortField) {
      this.addTrackedListener(aiReplyReasoningEffortField, 'change', (e) => {
        const value = normalizeAiReplyReasoningEffort(e.target.value);
        setSetting(AI_REPLY_SETTING_KEYS.reasoningEffort, value);
        logger(`💾 Saved AI Reply Reasoning Effort: ${value}`);
      });
    }

    const aiFilterRulesField = document.getElementById('aiFilterRules');
    if (aiFilterRulesField) {
      this.addTrackedListener(aiFilterRulesField, 'blur', (e) => {
        const value = e.target.value.trim();
        setSetting('aiFilterRules', value);
        logger(`💾 Saved AI Filter Rules`);
      });
    }

    // Bind AI filter checkbox
    this.bindCheckbox('.tinderAutopilotAIProfileFilter');
  };

  initializeToggles = () => {
    EPHEMERAL_TOGGLE_SELECTORS.forEach((selector) => {
      removeSetting(`toggleState/${selector}`);
      setToggleControlState(selector, false);
    });

    const toggleMappings = [
      { selector: '.tinderAutopilotAnonymous', start: this.anonymous?.start, stop: this.anonymous?.stop },
      { selector: '.tinderAutopilotHideMine', start: this.hideUnanswered?.start, stop: this.hideUnanswered?.stop },
      { selector: '.tinderAutopilotBioFilter' },
      { selector: '.tinderAutopilotGenderFilter' },
      { selector: '.tinderAutopilotAdvancedFilter' },
      { selector: '.tinderAutopilotSuperLike' },
      { selector: '.tinderAutopilotAIProfileFilter' }
    ];

    toggleMappings.forEach(({ selector, start, stop }) => {
      if (shouldRestoreToggleState(selector) && getToggleState(selector)) {
        setToggleControlState(selector, true);
        this.runAutomationCallback(start, 'start', selector);
      }
    });
  };

  initializeSliders = () => {
    const sliders = [
      { id: 'minAge', defaultValue: 18, unit: ' years' },
      { id: 'maxAge', defaultValue: 35, unit: ' years' },
      { id: 'maxDistance', defaultValue: 50, unit: ' km' },
      { id: 'minPhotoCount', defaultValue: 3, unit: ' photos' },
      {
        id: 'aiReplyContextWindow',
        defaultValue: DEFAULT_AI_REPLY_CONTEXT_WINDOW,
        unit: ' messages',
        normalize: normalizeAiReplyContextWindow
      },
      {
        id: 'aiReplyMaxTokens',
        defaultValue: DEFAULT_AI_REPLY_MAX_TOKENS,
        unit: ' tokens',
        normalize: normalizeAiReplyMaxTokens
      },
      {
        id: 'aiReplyDelaySeconds',
        defaultValue: DEFAULT_AI_REPLY_DELAY_SECONDS,
        unit: ' sec',
        normalize: normalizeAiReplyDelaySeconds
      },
      {
        id: AI_REPLY_SETTING_KEYS.continuousIntervalMinutes,
        defaultValue: DEFAULT_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES,
        unit: ' min',
        normalize: normalizeAiReplyContinuousIntervalMinutes
      },
      {
        id: AI_REPLY_SETTING_KEYS.continuousMaxSentPerCycle,
        defaultValue: DEFAULT_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE,
        unit: ' replies',
        normalize: normalizeAiReplyContinuousMaxSentPerCycle
      },
      {
        id: AI_REPLY_SETTING_KEYS.continuousMaxPerMatchPerDay,
        defaultValue: DEFAULT_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY,
        unit: ' replies',
        normalize: normalizeAiReplyContinuousMaxPerMatchPerDay
      }
    ];

    sliders.forEach(({ id, defaultValue, unit, normalize }) => {
      const slider = document.getElementById(id);
      const valueDisplay = document.getElementById(`${id}Value`);
      const manualInput = document.getElementById(`${id}Input`);

      if (slider && valueDisplay) {
        const rawStoredValue = getSetting(id, defaultValue);
        const storedValue = normalize ? normalize(rawStoredValue) : rawStoredValue;
        slider.value = storedValue;
        valueDisplay.textContent = storedValue + unit;
        if (manualInput) manualInput.value = storedValue;
      }
    });

    // Initialize Super Like strategy dropdown
    const strategySelect = document.getElementById('superLikeStrategy');
    if (strategySelect) {
      const storedStrategy = getSetting('superLikeStrategy', 'random');
      strategySelect.value = storedStrategy;
    }

    // Initialize bio blacklist textarea
    const bioBlacklistField = document.getElementById('bioBlacklist');
    if (bioBlacklistField) {
      const storedBlacklist = getSetting('bioBlacklist');
      if (storedBlacklist) {
        bioBlacklistField.value = storedBlacklist;
      }
    }

    // Initialize gender filter textarea
    const genderFilterField = document.getElementById('genderFilter');
    if (genderFilterField) {
      const storedGenderFilter = getSetting('genderFilter');
      if (storedGenderFilter) {
        genderFilterField.value = storedGenderFilter;
      }
    }

    // Initialize AI filter settings
    const aiProviderTypeField = document.getElementById(AI_PROVIDER_SETTING_KEY);
    if (aiProviderTypeField) {
      aiProviderTypeField.value = normalizeAiProviderType(
        getSetting(AI_PROVIDER_SETTING_KEY, DEFAULT_AI_PROVIDER_TYPE)
      );
    }

    const aiApiUrlField = document.getElementById('aiApiUrl');
    if (aiApiUrlField) {
      const storedUrl = getSetting('aiApiUrl');
      if (storedUrl) {
        aiApiUrlField.value = storedUrl;
      } else {
        aiApiUrlField.value = getAiProviderDefaultApiUrl(aiProviderTypeField?.value);
      }
    }

    const aiApiKeyField = document.getElementById('aiApiKey');
    if (aiApiKeyField) {
      getExtensionStorageValue(AI_API_KEY_STORAGE_KEY)
        .then((storedKey) => {
          const legacyStoredKey = getRawStorageValue(AI_API_KEY_STORAGE_KEY);
          const keyToUse = storedKey || legacyStoredKey;
          if (keyToUse) {
            aiApiKeyField.value = keyToUse;
          }
          if (!storedKey && legacyStoredKey) {
            return setExtensionStorageValue(AI_API_KEY_STORAGE_KEY, legacyStoredKey).then(
              (didSave) => {
                if (didSave) removeRawStorageValue(AI_API_KEY_STORAGE_KEY);
              }
            );
          }
          return null;
        })
        .catch((error) => {
          logger(`⚠️ Failed to load AI API Key: ${error.message}`);
        });
    }

    const aiProfileModelField = document.getElementById(AI_PROFILE_SETTING_KEYS.model);
    if (aiProfileModelField) {
      aiProfileModelField.value =
        getSetting(
          AI_PROFILE_SETTING_KEYS.model,
          getSetting(AI_PROFILE_SETTING_KEYS.legacyModel, DEFAULT_AI_PROFILE_MODEL)
        ) || DEFAULT_AI_PROFILE_MODEL;
    }

    const aiReplyModelField = document.getElementById(AI_REPLY_SETTING_KEYS.model);
    if (aiReplyModelField) {
      aiReplyModelField.value =
        getSetting(
          AI_REPLY_SETTING_KEYS.model,
          getSetting(AI_REPLY_SETTING_KEYS.legacyModel, DEFAULT_AI_REPLY_MODEL)
        ) || DEFAULT_AI_REPLY_MODEL;
    }

    const aiFilterRulesField = document.getElementById('aiFilterRules');
    if (aiFilterRulesField) {
      const storedRules = getSetting('aiFilterRules');
      if (storedRules) {
        aiFilterRulesField.value = storedRules;
      }
    }

    const aiProfileReasoningEffortField = document.getElementById(
      AI_PROFILE_SETTING_KEYS.reasoningEffort
    );
    if (aiProfileReasoningEffortField) {
      aiProfileReasoningEffortField.value = normalizeAiReasoningEffort(
        getSetting(
          AI_PROFILE_SETTING_KEYS.reasoningEffort,
          getSetting(
            AI_PROFILE_SETTING_KEYS.legacyReasoningEffort,
            DEFAULT_AI_PROFILE_REASONING_EFFORT
          )
        )
      );
    }

    const aiReplyReasoningEffortField = document.getElementById(
      AI_REPLY_SETTING_KEYS.reasoningEffort
    );
    if (aiReplyReasoningEffortField) {
      aiReplyReasoningEffortField.value = normalizeAiReplyReasoningEffort(
        getSetting(AI_REPLY_SETTING_KEYS.reasoningEffort, DEFAULT_AI_REPLY_REASONING_EFFORT)
      );
    }

    const aiReplyToneField = document.getElementById('aiReplyTone');
    if (aiReplyToneField) {
      aiReplyToneField.value = getSetting('aiReplyTone', DEFAULT_AI_REPLY_TONE);
    }

    const aiReplyUserContextField = document.getElementById('aiReplyUserContext');
    if (aiReplyUserContextField) {
      aiReplyUserContextField.value = getSetting(
        'aiReplyUserContext',
        DEFAULT_AI_REPLY_USER_CONTEXT
      );
    }

    const aiReplyStyleExamplesField = document.getElementById(
      AI_REPLY_SETTING_KEYS.styleExamples
    );
    if (aiReplyStyleExamplesField) {
      aiReplyStyleExamplesField.value = getSetting(
        AI_REPLY_SETTING_KEYS.styleExamples,
        DEFAULT_AI_REPLY_STYLE_EXAMPLES
      );
    }

    const aiReplyContactInfoField = document.getElementById('aiReplyContactInfo');
    if (aiReplyContactInfoField) {
      aiReplyContactInfoField.value = getSetting(
        'aiReplyContactInfo',
        DEFAULT_AI_REPLY_CONTACT_INFO
      );
    }

    const aiReplyAddressInfoField = document.getElementById('aiReplyAddressInfo');
    if (aiReplyAddressInfoField) {
      aiReplyAddressInfoField.value = getSetting(
        'aiReplyAddressInfo',
        DEFAULT_AI_REPLY_ADDRESS_INFO
      );
    }

    const aiReplyHardRulesField = document.getElementById(AI_REPLY_SETTING_KEYS.hardRules);
    if (aiReplyHardRulesField) {
      aiReplyHardRulesField.value = getSetting(
        AI_REPLY_SETTING_KEYS.hardRules,
        DEFAULT_AI_REPLY_HARD_RULES
      );
    }

    const aiReplyCompatibilityModeField = document.getElementById('aiReplyCompatibilityMode');
    if (aiReplyCompatibilityModeField) {
      aiReplyCompatibilityModeField.value = normalizeAiReplyCompatibilityMode(
        getSetting(AI_REPLY_SETTING_KEYS.compatibilityMode, DEFAULT_AI_REPLY_COMPATIBILITY_MODE)
      );
    }
  };

  initializeCounters = () => {
    renderCounters();
  };

  getErrorMessage = (error) => (error instanceof Error ? error.message : String(error));

  runAutomationCallback = (callback, action, selector) => {
    if (!callback) return;

    try {
      const result = callback();
      if (result && typeof result.catch === 'function') {
        result.catch((error) => {
          logger(`⚠️ ${action} failed for ${selector}: ${this.getErrorMessage(error)}`);
          if (action === 'start') setToggleControlState(selector, false);
        });
      }
    } catch (error) {
      logger(`⚠️ ${action} failed for ${selector}: ${this.getErrorMessage(error)}`);
      if (action === 'start') setToggleControlState(selector, false);
    }
  };

  populateAiModelOptions = (models = []) => {
    const datalist = document.getElementById(AI_MODEL_DATALIST_ID);
    if (!datalist) return false;

    while (datalist.firstChild) {
      datalist.removeChild(datalist.firstChild);
    }

    models.forEach((model) => {
      const option = document.createElement('option');
      option.value = model;
      datalist.appendChild(option);
    });

    return true;
  };

  updateAiConnectionStatus = ({ message, status = 'idle' } = {}) => {
    const statusElement = document.getElementById('aiConnectionStatus');
    if (!statusElement) return false;

    const styles = {
      error: `margin: 0 16px 12px 16px; padding: 8px 10px; border-radius: 8px; background: ${SIDEBAR_THEME.dangerSoft}; border: 1px solid ${SIDEBAR_THEME.dangerBorder}; color: ${SIDEBAR_THEME.danger}; font-size: 11px; line-height: 1.4; text-align: left;`,
      idle: `margin: 0 16px 12px 16px; padding: 8px 10px; border-radius: 8px; background: ${SIDEBAR_THEME.accentSofter}; border: 1px solid ${SIDEBAR_THEME.accentBorder}; color: ${SIDEBAR_THEME.textMuted}; font-size: 11px; line-height: 1.4; text-align: left;`,
      loading: `margin: 0 16px 12px 16px; padding: 8px 10px; border-radius: 8px; background: ${SIDEBAR_THEME.warningSoft}; border: 1px solid ${SIDEBAR_THEME.warningBorder}; color: ${SIDEBAR_THEME.warning}; font-size: 11px; line-height: 1.4; text-align: left;`,
      success: `margin: 0 16px 12px 16px; padding: 8px 10px; border-radius: 8px; background: ${SIDEBAR_THEME.successSoft}; border: 1px solid ${SIDEBAR_THEME.successBorder}; color: ${SIDEBAR_THEME.success}; font-size: 11px; line-height: 1.4; text-align: left;`,
      warning: `margin: 0 16px 12px 16px; padding: 8px 10px; border-radius: 8px; background: ${SIDEBAR_THEME.warningSoft}; border: 1px solid ${SIDEBAR_THEME.warningBorder}; color: ${SIDEBAR_THEME.warning}; font-size: 11px; line-height: 1.4; text-align: left;`
    };

    statusElement.textContent = String(message || 'Provider ready. Refresh models to load suggestions.');
    statusElement.style.cssText = styles[status] || styles.idle;
    return true;
  };

  refreshAiModelOptions = async (triggerButton = null) => {
    if (triggerButton) triggerButton.disabled = true;

    try {
      const apiUrlField = document.getElementById('aiApiUrl');
      const apiUrl = (apiUrlField?.value || getSetting('aiApiUrl', '')).trim();
      const providerTypeField = document.getElementById(AI_PROVIDER_SETTING_KEY);
      const providerType = normalizeAiProviderType(
        providerTypeField?.value || getSetting(AI_PROVIDER_SETTING_KEY, DEFAULT_AI_PROVIDER_TYPE)
      );
      const providerLabel = getAiProviderLabel(providerType);
      this.updateAiConnectionStatus({
        message: `Loading model suggestions from ${providerLabel}...`,
        status: 'loading'
      });
      const apiKey = (await getExtensionStorageValue(AI_API_KEY_STORAGE_KEY)) || '';
      const models = await fetchAiModelList({ apiKey, apiUrl, providerType });

      if (!models.length) {
        this.updateAiConnectionStatus({
          message: `${providerLabel} returned no model suggestions. Manual model input still works.`,
          status: 'warning'
        });
        logger('⚠️ No AI models returned by the provider');
        return [];
      }

      this.populateAiModelOptions(models);
      this.updateAiConnectionStatus({
        message: `Loaded ${models.length} model suggestions from ${providerLabel}.`,
        status: 'success'
      });
      logger(`✅ Loaded ${models.length} AI model options`);
      return models;
    } catch (error) {
      this.updateAiConnectionStatus({
        message: `Model refresh failed: ${this.getErrorMessage(error)}`,
        status: 'error'
      });
      logger(`⚠️ Failed to refresh AI models: ${this.getErrorMessage(error)}`);
      return [];
    } finally {
      if (triggerButton) triggerButton.disabled = false;
    }
  };

  getFieldValue = (id, fallback = '') => {
    const field = document.getElementById(id);
    return String(field?.value ?? fallback).trim();
  };

  getCurrentAiReplySettings = () => {
    const storedSettings = readAiReplySettings(getSetting);
    const storedProviderSettings = readAiProviderSettings(getSetting);
    const contextWindowValue = this.getFieldValue(
      AI_REPLY_SETTING_KEYS.contextWindow,
      storedSettings.contextWindow
    );
    const maxTokensValue = this.getFieldValue(
      `${AI_REPLY_SETTING_KEYS.maxTokens}Input`,
      this.getFieldValue(AI_REPLY_SETTING_KEYS.maxTokens, storedSettings.maxTokens)
    );

    return {
      ...storedSettings,
      addressInfo: this.getFieldValue(
        AI_REPLY_SETTING_KEYS.addressInfo,
        storedSettings.addressInfo
      ),
      apiUrl: this.getFieldValue(AI_REPLY_SETTING_KEYS.apiUrl, storedSettings.apiUrl),
      compatibilityMode: normalizeAiReplyCompatibilityMode(
        this.getFieldValue(
          AI_REPLY_SETTING_KEYS.compatibilityMode,
          storedSettings.compatibilityMode
        )
      ),
      contactInfo: this.getFieldValue(
        AI_REPLY_SETTING_KEYS.contactInfo,
        storedSettings.contactInfo
      ),
      continuousIntervalMinutes: normalizeAiReplyContinuousIntervalMinutes(
        this.getFieldValue(
          AI_REPLY_SETTING_KEYS.continuousIntervalMinutes,
          storedSettings.continuousIntervalMinutes
        )
      ),
      continuousMaxPerMatchPerDay: normalizeAiReplyContinuousMaxPerMatchPerDay(
        this.getFieldValue(
          AI_REPLY_SETTING_KEYS.continuousMaxPerMatchPerDay,
          storedSettings.continuousMaxPerMatchPerDay
        )
      ),
      continuousMaxSentPerCycle: normalizeAiReplyContinuousMaxSentPerCycle(
        this.getFieldValue(
          AI_REPLY_SETTING_KEYS.continuousMaxSentPerCycle,
          storedSettings.continuousMaxSentPerCycle
        )
      ),
      contextWindow: normalizeAiReplyContextWindow(contextWindowValue),
      hardRules: this.getFieldValue(AI_REPLY_SETTING_KEYS.hardRules, storedSettings.hardRules),
      maxTokens: normalizeAiReplyMaxTokens(maxTokensValue),
      model: this.getFieldValue(AI_REPLY_SETTING_KEYS.model, storedSettings.model),
      providerType: normalizeAiProviderType(
        this.getFieldValue(AI_PROVIDER_SETTING_KEY, storedProviderSettings.providerType)
      ),
      reasoningEffort: normalizeAiReplyReasoningEffort(
        this.getFieldValue(AI_REPLY_SETTING_KEYS.reasoningEffort, storedSettings.reasoningEffort)
      ),
      styleExamples: this.getFieldValue(
        AI_REPLY_SETTING_KEYS.styleExamples,
        storedSettings.styleExamples
      ),
      tone: this.getFieldValue(AI_REPLY_SETTING_KEYS.tone, storedSettings.tone),
      userContext: this.getFieldValue(AI_REPLY_SETTING_KEYS.userContext, storedSettings.userContext)
    };
  };

  getAiReplyTestContext = () => {
    const conversationText = this.getFieldValue('aiReplyTestConversation');
    const conversationTurns = parseAiReplyTestConversation(conversationText);
    const matchName = this.getFieldValue('aiReplyTestMatchName');
    return { conversationTurns, matchName };
  };

  setAiReplyTestOutput = (value) => {
    const output = document.getElementById('aiReplyTestOutput');
    if (output) output.value = String(value || '');
  };

  previewAiReplyPrompt = () => {
    const settings = this.getCurrentAiReplySettings();
    const { conversationTurns, matchName } = this.getAiReplyTestContext();

    if (!conversationTurns.length) {
      this.setAiReplyTestOutput('Paste at least one USER: or MATCH: line before previewing.');
      return;
    }

    const body = buildAiReplyRequestBody({
      ...settings,
      conversationTurns,
      matchName
    });
    const systemMessage = body.messages?.[0]?.content || '';
    const userMessage = body.messages?.[1]?.content?.[0]?.text || '';

    this.setAiReplyTestOutput(`SYSTEM:\n${systemMessage}\n\nUSER:\n${userMessage}`);
    logger('👀 Generated AI reply prompt preview');
  };

  testAiReply = async (triggerButton = null) => {
    if (triggerButton) triggerButton.disabled = true;

    try {
      const settings = this.getCurrentAiReplySettings();
      const { conversationTurns, matchName } = this.getAiReplyTestContext();

      if (!conversationTurns.length) {
        this.setAiReplyTestOutput('Paste at least one USER: or MATCH: line before testing.');
        return;
      }

      const apiKey = (await getExtensionStorageValue(AI_API_KEY_STORAGE_KEY)) || '';
      const result = await generateAiMessageReply({
        ...settings,
        apiKey,
        conversationTurns,
        matchName
      });

      this.setAiReplyTestOutput(JSON.stringify(result, null, 2));
      logger('🧪 Generated AI reply test output');
    } catch (error) {
      this.setAiReplyTestOutput(`AI reply test failed: ${this.getErrorMessage(error)}`);
      logger(`⚠️ AI reply test failed: ${this.getErrorMessage(error)}`);
    } finally {
      if (triggerButton) triggerButton.disabled = false;
    }
  };

  getCurrentAiReplyMode = () =>
    getAiReplyModeFromResponderState({
      isContinuousMode: this.aiMessageResponder.isContinuousMode,
      isRunning: this.aiMessageResponder.isRunning
    });

  updateAiReplyModeSelector = (mode = this.getCurrentAiReplyMode()) => {
    const selectedMode = normalizeAiReplyMode(mode);
    const buttons = document.querySelectorAll('[data-ai-reply-mode]');
    if (!buttons.length) return false;

    buttons.forEach((button) => {
      const isSelected = button.getAttribute('data-ai-reply-mode') === selectedMode;
      button.setAttribute('data-selected', String(isSelected));
      button.style.cssText = isSelected
        ? `flex: 1; padding: 10px 8px; background: ${SIDEBAR_THEME.accentGradient}; color: ${SIDEBAR_THEME.text}; border: 1px solid ${SIDEBAR_THEME.accentBorder}; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s ease;`
        : `flex: 1; padding: 10px 8px; background: ${SIDEBAR_THEME.surfaceMuted}; color: ${SIDEBAR_THEME.text}; border: 1px solid ${SIDEBAR_THEME.border}; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s ease;`;
    });

    this.updateAiReplyRuntimeControls(selectedMode);
    return true;
  };

  updateAiReplyRuntimeControls = (mode = this.getCurrentAiReplyMode()) => {
    const isContinuous = isAiReplyContinuousMode(mode);
    const containers = document.querySelectorAll('[data-ai-reply-continuous-control="true"]');
    if (!containers.length) return false;

    containers.forEach((container) => {
      container.style.opacity = isContinuous ? '1' : '0.5';
      container.style.pointerEvents = isContinuous ? 'auto' : 'none';
      container.querySelectorAll('input, select, textarea, button').forEach((control) => {
        control.disabled = !isContinuous;
      });
    });

    return true;
  };

  setAiReplyMode = (requestedMode) => {
    const nextMode = normalizeAiReplyMode(requestedMode);
    const currentMode = this.getCurrentAiReplyMode();

    if (nextMode === AI_REPLY_MODES.off) {
      if (this.aiMessageResponder.isRunning) {
        this.aiMessageResponder.stop();
      } else {
        this.updateAiReplyModeSelector(AI_REPLY_MODES.off);
      }
      return;
    }

    if (!canStartAiReplyMode({ currentMode, requestedMode: nextMode })) {
      logger('Stop the current AI reply mode before starting another');
      this.updateAiReplyModeSelector(currentMode);
      return;
    }

    if (nextMode === AI_REPLY_MODES.continuous) {
      this.aiMessageResponder.startContinuous();
      return;
    }

    this.aiMessageResponder.start();
  };

  bindAiReplyModeSelector = () => {
    const buttons = document.querySelectorAll('[data-ai-reply-mode]');
    if (!buttons.length) {
      warnLog('AI reply mode selector not found');
      return;
    }

    buttons.forEach((button) => {
      this.addTrackedListener(button, 'click', () => {
        this.setAiReplyMode(button.getAttribute('data-ai-reply-mode'));
      });
    });
  };

  bindCheckbox = (selector, start = false, stop = false) => {
    const element = document.querySelector(selector);
    if (!element) {
      warnLog(`Element not found for selector: ${selector}`);
      return;
    }

    element.onclick = (e) => {
      e.preventDefault();

      const isOn = getCheckboxValue(selector);
      const nextState = toggleCheckbox(selector);

      if (shouldPersistToggleState(selector)) {
        setSetting(`toggleState/${selector}`, nextState);
      }

      // Update dependent sliders with a small delay to ensure toggle state is updated
      setTimeout(() => {
        this.updateSliderStates();
      }, 50);

      if (isOn) this.runAutomationCallback(stop, 'stop', selector);
      if (!isOn) this.runAutomationCallback(start, 'start', selector);
    };
  };

  updateSliderStates = () => {
    debugLog('updateSliderStates called');

    // Manual slider mapping since the data-parent approach isn't working
    const sliderMappings = [
      { sliderId: 'minAge', parentSelector: '.tinderAutopilotAdvancedFilter' },
      { sliderId: 'maxAge', parentSelector: '.tinderAutopilotAdvancedFilter' },
      { sliderId: 'maxDistance', parentSelector: '.tinderAutopilotAdvancedFilter' },
      { sliderId: 'minPhotoCount', parentSelector: '.tinderAutopilotAdvancedFilter' }
    ];

    sliderMappings.forEach(({ sliderId, parentSelector }) => {
      const slider = document.getElementById(sliderId);
      const container =
        slider?.closest('.slider-container') || slider?.parentElement?.parentElement?.parentElement;

      if (slider && container) {
        const isParentEnabled = getCheckboxValue(parentSelector);
        debugLog(`Slider ${sliderId} - Parent ${parentSelector} enabled: ${isParentEnabled}`);

        slider.disabled = !isParentEnabled;

        // Update visual state
        if (isParentEnabled) {
          container.style.opacity = '1';
          container.style.pointerEvents = 'auto';
          debugLog(`Enabled slider: ${sliderId}`);
        } else {
          container.style.opacity = '0.5';
          container.style.pointerEvents = 'none';
          debugLog(`Disabled slider: ${sliderId}`);
        }
      } else {
        debugLog(`Slider ${sliderId} or container not found`);
      }
    });
  };
}

export { getCheckboxValue, toggleCheckbox };

export default Sidebar;
