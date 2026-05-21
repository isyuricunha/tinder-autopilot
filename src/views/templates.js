import { getJsonSetting, setJsonSetting, setSetting } from '../misc/settings-store';
import {
  DEFAULT_AI_REPLY_CONTEXT_WINDOW,
  DEFAULT_AI_REPLY_TONE,
  DEFAULT_AI_REPLY_USER_CONTEXT,
  MAX_AI_REPLY_CONTEXT_WINDOW,
  MIN_AI_REPLY_CONTEXT_WINDOW
} from '../misc/ai-message-reply-settings';
import { onToggle, onToggleInner, offToggle, offToggleInner } from './toggle-styles';

const DEFAULT_MESSAGE =
  'Hey {name}, this is an automated message to remind you of your upcoming "Netflix and Chill" appointment in the next week. To confirm your appointment text YES DADDY. To unsubscribe, please text WRONG HOLE. Standard text and bill rates do apply. Thanks for choosing Slide N Yo DMs';

const SVG_NS = 'http://www.w3.org/2000/svg';

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
  path.setAttribute('fill', '#000000');
  svg.appendChild(path);

  return svg;
};

const createHelpText = (helpText) => {
  if (!helpText) return null;

  return createElement('div', {
    text: helpText,
    style:
      'margin: 4px 16px 12px 16px; padding: 0; letter-spacing: 0; font-weight: 400; color: #888888; font-size: 11px; text-align: left; line-height: 1.4;'
  });
};

const createCard = (children) =>
  createElement(
    'div',
    {
      style:
        'background: #000000; border: 1px solid #333333; border-radius: 16px; margin: 8px 12px; overflow: hidden; transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);'
    },
    [
      createElement(
        'div',
        {
          style: 'background: #000000; border: none; transition: all 0.3s ease; position: relative;'
        },
        children
      )
    ]
  );

const createTopBanner = () =>
  createElement(
    'div',
    {
      style:
        'position: relative; z-index: 2; transition: all 0.3s ease; text-align: center; background: linear-gradient(135deg, #ff6b35, #ff8c42); border-radius: 0 0 24px 24px; padding: 16px 8px; box-shadow: 0 8px 32px rgba(255, 107, 53, 0.2); min-height: 60px; display: flex; align-items: center; justify-content: center;'
    },
    [
      createElement(
        'a',
        {
          style:
            'display: flex; align-items: center; color: #000000; font-weight: 700; font-size: 18px; text-decoration: none; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); white-space: nowrap; overflow: hidden;',
          attributes: { href: '/app/profile' }
        },
        [
          createElement(
            'span',
            { style: 'display: flex; align-items: center; gap: 6px;' },
            ['🔥 ', createElement('span', { text: 'Autopilot' })]
          )
        ]
      )
    ]
  );

const createTitle = (title) =>
  createElement('h2', {
    text: title,
    style:
      'color: #ff6b35; padding: 16px 20px 12px 20px; letter-spacing: 1px; text-transform: uppercase; margin: 24px 0 0 0; font-size: 14px; font-weight: 600; border-left: 4px solid #ff6b35; background: rgba(255, 107, 53, 0.05); border-radius: 0 12px 12px 0;'
  });

const createTextbox = ({ className, placeholder, helpText, defaultValue, type = 'textarea' }) => {
  const fieldStyle =
    "width: calc(100% - 32px); display: block; border: none; background: #1a1a1a; color: #ffffff; padding: 12px; border-radius: 12px; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; transition: all 0.3s ease; box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);";
  const field =
    type === 'password'
      ? createElement('input', {
          id: className,
          style: fieldStyle,
          attributes: { type: 'password', autocomplete: 'off', placeholder, value: defaultValue }
        })
      : createElement('textarea', {
          id: className,
          text: defaultValue,
          style: `${fieldStyle} resize: vertical; min-height: 60px; max-height: 120px;`,
          attributes: { placeholder }
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
                      style:
                        'flex: 1; overflow: hidden; padding: 0; color: #ffffff; font-size: 15px; font-weight: 500; line-height: 1.3;'
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
        background: linear-gradient(135deg, #ff6b35, #ff8c42);
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
      }
      #${className}::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff6b35, #ff8c42);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
      }
      #${className}:disabled::-webkit-slider-thumb {
        background: #555555;
        cursor: not-allowed;
      }
      #${className}:disabled::-moz-range-thumb {
        background: #555555;
        cursor: not-allowed;
      }
      #${className}:disabled {
        background: #222222;
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
  parentToggle = null
}) => {
  const valueDisplay = createElement('span', {
    id: `${className}Value`,
    text: `${defaultValue}${unit}`,
    style: 'color: #ff6b35; font-size: 14px; font-weight: 600;'
  });
  const input = createElement('input', {
    id: className,
    style:
      'width: 100%; height: 6px; border-radius: 3px; background: #333333; outline: none; -webkit-appearance: none; appearance: none;',
    attributes: { type: 'range', min, max, value: defaultValue, step }
  });
  const syncValue = () => {
    valueDisplay.textContent = `${input.value}${unit}`;
    setSetting(className, input.value);
  };
  input.addEventListener('input', syncValue);
  input.addEventListener('change', syncValue);

  return createFragment([
    createElement(
      'div',
      {
        className: 'slider-container',
        style:
          'background: #000000; border: 1px solid #333333; border-radius: 16px; margin: 8px 12px; overflow: hidden; transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);',
        attributes: { 'data-parent': parentToggle || '' }
      },
      [
        createElement(
          'div',
          {
            style:
              'background: #000000; border: none; transition: all 0.3s ease; position: relative;'
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
                      style: 'color: #ffffff; font-size: 15px; font-weight: 500;'
                    }),
                    valueDisplay
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
    style:
      'width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid #333333; border-radius: 8px; color: #ffffff; font-size: 14px;'
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
        style:
          'color: #ffffff; font-size: 15px; font-weight: 500; margin-bottom: 12px; display: block;'
      }),
      select
    ])
  ]);
};

const createCounterCard = ({ id, label, pathD }) =>
  createElement(
    'div',
    {
      style:
        'position: relative; padding: 32px 16px 20px 16px; flex: 1; text-align: center; border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3); cursor: pointer; background: linear-gradient(135deg, #1a1a1a, #000000); border: 1px solid #333333; transition: all 0.3s ease;'
    },
    [
      createElement(
        'div',
        { style: 'position: absolute; left: 50%; top: -20px; transform: translateX(-50%);' },
        [
          createElement(
            'span',
            {
              style:
                'width: 40px; height: 40px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3); background: linear-gradient(135deg, #ff6b35, #ff8c42); border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; margin: 0 auto;'
            },
            [createSvgIcon(pathD)]
          )
        ]
      ),
      createElement('div', { style: 'margin-top: 8px;' }, [
        createElement(
          'h3',
          { style: 'font-size: 20px; font-weight: 700; margin: 4px 0 2px 0; color: #ffffff;' },
          [createElement('span', { id })]
        ),
        createElement('span', {
          text: label,
          style:
            'color: #ff6b35; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;'
        })
      ])
    ]
  );

const createCounterLogs = () =>
  createElement('div', { style: 'margin: 32px 12px 24px 12px; display: flex; gap: 8px;' }, [
    createCounterCard({
      id: 'likeCount',
      label: 'Liked',
      pathD:
        'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
    }),
    createCounterCard({
      id: 'matchCount',
      label: 'Matched',
      pathD:
        'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
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
    createTitle('Main Settings'),
    createCheckbox('tinderAutopilot', 'Auto like', 'Begin automatically swiping right on all profiles.'),
    createCheckbox(
      'tinderAutopilotHideMine',
      'Only show unanswered messages',
      'Useful if you just sent an auto message to a ton of people and only want to see the ones that responded.'
    ),
    createCheckbox('tinderAutopilotAnonymous', 'Anonymous Mode', 'Hide profile pictures so you can take screenshots.'),
    createTitle('Bio Filtering'),
    createCheckbox('tinderAutopilotBioFilter', 'Enable Bio Filtering', 'Skip profiles based on bio content.'),
    createTextbox({
      className: 'bioBlacklist',
      placeholder: 'Enter words to avoid (comma separated): trans, onlyfans, premium',
      helpText: 'Profiles containing these words will be skipped automatically.',
      defaultValue: 'trans, onlyfans, premium, cashapp, venmo'
    }),
    createCheckbox('tinderAutopilotGenderFilter', 'Enable Gender Filtering', 'Skip profiles based on gender identity.'),
    createTextbox({
      className: 'genderFilter',
      placeholder: 'Enter genders to avoid (comma separated): trans woman, trans man',
      helpText: 'Profiles with these gender identities will be skipped. Leave empty to disable.',
      defaultValue: ''
    }),
    createTitle('Advanced Filtering'),
    createCheckbox('tinderAutopilotAdvancedFilter', 'Enable Advanced Filtering', 'Filter profiles by age, distance, and photo count.'),
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
    }),
    createTitle('Super Like Settings'),
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
        { value: 'distance', text: 'Nearby profiles (≤10km)' }
      ]
    }),
    createHelpText('Choose when to automatically use Super Likes. Limited to 5 per day.'),
    createTitle('AI Profile Filtering'),
    createCheckbox(
      'tinderAutopilotAIProfileFilter',
      'Enable AI Profile Filter',
      'Use an LLM to intelligently decide which profiles to skip.'
    ),
    createTextbox({
      className: 'aiApiUrl',
      placeholder: 'https://api.openai.com/v1/chat/completions',
      helpText: 'OpenAI-compatible API endpoint. Required for AI filtering.',
      defaultValue: 'https://api.openai.com/v1/chat/completions'
    }),
    createTextbox({
      className: 'aiApiKey',
      placeholder: 'sk-... or your API key',
      helpText:
        'Stored in extension local storage. Content scripts can still access extension settings.',
      defaultValue: '',
      type: 'password'
    }),
    createElement('div', { style: 'margin: 0 12px 12px 12px; display: flex; gap: 8px;' }, [
      createElement('button', {
        id: 'clearAiApiKey',
        text: 'Clear AI API Key',
        style:
          'width: 100%; padding: 10px 16px; background: #1a1a1a; color: #ffffff; border: 1px solid #333333; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;',
        attributes: { type: 'button' }
      })
    ]),
    createTextbox({
      className: 'aiModel',
      placeholder: 'gpt-4o-mini',
      helpText: 'Model name. e.g. gpt-4o, claude-3-sonnet, llama-3-8b-8192, etc.',
      defaultValue: 'gpt-4o-mini'
    }),
    createTextbox({
      className: 'aiFilterRules',
      placeholder: 'Ignore profiles: trans, man, male, couples, onlyfans, commercial...',
      helpText: 'Describe your swipe preferences. The AI will use these rules.',
      defaultValue: 'Ignore profiles that are: trans, man, male, couples, onlyfans, or commercial.'
    }),
    createSelectCard({
      id: 'aiReasoningEffort',
      label: 'Reasoning Effort',
      storageKey: 'aiReasoningEffort',
      defaultValue: 'medium',
      options: [
        { value: 'low', text: 'Low - Fast & Cheap' },
        { value: 'medium', text: 'Medium - Balanced' },
        { value: 'high', text: 'High - Deep Analysis' }
      ]
    }),
    createHelpText(
      'Controls how much the AI thinks before responding. Low is faster and cheaper. High provides deeper analysis but uses more tokens.'
    )
  ]);

const createMassMessage = () =>
  createElement('div', { className: 'Mt(20px)--ml Mt(16px)--s' }, [
    createTitle('Messaging Settings'),
    createCheckbox('tinderAutopilotMessage', 'Auto message'),
    createCheckbox('tinderAutopilotMessageNewOnly', 'New matches only'),
    createTextbox({
      helpText: 'The message to send to matches.',
      placeholder: 'Your message to send',
      className: 'messageToSend',
      defaultValue: getDefaultMessage()
    }),
    createTitle('AI Message Replies'),
    createTextbox({
      helpText: 'Conversation style for AI-generated replies.',
      placeholder: 'Short, warm, playful, direct, Brazilian Portuguese...',
      className: 'aiReplyTone',
      defaultValue: DEFAULT_AI_REPLY_TONE
    }),
    createTextbox({
      helpText: 'Useful personal context the AI can safely use in replies.',
      placeholder: 'Examples: city, schedule, interests, date preferences, boundaries...',
      className: 'aiReplyUserContext',
      defaultValue: DEFAULT_AI_REPLY_USER_CONTEXT
    }),
    createSlider({
      className: 'aiReplyContextWindow',
      label: 'Conversation Context',
      helpText: 'Number of recent messages to send to the AI when generating a reply.',
      min: MIN_AI_REPLY_CONTEXT_WINDOW,
      max: MAX_AI_REPLY_CONTEXT_WINDOW,
      defaultValue: DEFAULT_AI_REPLY_CONTEXT_WINDOW,
      unit: ' messages'
    })
  ]);

const createLoggerHeader = () =>
  createElement('div', { style: 'margin-top: 16px;' }, [createTitle('Activity')]);

const createInfoBanner = () =>
  createElement('div', {
    id: 'infoBanner',
    style:
      'overflow: hidden; background: #000000; position: relative; height: 100%; z-index: 9999; border-right: 1px solid #333333;'
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
  createMassMessage,
  createLoggerHeader,
  createInfoBanner
};
