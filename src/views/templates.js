let defaultMessage = `Hey {name}, this is an automated message to remind you of your upcoming "Netflix and Chill" appointment in the next week. To confirm your appointment text YES DADDY. To unsubscribe, please text WRONG HOLE. Standard text and bill rates do apply. Thanks for choosing Slide N Yo DMs`;

const msg = JSON.parse(localStorage.getItem('TinderAutopilot/MessengerDefault'));
if (msg) {
  defaultMessage = msg;
} else {
  localStorage.setItem('TinderAutopilot/MessengerDefault', JSON.stringify(defaultMessage));
}

const onToggle = `display: flex; align-items: center; justify-content: center; border-radius: 20px; width: 56px; height: 32px; border: none; transition: all 0.3s ease; border: 2px solid #ff6b35; background: linear-gradient(135deg, #ff6b35, #ff8c42); box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3)`;
const onToggleInner = `border-radius: 50%; background: #000000; border: 2px solid #ff6b35; width: 24px; height: 24px; transition: all 0.3s ease; transform: translateX(12px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3)`;

const offToggle = `display: flex; align-items: center; justify-content: center; border-radius: 20px; width: 56px; height: 32px; border: none; transition: all 0.3s ease; border: 2px solid #333333; background: #1a1a1a; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2)`;
const offToggleInner = `border-radius: 50%; background: #000000; border: 2px solid #333333; width: 24px; height: 24px; transition: all 0.3s ease; transform: translateX(-12px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3)`;

const topBanner = `
<div style="position: relative; z-index: 2; transition: all 0.3s ease; text-align: center; background: linear-gradient(135deg, #ff6b35, #ff8c42); border-radius: 0 0 24px 24px; padding: 16px 8px; box-shadow: 0 8px 32px rgba(255, 107, 53, 0.2); min-height: 60px; display: flex; align-items: center; justify-content: center;">
  <a style="display: flex; align-items: center; color: #000000; font-weight: 700; font-size: 18px; text-decoration: none; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); white-space: nowrap; overflow: hidden;" href="/app/profile">
    <span style="display: flex; align-items: center; gap: 6px;">🔥 <span>Autopilot</span></span>
  </a>
</div>
`;

// Similarmente, ajuste outras seções do código que podem impactar a cor do texto.

const titleGenerator = (title) =>
  `<h2 style="color: #ff6b35; padding: 16px 20px 12px 20px; letter-spacing: 1px; text-transform: uppercase; margin: 24px 0 0 0; font-size: 14px; font-weight: 600; border-left: 4px solid #ff6b35; background: rgba(255, 107, 53, 0.05); border-radius: 0 12px 12px 0;">${title}</h2>`;

const textboxGenerator = ({ className, placeholder, helpText, defaultValue }) => `
<div style="background: #000000; border: 1px solid #333333; border-radius: 16px; margin: 8px 12px; overflow: hidden; transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);">
    <div style="background: #000000; border: none; transition: all 0.3s ease; position: relative;">
        <label style="display: block; padding: 12px; cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: center;"></div>
            <div style="position: relative; width: 100%;">
                <textarea style="width: calc(100% - 32px); display: block; border: none; background: #1a1a1a; color: #ffffff; padding: 12px; border-radius: 12px; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; resize: vertical; min-height: 60px; max-height: 120px; transition: all 0.3s ease; box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);" id="${className}" placeholder="${placeholder}">${defaultValue}</textarea>
            </div>
        </label>
    </div>
</div>
${
  helpText &&
  `<div style="margin: 4px 16px 12px 16px; padding: 0; letter-spacing: 0; font-weight: 400; color: #888888; font-size: 11px; text-align: left; line-height: 1.4;">${helpText}</div>`
}
`;

const checkboxGenerator = (className, label, helpText = '') => `
<div style="background: #000000; border: 1px solid #333333; border-radius: 16px; margin: 8px 12px; overflow: hidden; transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);">
    <div style="background: #000000; border: none; transition: all 0.3s ease; position: relative;">
        <label style="display: block; padding: 16px; cursor: pointer;">
            <a href="#" class="${className}" style="display: block; text-decoration: none; color: inherit;" title="Click to toggle">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                    <div style="flex: 1; overflow: hidden; padding: 0; color: #ffffff; font-size: 15px; font-weight: 500; line-height: 1.3;"><span>${label}</span></div>
                    <div style="position: relative; flex-shrink: 0;">
                        <div style="cursor: pointer; pointer-events: none;">
                            <input style="position: absolute; width: 100%; height: 100%; opacity: 0; pointer-events: none; cursor: pointer;" name="${className}" type="checkbox">
                            <div style="${offToggle}"><div style="${offToggleInner}"></div></div>
                        </div>
                    </div>
                </div>
            </a>
        </label>
    </div>
</div>
${
  helpText &&
  `<div style="margin: 4px 16px 12px 16px; padding: 0; letter-spacing: 0; font-weight: 400; color: #888888; font-size: 11px; text-align: left; line-height: 1.4;">${helpText}</div>`
}
`;

const sliderGenerator = ({ className, label, helpText, min, max, defaultValue, step = 1, unit = '' }) => `
<div style="background: #000000; border: 1px solid #333333; border-radius: 16px; margin: 8px 12px; overflow: hidden; transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);">
    <div style="background: #000000; border: none; transition: all 0.3s ease; position: relative;">
        <label style="display: block; padding: 16px; cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="color: #ffffff; font-size: 15px; font-weight: 500;">${label}</span>
                <span style="color: #ff6b35; font-size: 14px; font-weight: 600;" id="${className}Value">${defaultValue}${unit}</span>
            </div>
            <div style="position: relative; width: 100%;">
                <input type="range" id="${className}" min="${min}" max="${max}" value="${defaultValue}" step="${step}" 
                       style="width: 100%; height: 6px; border-radius: 3px; background: #333333; outline: none; -webkit-appearance: none; appearance: none;"
                       oninput="document.getElementById('${className}Value').textContent = this.value + '${unit}'; localStorage.setItem('TinderAutopilot/${className}', this.value);">
                <style>
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
                </style>
            </div>
        </label>
    </div>
</div>
${helpText && `<div style="margin: 4px 16px 12px 16px; padding: 0; letter-spacing: 0; font-weight: 400; color: #888888; font-size: 11px; text-align: left; line-height: 1.4;">${helpText}</div>`}
`;

const autopilot = `
    <div class="Mt(20px)--ml Mt(16px)--s">
        ${titleGenerator('Main Settings')}
        ${checkboxGenerator(
          'tinderAutopilot',
          'Auto like',
          'Begin automatically swiping right on all profiles.'
        )}
        ${sliderGenerator({
          className: 'likeInterval',
          label: 'Like Interval',
          helpText: 'Time between each like in seconds.',
          min: 1,
          max: 10,
          defaultValue: 3,
          unit: 's'
        })}
        ${checkboxGenerator(
          'tinderAutopilotHideMine',
          'Only show unanswered messages',
          'Useful if you just sent an auto message to a ton of people and only want to see the ones that responded.'
        )}
        ${checkboxGenerator(
          'tinderAutopilotAnonymous',
          'Anonymous Mode',
          'Hide profile pictures so you can take screenshots.'
        )}
        ${titleGenerator('Bio Filtering')}
        ${checkboxGenerator(
          'tinderAutopilotBioFilter',
          'Enable Bio Filtering',
          'Skip profiles based on bio content.'
        )}
        ${textboxGenerator({
          className: 'bioBlacklist',
          placeholder: 'Enter words to avoid (comma separated): trans, onlyfans, premium',
          helpText: 'Profiles containing these words will be skipped automatically.',
          defaultValue: 'trans, onlyfans, premium, cashapp, venmo'
        })}
  </div>
`;

const massMessage = `
<div class="Mt(20px)--ml Mt(16px)--s">
${titleGenerator('Messaging Settings')}
${checkboxGenerator('tinderAutopilotMessage', 'Auto message')}
${checkboxGenerator('tinderAutopilotMessageNewOnly', 'New matches only')}
${textboxGenerator({
  helpText: 'The message to send to matches.',
  placeholder: 'Your message to send',
  className: 'messageToSend',
  defaultValue: defaultMessage
})}
</div>
`;

const loggerHeader = `<div style="margin-top: 16px;">${titleGenerator('Activity')}</div>`;

const counterLogs = (likeCount, matchCount) => `
<div style="margin: 32px 12px 24px 12px; display: flex; gap: 8px;">
<div style="position: relative; padding: 32px 16px 20px 16px; flex: 1; text-align: center; border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3); cursor: pointer; background: linear-gradient(135deg, #1a1a1a, #000000); border: 1px solid #333333; transition: all 0.3s ease;">
  <div style="position: absolute; left: 50%; top: -20px; transform: translateX(-50%);">
      <span style="width: 40px; height: 40px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3); background: linear-gradient(135deg, #ff6b35, #ff8c42); border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
        <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#000000"/>
        </svg>
      </span>
  </div>
  <div style="margin-top: 8px;">
      <h3 style="font-size: 20px; font-weight: 700; margin: 4px 0 2px 0; color: #ffffff;"><span id="likeCount">${likeCount}</span></h3>
      <span style="color: #ff6b35; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Liked</span>
  </div>
</div>
<div style="position: relative; padding: 32px 16px 20px 16px; flex: 1; text-align: center; border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3); cursor: pointer; background: linear-gradient(135deg, #1a1a1a, #000000); border: 1px solid #333333; transition: all 0.3s ease;">
  <div style="position: absolute; left: 50%; top: -20px; transform: translateX(-50%);">
      <span style="width: 40px; height: 40px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3); background: linear-gradient(135deg, #ff6b35, #ff8c42); border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
        <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#000000"/>
        </svg>
      </span>
  </div>
  <div style="margin-top: 8px;">
      <h3 style="font-size: 20px; font-weight: 700; margin: 4px 0 2px 0; color: #ffffff;"><span id="matchCount">${matchCount}</span></h3>
      <span style="color: #ff6b35; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Matched</span>
  </div>
</div>
</div>
`;

const infoBanner = `<div id="infoBanner" style="overflow: hidden; background: #000000; position: relative; height: 100%; z-index: 9999; border-right: 1px solid #333333;"></div>`;

export {
  topBanner,
  autopilot,
  infoBanner,
  massMessage,
  loggerHeader,
  counterLogs,
  offToggle,
  offToggleInner,
  onToggle,
  onToggleInner
};
