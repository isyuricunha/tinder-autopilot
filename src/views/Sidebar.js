import Messenger from '../automations/Messenger';
import Swiper from '../automations/Swiper';
import HideUnanswered from '../automations/HideUnanswered';
import Anonymous from '../automations/Anonymous';
import { waitUntilElementExists, logger, debugLog, warnLog } from '../misc/helper';
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
  removeRawStorageValue,
  setJsonSetting,
  setSetting
} from '../misc/settings-store';
import { resetCounters, renderCounters } from '../misc/counter-store';
import { createSidebarElement, renderSidebarContent } from './sidebar-renderer';
import {
  getCheckboxValue,
  toggleCheckbox,
  setToggleState as setToggleControlState
} from './toggle-control';

const AI_API_KEY_STORAGE_KEY = 'TinderAutopilot/aiApiKey';

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
        background: #1a1a1a;
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #ff6b35, #ff8c42);
        border-radius: 4px;
        transition: all 0.3s ease;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #ff8c42, #ffab42);
      }
      
      /* Hover effects */
      .autopilot-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(255, 107, 53, 0.15) !important;
        border-color: #ff6b35 !important;
      }
      
      /* Activity log styling */
      .txt p {
        margin: 4px 0 !important;
        padding: 8px 12px !important;
        border-radius: 8px !important;
        background: rgba(255, 107, 53, 0.05) !important;
        border-left: 3px solid #ff6b35 !important;
      }
      .txt span {
        color: #ff6b35 !important;
        font-weight: 600 !important;
      }
      
      /* Textarea focus effects */
      textarea:focus {
        outline: none !important;
        box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(255, 107, 53, 0.3) !important;
        border-color: #ff6b35 !important;
      }
      
      /* Selection colors */
      ::selection {
        background: rgba(255, 107, 53, 0.3);
        color: #ffffff;
      }
      ::-moz-selection {
        background: rgba(255, 107, 53, 0.3);
        color: #ffffff;
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

    // Initialize slider values from localStorage
    this.initializeSliders();

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

    // Save reasoning effort when user changes it
    const aiReasoningEffortField = document.getElementById('aiReasoningEffort');
    if (aiReasoningEffortField) {
      this.addTrackedListener(aiReasoningEffortField, 'change', (e) => {
        const value = e.target.value;
        setSetting('aiReasoningEffort', value);
        logger(`💾 Saved AI Reasoning Effort: ${value}`);
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

    const aiApiKeyField = document.getElementById('aiApiKey');
    if (aiApiKeyField) {
      this.addTrackedListener(aiApiKeyField, 'blur', (e) => {
        const value = e.target.value.trim();
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

    const aiModelField = document.getElementById('aiModel');
    if (aiModelField) {
      this.addTrackedListener(aiModelField, 'blur', (e) => {
        const value = e.target.value.trim();
        setSetting('aiModel', value);
        logger(`💾 Saved AI Model: ${value}`);
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
    // Restore saved toggle states from localStorage for non-excluded toggles
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
      if (getToggleState(selector)) {
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
      { id: 'minPhotoCount', defaultValue: 3, unit: ' photos' }
    ];

    sliders.forEach(({ id, defaultValue, unit }) => {
      const slider = document.getElementById(id);
      const valueDisplay = document.getElementById(`${id}Value`);

      if (slider && valueDisplay) {
        const storedValue = getSetting(id, defaultValue);
        slider.value = storedValue;
        valueDisplay.textContent = storedValue + unit;
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
    const aiApiUrlField = document.getElementById('aiApiUrl');
    if (aiApiUrlField) {
      const storedUrl = getSetting('aiApiUrl');
      if (storedUrl) {
        aiApiUrlField.value = storedUrl;
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

    const aiModelField = document.getElementById('aiModel');
    if (aiModelField) {
      const storedModel = getSetting('aiModel');
      if (storedModel) {
        aiModelField.value = storedModel;
      }
    }

    const aiFilterRulesField = document.getElementById('aiFilterRules');
    if (aiFilterRulesField) {
      const storedRules = getSetting('aiFilterRules');
      if (storedRules) {
        aiFilterRulesField.value = storedRules;
      }
    }

    // Initialize reasoning effort dropdown
    const aiReasoningEffortField = document.getElementById('aiReasoningEffort');
    if (aiReasoningEffortField) {
      const storedEffort = getSetting('aiReasoningEffort');
      if (storedEffort) {
        aiReasoningEffortField.value = storedEffort;
      } else {
        // Default to medium
        aiReasoningEffortField.value = 'medium';
      }
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

  bindCheckbox = (selector, start = false, stop = false) => {
    const element = document.querySelector(selector);
    if (!element) {
      warnLog(`Element not found for selector: ${selector}`);
      return;
    }

    const excludedSelectors = [
      '.tinderAutopilot',
      '.tinderAutopilotMessage',
      '.tinderAutopilotMessageNewOnly'
    ];

    element.onclick = (e) => {
      e.preventDefault();

      const isOn = getCheckboxValue(selector);
      const nextState = toggleCheckbox(selector);

      // Save state to localStorage (except for excluded selectors)
      if (!excludedSelectors.includes(selector)) {
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
