const { normalizeDomText } = require('./tinder-dom-detectors');

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

const isProfileBackButton = (element) =>
  isVisibleElement(element) && element.getAttribute?.('data-testid') === 'profileBackButton';

const isNavigationBackControl = (element) => {
  const text = getControlText(element);
  return text.includes('back to explore') || text.includes('back to tinder');
};

const isProfileCloseControl = (element) => {
  if (!isVisibleElement(element) || isNavigationBackControl(element)) return false;
  if (isProfileBackButton(element)) return true;

  const text = getControlText(element);
  return (
    text === 'back' ||
    text === 'close' ||
    text.includes('voltar') ||
    text.includes('fechar')
  );
};

const findProfileCloseControl = (root) =>
  [getFirstElement(root, '[data-testid="profileBackButton"]')]
    .find(isProfileBackButton) ||
  getElements(root, 'button, [role="button"]').find(isProfileCloseControl) ||
  null;

const hasExpandedProfileContent = (root) =>
  getElements(
    root,
    [
      '.Expand.profileContent',
      '.profileContent',
      'div[class*="profileContent"]',
      '.Pos\\(r\\)--ml.Z\\(1\\).Bgc\\(\\$c-ds-background-primary\\).Ov\\(h\\).Expand.profileContent'
    ].join(',')
  ).some((element) => {
    if (!isVisibleElement(element)) return false;

    const classText = getClassText(element);
    const hasProfileClass = classText.includes('profileContent');
    const hasSubstantialText = String(element.textContent || '').trim().length > 50;
    return hasProfileClass && hasSubstantialText;
  });

const hasHiddenCardStack = (root) => {
  const cardStack = getFirstElement(root, '.recsCardboard__cardsContainer');
  if (!cardStack) return false;

  const style = cardStack.style || {};
  return style.display === 'none' || style.visibility === 'hidden';
};

const isProfileLocation = (locationValue) => {
  const pathname = String(locationValue?.pathname || '');
  const search = String(locationValue?.search || '');
  return pathname.includes('/profile') || search.includes('profile=');
};

const isProfileModalOpen = (root, locationValue) =>
  Boolean(
    isProfileBackButton(getFirstElement(root, '[data-testid="profileBackButton"]')) ||
    hasExpandedProfileContent(root) ||
    hasHiddenCardStack(root) ||
    isProfileLocation(locationValue)
  );

module.exports = {
  findProfileCloseControl,
  getControlText,
  hasExpandedProfileContent,
  isNavigationBackControl,
  isProfileCloseControl,
  isProfileModalOpen
};
