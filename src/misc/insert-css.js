const STYLE_ID_PREFIX = 'TinderAutopilot-insert-css';
const usage =
  'insert-css: You need to provide a CSS string. Usage: insertCss(cssString[, options]).';

const normalizeOptions = (options = {}) => (typeof options === 'string' ? { id: options } : options);

const styleElementId = (id = 'default') => {
  const normalizedId = String(id);
  return normalizedId.startsWith(STYLE_ID_PREFIX)
    ? normalizedId
    : `${STYLE_ID_PREFIX}-${normalizedId}`;
};

function removeCss(options = {}) {
  const { id } = normalizeOptions(options);
  const styleElement = document.getElementById(styleElementId(id));
  if (styleElement) styleElement.remove();
}

function insertCss(css, options = {}) {
  const normalizedOptions = normalizeOptions(options);

  if (css === undefined) {
    throw new Error(usage);
  }

  const position = normalizedOptions.prepend === true ? 'prepend' : 'append';
  const container =
    normalizedOptions.container !== undefined
      ? normalizedOptions.container
      : document.querySelector('head');

  if (!container) {
    throw new Error('insert-css: Could not find a container for the style element.');
  }

  const id = styleElementId(normalizedOptions.id);
  removeCss({ id });
  const styleElement = createStyleElement(id);

  if (position === 'prepend') {
    container.insertBefore(styleElement, container.childNodes[0]);
  } else {
    container.appendChild(styleElement);
  }

  // strip potential UTF-8 BOM if css was read from a file
  if (css.charCodeAt(0) === 0xfeff) {
    css = css.substr(1, css.length);
  }

  // actually add the stylesheet
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText += css;
  } else {
    styleElement.textContent += css;
  }

  return styleElement;
}

function createStyleElement(id) {
  const styleElement = document.createElement('style');
  styleElement.id = id;
  styleElement.setAttribute('type', 'text/css');
  return styleElement;
}

module.exports = { insertCss, removeCss };
