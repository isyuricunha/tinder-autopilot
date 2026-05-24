const ACTION_CONFIG = {
  like: {
    includeText: ['like'],
    includeClasses: ['sparks-like'],
    excludeText: ['super like', 'first impressions', 'boost', 'nope', 'rewind'],
    excludeClasses: ['sparks-super-like', 'sparks-boost', 'sparks-nope', 'sparks-rewind']
  },
  nope: {
    includeText: ['nope', 'pass', 'dislike'],
    includeClasses: ['sparks-nope'],
    excludeText: ['like', 'super like', 'boost', 'rewind'],
    excludeClasses: ['sparks-like', 'sparks-super-like', 'sparks-boost', 'sparks-rewind']
  },
  superLike: {
    includeText: ['super like'],
    includeClasses: ['sparks-super-like'],
    excludeText: ['first impressions', 'boost', 'nope', 'rewind'],
    excludeClasses: ['sparks-boost', 'sparks-nope', 'sparks-rewind']
  }
};

const HIDDEN_DIALOG_CLASS_MARKERS = ['V(h)', 'TranslateY(100%)'];
const AUTOPILOT_SIDEBAR_ID = 'infoBanner';
const AUTOPILOT_CLASS_MARKER = 'tinderAutopilot';

const normalizeDomText = (value) =>
  String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const getElements = (root, selector) => {
  try {
    return Array.from(root?.querySelectorAll?.(selector) || []);
  } catch {
    return [];
  }
};

const getFirstElement = (root, selector) => getElements(root, selector)[0] || null;

const getClassText = (element) => {
  const className = element?.getAttribute?.('class') || element?.className || '';
  if (typeof className === 'string') return className;
  return className?.baseVal || '';
};

const getControlText = (element) =>
  [
    element?.textContent,
    element?.getAttribute?.('aria-label'),
    element?.getAttribute?.('title'),
    element?.getAttribute?.('data-testid')
  ]
    .map(normalizeDomText)
    .filter(Boolean)
    .join(' ');

const isVisibleElement = (element) => {
  if (!element || element.disabled) return false;
  if (element.getAttribute?.('aria-hidden') === 'true') return false;
  if (element.offsetParent === null) return false;
  return true;
};

const getActionCandidates = (root) =>
  getElements(root, 'button, [role="button"]').filter(isVisibleElement);

const textIncludesAny = (text, values) => values.some((value) => text.includes(value));

const classIncludesAny = (classText, values) => values.some((value) => classText.includes(value));

const hasHiddenActionAncestor = (element) => {
  let current = element;

  while (current?.getAttribute) {
    if (current.getAttribute('aria-hidden') === 'true' || current.hasAttribute?.('inert')) {
      return true;
    }
    current = current.parentElement;
  }

  return false;
};

const hasAutopilotActionAncestor = (element) => {
  let current = element;

  while (current?.getAttribute) {
    if (current.getAttribute('id') === AUTOPILOT_SIDEBAR_ID) return true;
    if (getClassText(current).includes(AUTOPILOT_CLASS_MARKER)) return true;
    current = current.parentElement;
  }

  return false;
};

const isActionButton = (button, action) => {
  const config = ACTION_CONFIG[action];
  if (!config || !isVisibleElement(button)) return false;
  if (hasHiddenActionAncestor(button)) return false;
  if (hasAutopilotActionAncestor(button)) return false;

  const text = getControlText(button);
  const classText = getClassText(button).toLowerCase();

  if (textIncludesAny(text, config.excludeText)) return false;
  if (classIncludesAny(classText, config.excludeClasses)) return false;

  return (
    textIncludesAny(text, config.includeText) || classIncludesAny(classText, config.includeClasses)
  );
};

const findActionButton = (root, action) =>
  getActionCandidates(root).find((button) => isActionButton(button, action)) || null;

const findLikeButton = (root = document) => findActionButton(root, 'like');

const findDislikeButton = (root = document) => findActionButton(root, 'nope');

const findSuperLikeButton = (root = document) => findActionButton(root, 'superLike');

const findOpenProfileButton = (root = document) =>
  getActionCandidates(root).find((button) => getControlText(button).includes('open profile')) || null;

const findProfileBackButton = (root = document) =>
  getFirstElement(root, '[data-testid="profileBackButton"]') ||
  getActionCandidates(root).find((control) => {
    const text = getControlText(control);
    return text === 'back' || text.includes('back to explore') || text.includes('back to tinder');
  }) ||
  null;

const isHiddenTinderDialog = (dialog) => {
  const classText = getClassText(dialog);
  return HIDDEN_DIALOG_CLASS_MARKERS.some((marker) => classText.includes(marker));
};

const isVisibleDialog = (dialog) => isVisibleElement(dialog) && !isHiddenTinderDialog(dialog);

const getDialogType = (dialog) => {
  if (!dialog) return null;
  if (isHiddenTinderDialog(dialog)) return 'hidden';

  const text = getControlText(dialog);
  if (text.includes('upgrade your like') || (text.includes('send super like') && text.includes('no thanks'))) {
    return 'superLikeUpsell';
  }
  if (text.includes("it's a match") || text.includes('back to tinder')) {
    return 'matchFound';
  }
  if (text.includes('add to home screen')) {
    return 'addToHomeScreen';
  }

  return 'unknown';
};

const findVisibleDialog = (root = document) =>
  getElements(root, '[role="dialog"]').find(isVisibleDialog) || null;

const classifyVisibleDialog = (root = document) => getDialogType(findVisibleDialog(root));

module.exports = {
  classifyVisibleDialog,
  findActionButton,
  findDislikeButton,
  findLikeButton,
  findOpenProfileButton,
  findProfileBackButton,
  findSuperLikeButton,
  findVisibleDialog,
  getDialogType,
  isActionButton,
  isHiddenTinderDialog,
  isVisibleDialog,
  normalizeDomText
};
