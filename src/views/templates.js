import { getJsonSetting, getSetting, setJsonSetting, setSetting } from '../misc/settings-store';
import {
  AI_REPLY_COMPATIBILITY_MODES,
  AI_REPLY_REASONING_EFFORTS,
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
  MAX_AI_REPLY_CONTEXT_WINDOW,
  MAX_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES,
  MAX_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY,
  MAX_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE,
  MAX_AI_REPLY_DELAY_SECONDS,
  MAX_AI_REPLY_MAX_TOKENS,
  MIN_AI_REPLY_DELAY_SECONDS,
  MIN_AI_REPLY_MAX_TOKENS,
  MIN_AI_REPLY_CONTEXT_WINDOW,
  MIN_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES,
  MIN_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY,
  MIN_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE
} from '../misc/ai-message-reply-settings';
import {
  AI_PROFILE_SETTING_KEYS,
  AI_REASONING_EFFORTS,
  DEFAULT_AI_PROFILE_MODEL,
  DEFAULT_AI_PROFILE_REASONING_EFFORT
} from '../misc/ai-profile-filter-settings';
import {
  AI_PROVIDER_SETTING_KEY,
  AI_PROVIDER_TYPES,
  DEFAULT_AI_PROVIDER_TYPE
} from '../misc/ai-provider-settings';
import {
  normalizeSidebarSectionId,
  readSidebarSectionOpen,
  writeSidebarSectionOpen
} from './sidebar-section-state';
import { SIDEBAR_THEME } from './sidebar-theme';
import { onToggle, onToggleInner, offToggle, offToggleInner } from './toggle-styles';

const DEFAULT_MESSAGE =
  'Hey {name}, this is an automated message to remind you of your upcoming "Netflix and Chill" appointment in the next week. To confirm your appointment text YES DADDY. To unsubscribe, please text WRONG HOLE. Standard text and bill rates do apply. Thanks for choosing Slide N Yo DMs';

const SVG_NS = 'http://www.w3.org/2000/svg';
const AI_MODEL_DATALIST_ID = 'aiModelOptions';
const SECTION_TITLE_STYLE = `color: ${SIDEBAR_THEME.text}; padding: 16px 20px 12px 20px; letter-spacing: 0; text-transform: uppercase; margin: 24px 0 0 0; font-size: 14px; font-weight: 600; border-left: 3px solid ${SIDEBAR_THEME.accent}; background: ${SIDEBAR_THEME.accentSofter}; border-radius: 0 8px 8px 0;`;
const TEXTAREA_SIZE_STYLES = {
  default: 'min-height: 60px; max-height: 120px;',
  large: 'min-height: 120px; max-height: 280px;',
  output: 'min-height: 140px; max-height: 320px;'
};

const appendChildren = (element, children) => {
  children.flat().forEach((child) => {
    if (!child) return;
    element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });
  return element;
};

const createElement = (tag, options = {}, children = []) => {
  const element = document.createElement(tag);
  const { className, id, text, style, attributes = {} } = options;

  if (className) element.className = className;
  if (id) element.id = id;
  if (text !== undefined) element.textContent = text;
  if (style) element.style.cssText = style;
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));

  return appendChildren(element, children);
};

const createFragment = (children = []) =>
  appendChildren(document.createDocumentFragment(), children);

const createSvgIcon = (pathD) => {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('style', 'width: 20px; height: 20px;');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', pathD);
  path.setAttribute('fill', SIDEBAR_THEME.text);
  svg.appendChild(path);

  return svg;
};

const createHelpText = (helpText) => {
  if (!helpText) return null;

  return createElement('div', {
    text: helpText,
    style: `margin: 4px 16px 12px 16px; padding: 0; letter-spacing: 0; font-weight: 400; color: ${SIDEBAR_THEME.textSubtle}; font-size: 11px; text-align: left; line-height: 1.4;`
  });
};

const createCard = (children) =>
  createElement(
    'div',
    {
      style: `background: ${SIDEBAR_THEME.surface}; border: 1px solid ${SIDEBAR_THEME.border}; border-radius: 8px; margin: 6px 12px; overflow: hidden; transition: all 0.2s ease; box-shadow: 0 1px 0 rgba(255, 255, 255, 0.03);`
    },
    [
      createElement(
        'div',
        {
          style: `background: ${SIDEBAR_THEME.surface}; border: none; transition: all 0.2s ease; position: relative;`
        },
        children
      )
    ]
  );

const createTopBanner = () =>
  createElement(
    'div',
    {
      style: `position: relative; z-index: 2; transition: all 0.2s ease; text-align: center; background: ${SIDEBAR_THEME.backgroundElevated}; border-bottom: 1px solid ${SIDEBAR_THEME.border}; padding: 14px 8px; min-height: 54px; display: flex; align-items: center; justify-content: center;`
    },
    [
      createElement(
        'a',
        {
          style: `display: flex; align-items: center; color: ${SIDEBAR_THEME.text}; font-weight: 700; font-size: 18px; text-decoration: none; white-space: nowrap; overflow: hidden;`,
          attributes: { href: '/app/profile' }
        },
        [
          createElement(
            'span',
            { style: 'display: flex; align-items: center; gap: 6px;' },
            [createElement('span', { text: 'Autopilot' })]
          )
        ]
      )
    ]
  );

const createTitle = (title) =>
  createElement('h2', {
    text: title,
    style: SECTION_TITLE_STYLE
  });

const createSidebarSection = ({ id, title, defaultOpen = true, children = [] }) => {
  const sectionId = normalizeSidebarSectionId(id);
  const contentId = `sidebar-section-${sectionId}`;
  const isOpen = readSidebarSectionOpen({
    sectionId,
    defaultOpen,
    readSetting: getSetting
  });
  const indicator = createElement('span', {
    text: isOpen ? '-' : '+',
    style: `margin-left: 12px; color: ${SIDEBAR_THEME.textMuted}; font-size: 15px; font-weight: 700;`
  });
  const content = createElement(
    'div',
    {
      id: contentId,
      style: isOpen ? 'display: block;' : 'display: none;',
      attributes: { 'data-sidebar-section-content': sectionId }
    },
    children
  );
  const header = createElement(
    'button',
    {
      style: `${SECTION_TITLE_STYLE} width: 100%; display: flex; justify-content: space-between; align-items: center; text-align: left; font-family: inherit; cursor: pointer; border-top: 0; border-right: 0; border-bottom: 0;`,
      attributes: {
        type: 'button',
        'aria-controls': contentId,
        'aria-expanded': String(isOpen)
      }
    },
    [createElement('span', { text: title }), indicator]
  );

  header.addEventListener('click', () => {
    const nextOpen = header.getAttribute('aria-expanded') !== 'true';
    header.setAttribute('aria-expanded', String(nextOpen));
    indicator.textContent = nextOpen ? '-' : '+';
    content.style.display = nextOpen ? 'block' : 'none';
    writeSidebarSectionOpen({
      sectionId,
      isOpen: nextOpen,
      writeSetting: setSetting
    });
  });

  return createElement('section', { attributes: { 'data-sidebar-section': sectionId } }, [
    header,
    content
  ]);
};

const createTextbox = ({
  className,
  placeholder,
  helpText,
  defaultValue,
  type = 'textarea',
  attributes = {},
  textareaSize = 'default'
}) => {
  const fieldStyle = `width: calc(100% - 32px); display: block; border: 1px solid ${SIDEBAR_THEME.border}; background: ${SIDEBAR_THEME.surfaceMuted}; color: ${SIDEBAR_THEME.text}; padding: 12px; border-radius: 8px; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; transition: all 0.2s ease; box-shadow: none;`;
  const inputAttributes = { placeholder, ...attributes };
  if (defaultValue !== undefined) inputAttributes.value = defaultValue;
  const field =
    type === 'password' || type === 'text'
      ? createElement('input', {
          id: className,
          style: fieldStyle,
          attributes: {
            ...inputAttributes,
            type: type === 'password' ? 'password' : 'text',
            autocomplete: type === 'password' ? 'off' : attributes.autocomplete || 'off'
          }
        })
      : createElement('textarea', {
          id: className,
          text: defaultValue,
          style: `${fieldStyle} resize: vertical; ${
            TEXTAREA_SIZE_STYLES[textareaSize] || TEXTAREA_SIZE_STYLES.default
          }`,
          attributes: { placeholder, ...attributes }
        });

  return createFragment([
    createCard([
      createElement(
        'label',
        { style: 'display: block; padding: 12px; cursor: pointer;' },
        [
          createElement('div', {
            style: 'display: flex; justify-content: space-between; align-items: center;'
          }),
          createElement('div', { style: 'position: relative; width: 100%;' }, [field])
        ]
      )
    ]),
    createHelpText(helpText)
  ]);
};

const createCheckbox = (className, label, helpText = '') => {
  const input = createElement('input', {
    style:
      'position: absolute; width: 100%; height: 100%; opacity: 0; pointer-events: none; cursor: pointer;',
    attributes: { name: className, type: 'checkbox' }
  });
  const toggleTrack = createElement('div', { style: offToggle }, [
    createElement('div', { style: offToggleInner })
  ]);

  return createFragment([
    createCard([
      createElement(
        'label',
        { style: 'display: block; padding: 16px; cursor: pointer;' },
        [
          createElement(
            'a',
            {
              className,
              style: 'display: block; text-decoration: none; color: inherit;',
              attributes: {
                href: '#',
                title: 'Click to toggle',
                'aria-pressed': 'false',
                'data-enabled': 'false'
              }
            },
            [
              createElement(
                'div',
                {
                  style:
                    'display: flex; justify-content: space-between; align-items: center; gap: 12px;'
                },
                [
                  createElement(
                    'div',
                    {
                      style: `flex: 1; overflow: hidden; padding: 0; color: ${SIDEBAR_THEME.text}; font-size: 15px; font-weight: 500; line-height: 1.3;`
                    },
                    [createElement('span', { text: label })]
                  ),
                  createElement(
                    'div',
                    { style: 'position: relative; flex-shrink: 0;' },
                    [
                      createElement(
                        'div',
                        { className: 'toggleSwitch', style: 'cursor: pointer; pointer-events: none;' },
                        [input, toggleTrack]
                      )
                    ]
                  )
                ]
              )
            ]
          )
        ]
      )
    ]),
    createHelpText(helpText)
  ]);
};

const createSliderStyle = (className) =>
  createElement('style', {
    text: `
      #${className}::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${SIDEBAR_THEME.accentGradient};
        cursor: pointer;
        box-shadow: 0 2px 8px ${SIDEBAR_THEME.focusShadow};
      }
      #${className}::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${SIDEBAR_THEME.accentGradient};
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 8px ${SIDEBAR_THEME.focusShadow};
      }
      #${className}:disabled::-webkit-slider-thumb {
        background: ${SIDEBAR_THEME.borderStrong};
        cursor: not-allowed;
      }
      #${className}:disabled::-moz-range-thumb {
        background: ${SIDEBAR_THEME.borderStrong};
        cursor: not-allowed;
      }
      #${className}:disabled {
        background: ${SIDEBAR_THEME.surfaceMuted};
        cursor: not-allowed;
      }
    `
  });

const createSlider = ({
  className,
  label,
  helpText,
  min,
  max,
  defaultValue,
  step = 1,
  unit = '',
  parentToggle = null,
  manualInput = false,
  attributes = {}
}) => {
  const valueDisplay = createElement('span', {
    id: `${className}Value`,
    text: `${defaultValue}${unit}`,
    style: `color: ${SIDEBAR_THEME.accentHover}; font-size: 14px; font-weight: 600;`
  });
  const input = createElement('input', {
    id: className,
    style: `width: 100%; height: 6px; border-radius: 3px; background: ${SIDEBAR_THEME.borderStrong}; outline: none; -webkit-appearance: none; appearance: none;`,
    attributes: { type: 'range', min, max, value: defaultValue, step }
  });
  const numberInput = manualInput
    ? createElement('input', {
        id: `${className}Input`,
        style: `width: 96px; padding: 8px; background: ${SIDEBAR_THEME.surfaceMuted}; border: 1px solid ${SIDEBAR_THEME.border}; border-radius: 8px; color: ${SIDEBAR_THEME.text}; font-size: 13px;`,
        attributes: { type: 'number', min, max, value: defaultValue, step }
      })
    : null;
  const clampValue = (value) => {
    const parsedValue = parseInt(value, 10);
    const fallbackValue = parseInt(defaultValue, 10);
    const minValue = parseInt(min, 10);
    const maxValue = parseInt(max, 10);
    const safeValue = Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
    return Math.min(maxValue, Math.max(minValue, safeValue));
  };
  const syncValue = (value = input.value) => {
    const nextValue = String(clampValue(value));
    input.value = nextValue;
    if (numberInput) numberInput.value = nextValue;
    valueDisplay.textContent = `${nextValue}${unit}`;
    setSetting(className, nextValue);
  };
  input.addEventListener('input', () => syncValue(input.value));
  input.addEventListener('change', () => syncValue(input.value));
  if (numberInput) {
    numberInput.addEventListener('change', () => syncValue(numberInput.value));
    numberInput.addEventListener('blur', () => syncValue(numberInput.value));
  }
  const valueControls = manualInput
    ? createElement('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        numberInput,
        valueDisplay
      ])
    : valueDisplay;

  return createFragment([
    createElement(
      'div',
      {
        className: 'slider-container',
        style: `background: ${SIDEBAR_THEME.surface}; border: 1px solid ${SIDEBAR_THEME.border}; border-radius: 8px; margin: 6px 12px; overflow: hidden; transition: all 0.2s ease; box-shadow: 0 1px 0 rgba(255, 255, 255, 0.03);`,
        attributes: { 'data-parent': parentToggle || '', ...attributes }
      },
      [
        createElement(
          'div',
          {
            style: `background: ${SIDEBAR_THEME.surface}; border: none; transition: all 0.2s ease; position: relative;`
          },
          [
            createElement(
              'label',
              { style: 'display: block; padding: 16px; cursor: pointer;' },
              [
                createElement(
                  'div',
                  {
                    style:
                      'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;'
                  },
                  [
                    createElement('span', {
                      text: label,
                      style: `color: ${SIDEBAR_THEME.text}; font-size: 15px; font-weight: 500;`
                    }),
                    valueControls
                  ]
                ),
                createElement('div', { style: 'position: relative; width: 100%;' }, [
                  input,
                  createSliderStyle(className)
                ])
              ]
            )
          ]
        )
      ]
    ),
    createHelpText(helpText)
  ]);
};

const createSelectCard = ({ id, label, options, storageKey, defaultValue }) => {
  const select = createElement('select', {
    id,
    style: `width: 100%; padding: 12px; background: ${SIDEBAR_THEME.surfaceMuted}; border: 1px solid ${SIDEBAR_THEME.border}; border-radius: 8px; color: ${SIDEBAR_THEME.text}; font-size: 14px;`
  });
  options.forEach(({ value, text }) => {
    select.appendChild(createElement('option', { text, attributes: { value } }));
  });
  select.value = defaultValue;
  select.addEventListener('change', () => setSetting(storageKey, select.value));

  return createCard([
    createElement('div', { style: 'padding: 16px;' }, [
      createElement('label', {
        text: label,
        style: `color: ${SIDEBAR_THEME.text}; font-size: 15px; font-weight: 500; margin-bottom: 12px; display: block;`
      }),
      select
    ])
  ]);
};

const createAiModelDatalist = () => createElement('datalist', { id: AI_MODEL_DATALIST_ID });

const createAiReplyModeButton = ({ mode, label }) =>
  createElement('button', {
    text: label,
    style: `flex: 1; padding: 10px 8px; background: ${SIDEBAR_THEME.surfaceMuted}; color: ${SIDEBAR_THEME.text}; border: 1px solid ${SIDEBAR_THEME.border}; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s ease;`,
    attributes: {
      type: 'button',
      'data-ai-reply-mode': mode,
      'data-selected': 'false'
    }
  });

const createAiReplyModeSelector = () =>
  createFragment([
    createCard([
      createElement('div', { style: 'padding: 16px;' }, [
        createElement('label', {
          text: 'AI Reply Mode',
          style: `color: ${SIDEBAR_THEME.text}; font-size: 15px; font-weight: 500; margin-bottom: 12px; display: block;`
        }),
        createElement('div', { style: 'display: flex; gap: 8px;' }, [
          createAiReplyModeButton({ mode: 'off', label: 'Off' }),
          createAiReplyModeButton({ mode: 'once', label: 'Reply once' }),
          createAiReplyModeButton({ mode: 'continuous', label: 'Continuous' })
        ])
      ])
    ]),
    createHelpText(
      'One mode can run at a time. Use Off before changing from one running mode to another.'
    )
  ]);

const createCounterCard = ({ id, label, pathD }) =>
  createElement(
    'div',
    {
      style: `min-width: 0; padding: 10px; flex: 1; display: flex; align-items: center; gap: 8px; text-align: left; border-radius: 8px; box-shadow: 0 1px 0 rgba(255, 255, 255, 0.03); background: ${SIDEBAR_THEME.surface}; border: 1px solid ${SIDEBAR_THEME.border}; transition: all 0.2s ease;`
    },
    [
      createElement(
        'span',
        {
          style: `width: 28px; height: 28px; flex: 0 0 28px; box-shadow: 0 2px 8px ${SIDEBAR_THEME.focusShadow}; background: ${SIDEBAR_THEME.accentGradient}; border-radius: 50%; display: flex; align-items: center; justify-content: center;`
        },
        [createSvgIcon(pathD)]
      ),
      createElement('div', { style: 'min-width: 0;' }, [
        createElement(
          'h3',
          {
            style: `font-size: 18px; font-weight: 700; margin: 0 0 1px 0; color: ${SIDEBAR_THEME.text};`
          },
          [createElement('span', { id })]
        ),
        createElement('span', {
          text: label,
          style: `display: block; color: ${SIDEBAR_THEME.textMuted}; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
        })
      ])
    ]
  );

const createCounterLogs = () =>
  createElement('div', { style: 'margin: 16px 12px 12px 12px; display: flex; gap: 8px;' }, [
    createCounterCard({
      id: 'likeCount',
      label: 'Liked',
      pathD:
        'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
    }),
    createCounterCard({
      id: 'deslikeCount',
      label: 'Desliked',
      pathD:
        'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19z'
    })
  ]);

const getDefaultMessage = () => {
  const storedMessage = getJsonSetting('MessengerDefault');
  if (storedMessage) return storedMessage;
  setJsonSetting('MessengerDefault', DEFAULT_MESSAGE);
  return DEFAULT_MESSAGE;
};

const createAutopilot = () =>
  createElement('div', { className: 'Mt(20px)--ml Mt(16px)--s' }, [
    createSidebarSection({
      id: 'main-settings',
      title: 'Main Settings',
      defaultOpen: true,
      children: [
        createCheckbox('tinderAutopilot', 'Auto like', 'Begin automatically swiping right on all profiles.'),
        createCheckbox(
          'tinderAutopilotHideMine',
          'Only show unanswered messages',
          'Load the messages list, then hide conversations where the last visible reply is yours.'
        ),
        createCheckbox(
          'tinderAutopilotAnonymous',
          'Anonymous Mode',
          'Hide profile pictures so you can take screenshots.'
        )
      ]
    }),
    createSidebarSection({
      id: 'bio-filtering',
      title: 'Bio Filtering',
      defaultOpen: false,
      children: [
        createCheckbox('tinderAutopilotBioFilter', 'Enable Bio Filtering', 'Skip profiles based on bio content.'),
        createTextbox({
          className: 'bioBlacklist',
          placeholder: 'Enter words to avoid (comma separated): trans, onlyfans, premium',
          helpText: 'Profiles containing these words will be skipped automatically.',
          defaultValue: 'trans, onlyfans, premium, cashapp, venmo'
        }),
        createCheckbox(
          'tinderAutopilotGenderFilter',
          'Enable Gender Filtering',
          'Skip profiles based on gender identity.'
        ),
        createTextbox({
          className: 'genderFilter',
          placeholder: 'Enter genders to avoid (comma separated): trans woman, trans man',
          helpText: 'Profiles with these gender identities will be skipped. Leave empty to disable.',
          defaultValue: ''
        })
      ]
    }),
    createSidebarSection({
      id: 'advanced-filtering',
      title: 'Advanced Filtering',
      defaultOpen: false,
      children: [
        createCheckbox(
          'tinderAutopilotAdvancedFilter',
          'Enable Advanced Filtering',
          'Filter profiles by age, distance, and photo count.'
        ),
        createSlider({
          className: 'minAge',
          label: 'Minimum Age',
          helpText: 'Skip profiles below this age.',
          min: 18,
          max: 50,
          defaultValue: 18,
          unit: ' years',
          parentToggle: 'tinderAutopilotAdvancedFilter'
        }),
        createSlider({
          className: 'maxAge',
          label: 'Maximum Age',
          helpText: 'Skip profiles above this age.',
          min: 18,
          max: 99,
          defaultValue: 35,
          unit: ' years',
          parentToggle: 'tinderAutopilotAdvancedFilter'
        }),
        createSlider({
          className: 'maxDistance',
          label: 'Maximum Distance',
          helpText: 'Skip profiles farther than this distance.',
          min: 1,
          max: 100,
          defaultValue: 50,
          unit: ' km',
          parentToggle: 'tinderAutopilotAdvancedFilter'
        }),
        createSlider({
          className: 'minPhotoCount',
          label: 'Minimum Photos',
          helpText: 'Skip profiles with fewer photos.',
          min: 1,
          max: 9,
          defaultValue: 3,
          unit: ' photos',
          parentToggle: 'tinderAutopilotAdvancedFilter'
        })
      ]
    }),
    createSidebarSection({
      id: 'super-like-settings',
      title: 'Super Like Settings',
      defaultOpen: false,
      children: [
        createCheckbox(
          'tinderAutopilotSuperLike',
          'Enable Super Like Automation',
          'Automatically use Super Likes based on strategy (5 per day limit).'
        ),
        createSelectCard({
          id: 'superLikeStrategy',
          label: 'Super Like Strategy',
          storageKey: 'superLikeStrategy',
          defaultValue: 'random',
          options: [
            { value: 'random', text: 'Random (10% chance)' },
            { value: 'verified', text: 'Verified profiles only' },
            { value: 'photos', text: '5+ photos only' },
            { value: 'distance', text: 'Nearby profiles (<=10km)' }
          ]
        }),
        createHelpText('Choose when to automatically use Super Likes. Limited to 5 per day.')
      ]
    })
  ]);

const createAiSettings = () =>
  createElement('div', { className: 'Mt(20px)--ml Mt(16px)--s' }, [
    createSidebarSection({
      id: 'ai-connection',
      title: 'AI Connection',
      defaultOpen: true,
      children: [
        createSelectCard({
          id: AI_PROVIDER_SETTING_KEY,
          label: 'API Type',
          storageKey: AI_PROVIDER_SETTING_KEY,
          defaultValue: DEFAULT_AI_PROVIDER_TYPE,
          options: [
            { value: AI_PROVIDER_TYPES.openAiCompatible, text: 'OpenAI-Compatible' },
            { value: AI_PROVIDER_TYPES.mistral, text: 'Mistral AI' },
            { value: AI_PROVIDER_TYPES.anthropic, text: 'Anthropic' },
            { value: AI_PROVIDER_TYPES.nvidiaNim, text: 'NVIDIA NIM' }
          ]
        }),
        createHelpText(
          'OpenAI-Compatible, Mistral AI, and NVIDIA NIM use chat completions. Anthropic uses the Messages API.'
        ),
        createTextbox({
          className: 'aiApiUrl',
          placeholder: 'https://api.openai.com/v1/chat/completions',
          helpText: 'Shared AI endpoint used by profile filtering and message replies.',
          defaultValue: 'https://api.openai.com/v1/chat/completions',
          type: 'text'
        }),
        createTextbox({
          className: 'aiApiKey',
          placeholder: 'sk-... or your API key',
          helpText:
            'Stored in extension local storage. The field is shared by profile filtering and message replies.',
          defaultValue: '',
          type: 'password'
        }),
        createElement('div', { style: 'margin: 0 12px 12px 12px; display: flex; gap: 8px;' }, [
          createElement('button', {
            id: 'clearAiApiKey',
            text: 'Clear API Key',
            style: `width: 100%; padding: 10px 12px; background: ${SIDEBAR_THEME.surfaceMuted}; color: ${SIDEBAR_THEME.text}; border: 1px solid ${SIDEBAR_THEME.border}; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;`,
            attributes: { type: 'button' }
          }),
          createElement('button', {
            id: 'refreshAiModels',
            text: 'Refresh Models',
            style: `width: 100%; padding: 10px 12px; background: ${SIDEBAR_THEME.accentGradient}; color: ${SIDEBAR_THEME.text}; border: 1px solid ${SIDEBAR_THEME.accentBorder}; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;`,
            attributes: { type: 'button' }
          })
        ]),
        createElement('div', {
          id: 'aiConnectionStatus',
          text: 'Provider ready. Refresh models to load suggestions.',
          style: `margin: 0 16px 12px 16px; padding: 8px 10px; border-radius: 8px; background: ${SIDEBAR_THEME.accentSofter}; border: 1px solid ${SIDEBAR_THEME.accentBorder}; color: ${SIDEBAR_THEME.textMuted}; font-size: 11px; line-height: 1.4; text-align: left;`
        }),
        createAiModelDatalist(),
        createHelpText(
          'Model fields accept manual values. Refresh Models fills suggestions when the provider exposes a compatible /models endpoint.'
        )
      ]
    }),
    createSidebarSection({
      id: 'ai-profile-filtering',
      title: 'AI Profile Filtering',
      defaultOpen: false,
      children: [
        createCheckbox(
          'tinderAutopilotAIProfileFilter',
          'Enable AI Profile Filter',
          'Use an LLM to intelligently decide which profiles to skip.'
        ),
        createTextbox({
          className: 'aiProfileModel',
          placeholder: 'gpt-4o-mini',
          helpText: 'Model used only for profile filtering.',
          defaultValue: DEFAULT_AI_PROFILE_MODEL,
          type: 'text',
          attributes: { list: AI_MODEL_DATALIST_ID }
        }),
        createTextbox({
          className: 'aiFilterRules',
          placeholder: 'Ignore profiles: trans, man, male, couples, onlyfans, commercial...',
          helpText: 'Describe your swipe preferences. The AI will use these rules.',
          defaultValue: 'Ignore profiles that are: trans, man, male, couples, onlyfans, or commercial.',
          textareaSize: 'large'
        }),
        createSelectCard({
          id: 'aiProfileReasoningEffort',
          label: 'Profile Reasoning Effort',
          storageKey: AI_PROFILE_SETTING_KEYS.reasoningEffort,
          defaultValue: DEFAULT_AI_PROFILE_REASONING_EFFORT,
          options: [
            { value: AI_REASONING_EFFORTS.low, text: 'Low - Fast & Cheap' },
            { value: AI_REASONING_EFFORTS.medium, text: 'Medium - Balanced' },
            { value: AI_REASONING_EFFORTS.high, text: 'High - Deep Analysis' }
          ]
        }),
        createHelpText(
          'Controls profile analysis prompt depth and token budget for the profile filter.'
        )
      ]
    }),
    createSidebarSection({
      id: 'ai-message-replies',
      title: 'AI Message Replies',
      defaultOpen: true,
      children: [
        createAiReplyModeSelector(),
        createTextbox({
          className: AI_REPLY_SETTING_KEYS.model,
          placeholder: 'gpt-4o-mini',
          helpText: 'Model used only for AI message replies.',
          defaultValue: DEFAULT_AI_REPLY_MODEL,
          type: 'text',
          attributes: { list: AI_MODEL_DATALIST_ID }
        }),
        createSelectCard({
          id: 'aiReplyCompatibilityMode',
          label: 'JSON / Reasoning Mode',
          storageKey: AI_REPLY_SETTING_KEYS.compatibilityMode,
          defaultValue: DEFAULT_AI_REPLY_COMPATIBILITY_MODE,
          options: [
            { value: AI_REPLY_COMPATIBILITY_MODES.standardJson, text: 'Standard JSON' },
            { value: AI_REPLY_COMPATIBILITY_MODES.reasoningJson, text: 'Reasoning / Thinking' },
            { value: AI_REPLY_COMPATIBILITY_MODES.looseJson, text: 'Loose JSON' }
          ]
        }),
        createSelectCard({
          id: AI_REPLY_SETTING_KEYS.reasoningEffort,
          label: 'Reply Reasoning Effort',
          storageKey: AI_REPLY_SETTING_KEYS.reasoningEffort,
          defaultValue: DEFAULT_AI_REPLY_REASONING_EFFORT,
          options: [
            { value: AI_REPLY_REASONING_EFFORTS.low, text: 'Low' },
            { value: AI_REPLY_REASONING_EFFORTS.medium, text: 'Medium' },
            { value: AI_REPLY_REASONING_EFFORTS.high, text: 'High' }
          ]
        }),
        createHelpText(
          'Reply Reasoning Effort is sent only when JSON / Reasoning Mode is Reasoning / Thinking.'
        )
      ]
    }),
    createSidebarSection({
      id: 'ai-reply-prompt-context',
      title: 'AI Reply Prompt Context',
      defaultOpen: false,
      children: [
        createTextbox({
          helpText:
            'Conversation style only. Do not include contacts, location, owner facts, or examples here.',
          placeholder: 'Example: short, dry humor, direct, mirrors energy, no emojis...',
          className: 'aiReplyTone',
          defaultValue: DEFAULT_AI_REPLY_TONE
        }),
        createTextbox({
          helpText:
            'Owner profile and stable facts the AI may use when relevant. Do not put contact/location details here.',
          placeholder: 'Name, age, work, study, hobbies, relationship goals, personality...',
          className: 'aiReplyUserContext',
          defaultValue: DEFAULT_AI_REPLY_USER_CONTEXT,
          textareaSize: 'large'
        }),
        createTextbox({
          helpText:
            'Real reply examples. Used for style, rhythm, callbacks, and brevity only; not treated as facts.',
          placeholder: 'Match: ...\nOwner: ...',
          className: AI_REPLY_SETTING_KEYS.styleExamples,
          defaultValue: DEFAULT_AI_REPLY_STYLE_EXAMPLES,
          textareaSize: 'large'
        }),
        createTextbox({
          helpText:
            'Contact methods the AI may share only when the match asks or shares theirs first.',
          placeholder: 'Examples: WhatsApp +55..., Telegram @user, Instagram @user...',
          className: 'aiReplyContactInfo',
          defaultValue: DEFAULT_AI_REPLY_CONTACT_INFO
        }),
        createTextbox({
          helpText:
            'Always sent to the AI. The prompt tells it to share this only when the match asks about location.',
          placeholder: 'Examples: city/state, neighborhood, region, meeting area, address...',
          className: 'aiReplyAddressInfo',
          defaultValue: DEFAULT_AI_REPLY_ADDRESS_INFO
        }),
        createTextbox({
          helpText:
            'Extra strict rules for AI replies. These cannot override contact/location disclosure or JSON rules.',
          placeholder: 'Examples: never use emojis; never ask two questions; avoid compliment-bombing...',
          className: AI_REPLY_SETTING_KEYS.hardRules,
          defaultValue: DEFAULT_AI_REPLY_HARD_RULES,
          textareaSize: 'large'
        }),
        createSlider({
          className: 'aiReplyContextWindow',
          label: 'Conversation Context',
          helpText: 'Number of recent messages to send to the AI when generating a reply, up to 60.',
          min: MIN_AI_REPLY_CONTEXT_WINDOW,
          max: MAX_AI_REPLY_CONTEXT_WINDOW,
          defaultValue: DEFAULT_AI_REPLY_CONTEXT_WINDOW,
          unit: ' messages'
        })
      ]
    }),
    createSidebarSection({
      id: 'ai-reply-runtime',
      title: 'AI Reply Runtime',
      defaultOpen: false,
      children: [
        createSlider({
          className: 'aiReplyMaxTokens',
          label: 'Max Tokens',
          helpText:
            'Maximum AI reply completion budget. Common manual values: 4k, 8k, 16k, 32k, 65k tokens.',
          min: MIN_AI_REPLY_MAX_TOKENS,
          max: MAX_AI_REPLY_MAX_TOKENS,
          defaultValue: DEFAULT_AI_REPLY_MAX_TOKENS,
          step: 512,
          unit: ' tokens',
          manualInput: true
        }),
        createSlider({
          className: 'aiReplyDelaySeconds',
          label: 'Delay After Sent Reply',
          helpText: 'Wait time after each AI reply that is actually sent.',
          min: MIN_AI_REPLY_DELAY_SECONDS,
          max: MAX_AI_REPLY_DELAY_SECONDS,
          defaultValue: DEFAULT_AI_REPLY_DELAY_SECONDS,
          unit: ' sec'
        }),
        createSlider({
          className: AI_REPLY_SETTING_KEYS.continuousIntervalMinutes,
          label: 'Continuous Interval',
          helpText: 'Minutes to wait between continuous AI reply cycles.',
          min: MIN_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES,
          max: MAX_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES,
          defaultValue: DEFAULT_AI_REPLY_CONTINUOUS_INTERVAL_MINUTES,
          unit: ' min',
          attributes: { 'data-ai-reply-continuous-control': 'true' }
        }),
        createSlider({
          className: AI_REPLY_SETTING_KEYS.continuousMaxSentPerCycle,
          label: 'Max Replies Per Cycle',
          helpText: 'Maximum AI replies to send before a continuous cycle pauses.',
          min: MIN_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE,
          max: MAX_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE,
          defaultValue: DEFAULT_AI_REPLY_CONTINUOUS_MAX_SENT_PER_CYCLE,
          unit: ' replies',
          attributes: { 'data-ai-reply-continuous-control': 'true' }
        }),
        createSlider({
          className: AI_REPLY_SETTING_KEYS.continuousMaxPerMatchPerDay,
          label: 'Max Replies Per Match / Day',
          helpText: 'Continuous mode stops replying to the same match after this daily limit.',
          min: MIN_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY,
          max: MAX_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY,
          defaultValue: DEFAULT_AI_REPLY_CONTINUOUS_MAX_PER_MATCH_PER_DAY,
          unit: ' replies',
          attributes: { 'data-ai-reply-continuous-control': 'true' }
        }),
        createHelpText('Continuous-only controls are enabled only while Continuous mode is selected.')
      ]
    }),
    createSidebarSection({
      id: 'ai-reply-testing',
      title: 'AI Reply Testing',
      defaultOpen: false,
      children: [
        createTextbox({
          helpText:
            'Paste a test conversation using USER: and MATCH: lines. Preview/Test never sends a Tinder message.',
          placeholder: 'MATCH: oi\nUSER: opa\nMATCH: tudo bem?',
          className: 'aiReplyTestConversation',
          defaultValue: '',
          textareaSize: 'large'
        }),
        createTextbox({
          helpText: 'Optional match name used only for the preview/test prompt.',
          placeholder: 'Ana',
          className: 'aiReplyTestMatchName',
          defaultValue: '',
          type: 'text'
        }),
        createElement('div', { style: 'margin: 0 12px 12px 12px; display: flex; gap: 8px;' }, [
          createElement('button', {
            id: 'previewAiReplyPrompt',
            text: 'Preview Prompt',
            style: `width: 100%; padding: 10px 12px; background: ${SIDEBAR_THEME.surfaceMuted}; color: ${SIDEBAR_THEME.text}; border: 1px solid ${SIDEBAR_THEME.border}; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;`,
            attributes: { type: 'button' }
          }),
          createElement('button', {
            id: 'testAiReply',
            text: 'Test Reply',
            style: `width: 100%; padding: 10px 12px; background: ${SIDEBAR_THEME.accentGradient}; color: ${SIDEBAR_THEME.text}; border: 1px solid ${SIDEBAR_THEME.accentBorder}; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;`,
            attributes: { type: 'button' }
          })
        ]),
        createTextbox({
          helpText: 'Preview or test output. This is never sent automatically.',
          placeholder: 'Preview/test output appears here.',
          className: 'aiReplyTestOutput',
          defaultValue: '',
          attributes: { readonly: 'true' },
          textareaSize: 'output'
        })
      ]
    })
  ]);

const createMassMessage = () =>
  createElement('div', { className: 'Mt(20px)--ml Mt(16px)--s' }, [
    createSidebarSection({
      id: 'messaging-settings',
      title: 'Messaging Settings',
      defaultOpen: true,
      children: [
        createCheckbox('tinderAutopilotMessage', 'Auto message'),
        createCheckbox('tinderAutopilotMessageNewOnly', 'New matches only'),
        createTextbox({
          helpText: 'The message to send to matches.',
          placeholder: 'Your message to send',
          className: 'messageToSend',
          defaultValue: getDefaultMessage()
        })
      ]
    })
  ]);

const createLoggerHeader = () =>
  createElement('div', { style: 'margin-top: 16px;' }, [createTitle('Activity')]);

const createInfoBanner = () =>
  createElement('div', {
    id: 'infoBanner',
    style: `overflow: hidden; background: ${SIDEBAR_THEME.background}; position: relative; height: 100%; z-index: 9999; border-right: 1px solid ${SIDEBAR_THEME.border};`
  });

export {
  onToggle,
  onToggleInner,
  offToggle,
  offToggleInner,
  createElement,
  createTopBanner,
  createCounterLogs,
  createAutopilot,
  createAiSettings,
  createMassMessage,
  createLoggerHeader,
  createInfoBanner
};
