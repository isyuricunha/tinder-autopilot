import {
  onToggle,
  offToggle,
  topBanner,
  autopilot,
  infoBanner,
  massMessage,
  loggerHeader,
  counterLogs,
  offToggleInner,
  onToggleInner
} from './templates';
import Messenger from '../automations/Messenger';
import Swiper from '../automations/Swiper';
import HideUnanswered from '../automations/HideUnanswered';
import Anonymous from '../automations/Anonymous';
import { waitUntilElementExists } from '../misc/helper';
import { insertCss } from '../misc/insert-css';

class Sidebar {
  constructor() {
    this.injectModernStyles();
    this.sidebar();

    this.anonymous = new Anonymous();
    this.hideUnanswered = new HideUnanswered();
    this.swiper = new Swiper();
    this.messenger = new Messenger();

    this.events();
  }

  injectModernStyles() {
    insertCss(`
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
    `);
  }

  insertBefore = (el, referenceNode) => {
    referenceNode.parentNode.insertBefore(el, referenceNode);
  };

  sidebar = () => {
    // sidebar.js
    const el = document.createElement('aside');
    el.className = 'H(100%) Fld(c) Pos(r) Flxg(0) Fxs(0) Flxb(25%) Miw(325px) Maw(375px)';
    el.style.cssText = 'background: #000000; color: #ffffff; z-index: 9999999; border-right: 1px solid #333333; box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);';
    el.innerHTML = infoBanner;
    this.insertBefore(el, document.querySelector('aside:first-of-type'));

    this.infoBanner = document.querySelector('#infoBanner');

    this.infoBanner.innerHTML = `
  <nav style="position: relative; height: 100%; background: #000000;">
    <div style="height: 100%;">
      <div style="overflow: hidden; background: #000000; position: relative; height: 100%;">
        <div style="background: #000000; padding-bottom: 24px; font-size: 16px; height: 100%; overflow-x: hidden; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #ff6b35 #1a1a1a; color: #ffffff;" class="custom-scrollbar">
          ${topBanner}
          ${counterLogs(0, 0)}
          ${autopilot}
          ${massMessage}
          ${loggerHeader}
          <div class="txt" style="overflow-y: auto; height: auto; max-height: 250px; margin: 12px; padding: 12px; background: #1a1a1a; border-radius: 12px; border: 1px solid #333333; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; font-size: 11px; line-height: 1.4;"></div>
        </div>
      </div>
    </div>
  </nav>
`;
  };

  events = () => {
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

    // Initialize slider values from localStorage
    this.initializeSliders();
    
    // Set initial slider states based on toggle positions
    setTimeout(() => {
      this.updateSliderStates();
    }, 1000);
    
    // Also add a manual trigger for testing
    window.updateSliderStates = () => this.updateSliderStates();

    document.getElementById('messageToSend').addEventListener('blur', (e) => {
      localStorage.setItem('TinderAutopilot/MessengerDefault', JSON.stringify(e.target.value));
    });
  };

  initializeSliders = () => {
    const sliders = [
      { id: 'likeInterval', defaultValue: 3, unit: 's' },
      { id: 'minAge', defaultValue: 18, unit: ' years' },
      { id: 'maxAge', defaultValue: 35, unit: ' years' },
      { id: 'maxDistance', defaultValue: 50, unit: ' km' },
      { id: 'minPhotoCount', defaultValue: 3, unit: ' photos' }
    ];

    sliders.forEach(({ id, defaultValue, unit }) => {
      const slider = document.getElementById(id);
      const valueDisplay = document.getElementById(`${id}Value`);
      
      if (slider && valueDisplay) {
        const storedValue = localStorage.getItem(`TinderAutopilot/${id}`) || defaultValue;
        slider.value = storedValue;
        valueDisplay.textContent = storedValue + unit;
      }
    });

    // Initialize Super Like strategy dropdown
    const strategySelect = document.getElementById('superLikeStrategy');
    if (strategySelect) {
      const storedStrategy = localStorage.getItem('TinderAutopilot/superLikeStrategy') || 'random';
      strategySelect.value = storedStrategy;
    }
  };

  bindCheckbox = (selector, start = false, stop = false) => {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element not found for selector: ${selector}`);
      return;
    }
    
    element.onclick = (e) => {
      e.preventDefault();

      const isOn = getCheckboxValue(selector);
      toggleCheckbox(selector);
      
      // Update dependent sliders with a small delay to ensure toggle state is updated
      setTimeout(() => {
        this.updateSliderStates();
      }, 50);
      
      if (isOn && stop) stop();
      if (!isOn && start) start();
    };
  };

  updateSliderStates = () => {
    console.log('🔧 updateSliderStates called');
    
    // Manual slider mapping since the data-parent approach isn't working
    const sliderMappings = [
      { sliderId: 'likeInterval', parentSelector: '.tinderAutopilot' },
      { sliderId: 'minAge', parentSelector: '.tinderAutopilotAdvancedFilter' },
      { sliderId: 'maxAge', parentSelector: '.tinderAutopilotAdvancedFilter' },
      { sliderId: 'maxDistance', parentSelector: '.tinderAutopilotAdvancedFilter' },
      { sliderId: 'minPhotoCount', parentSelector: '.tinderAutopilotAdvancedFilter' }
    ];
    
    sliderMappings.forEach(({ sliderId, parentSelector }) => {
      const slider = document.getElementById(sliderId);
      const container = slider?.closest('.slider-container') || slider?.parentElement?.parentElement?.parentElement;
      
      if (slider && container) {
        const isParentEnabled = getCheckboxValue(parentSelector);
        console.log(`Slider ${sliderId} - Parent ${parentSelector} enabled: ${isParentEnabled}`);
        
        slider.disabled = !isParentEnabled;
        
        // Update visual state
        if (isParentEnabled) {
          container.style.opacity = '1';
          container.style.pointerEvents = 'auto';
          console.log(`✅ Enabled slider: ${sliderId}`);
        } else {
          container.style.opacity = '0.5';
          container.style.pointerEvents = 'none';
          console.log(`❌ Disabled slider: ${sliderId}`);
        }
      } else {
        console.log(`⚠️ Slider ${sliderId} or container not found`);
      }
    });
  };
}

const getCheckboxValue = (selector) => {
  const toggleElement = document.querySelector(`${selector} .toggleSwitch > div`);
  console.log(`🔍 Toggle element for ${selector}:`, toggleElement);
  
  if (toggleElement) {
    const style = toggleElement.style.cssText;
    const background = toggleElement.style.background;
    console.log(`🎨 Style: ${style}`);
    console.log(`🎨 Background: ${background}`);
    
    // Check multiple ways the toggle might be "on"
    const isOnByGradient = style.includes('linear-gradient(135deg, rgb(255, 107, 53), rgb(255, 140, 66))') || 
                          style.includes('linear-gradient(135deg, #ff6b35, #ff8c42)') ||
                          background.includes('linear-gradient(135deg, rgb(255, 107, 53), rgb(255, 140, 66))') ||
                          background.includes('linear-gradient(135deg, #ff6b35, #ff8c42)');
    
    const isOnByBorder = style.includes('border: 2px solid rgb(255, 107, 53)') || 
                        style.includes('border: 2px solid #ff6b35');
    
    const isOn = isOnByGradient || isOnByBorder;
    console.log(`✅ getCheckboxValue(${selector}): ${isOn} (gradient: ${isOnByGradient}, border: ${isOnByBorder})`);
    return isOn;
  }
  
  console.log(`❌ getCheckboxValue(${selector}): false (element not found)`);
  return false;
};

const toggleCheckbox = (selector) => {
  const isOn = getCheckboxValue(selector);
  const toggleElement = document.querySelector(`${selector} .toggleSwitch > div`);
  const innerElement = document.querySelector(`${selector} .toggleSwitch > div > div`);
  
  if (toggleElement && innerElement) {
    toggleElement.style.cssText = isOn ? offToggle : onToggle;
    innerElement.style.cssText = isOn ? offToggleInner : onToggleInner;
  }
};

export { getCheckboxValue, toggleCheckbox };

export default Sidebar;
