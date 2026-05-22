const ACTIVE_CARD_SELECTOR = '[data-keyboard-gamepad="true"][aria-hidden="false"]';

const CARD_SELECTORS = [
  ACTIVE_CARD_SELECTOR,
  '[data-keyboard-gamepad="true"]',
  '[data-testid="card-stack"] [role="tabpanel"]',
  '.recsCardboard__cards > div',
  '.gamepad-card',
  '.profileCard'
];

const PROFILE_CONTENT_SELECTORS = [
  '.Expand.profileContent',
  '.profileContent',
  'div[class*="profileContent"]'
];

const NAME_SELECTORS = ['[itemprop="name"]', 'h1[aria-label*="years"]', 'h1'];
const AGE_SELECTORS = ['[itemprop="age"]', 'h1[aria-label*="years"]'];
const IMAGE_SELECTORS = [
  'img[src]',
  '[role="img"][style*="background-image"]',
  '[style*="background-image"]'
];

const getElements = (root, selector) => {
  try {
    return Array.from(root?.querySelectorAll?.(selector) || []);
  } catch {
    return [];
  }
};

const getAttribute = (element, attribute) => element?.getAttribute?.(attribute) || '';

const hasAttribute = (element, attribute) =>
  Boolean(element?.hasAttribute?.(attribute) || getAttribute(element, attribute) !== '');

const hasHiddenProfileAncestor = (element) => {
  let current = element;

  while (current?.getAttribute) {
    if (getAttribute(current, 'aria-hidden') === 'true' || hasAttribute(current, 'inert')) {
      return true;
    }
    current = current.parentElement;
  }

  return false;
};

const hasVisibleBox = (element) => {
  const rect = element?.getBoundingClientRect?.();
  if (!rect) return true;
  return rect.width > 0 && rect.height > 0;
};

const isVisibleProfileElement = (element) => {
  if (!element || element.disabled) return false;
  if (hasHiddenProfileAncestor(element)) return false;
  if (typeof element.offsetParent !== 'undefined' && element.offsetParent === null) return false;
  return hasVisibleBox(element);
};

const getVisibleElements = (root, selectors) =>
  getElements(root, selectors.join(',')).filter(isVisibleProfileElement);

const getElementArea = (element) => {
  const rect = element?.getBoundingClientRect?.();
  if (!rect) return 0;
  return rect.width * rect.height;
};

const getLargestElement = (elements) =>
  elements.reduce((largest, element) => {
    if (!largest) return element;
    return getElementArea(element) > getElementArea(largest) ? element : largest;
  }, null);

const getExpandedProfileContent = (root = document) =>
  getVisibleElements(root, PROFILE_CONTENT_SELECTORS)[0] || null;

const getActiveProfileCard = (root = document) => {
  const explicitActiveCard = getVisibleElements(root, [ACTIVE_CARD_SELECTOR])[0];
  if (explicitActiveCard) return explicitActiveCard;

  return getLargestElement(getVisibleElements(root, CARD_SELECTORS));
};

const stripHtmlText = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

const parseNameFromYearsLabel = (label) => {
  const match = stripHtmlText(label).match(/^(.+?)\s+\d+\s+years?\b/i);
  return match ? match[1].trim() : '';
};

const parseAgeFromYearsLabel = (label) => {
  const match = stripHtmlText(label).match(/\b(\d+)\s+years?\b/i);
  return match ? match[1] : '';
};

const getProfileNameFromElement = (element) => {
  const yearsLabel = getAttribute(element, 'aria-label');
  const parsedLabelName = parseNameFromYearsLabel(yearsLabel);
  if (parsedLabelName) return parsedLabelName;
  return stripHtmlText(element?.textContent);
};

const getProfileAgeFromElement = (element) => {
  const parsedLabelAge = parseAgeFromYearsLabel(getAttribute(element, 'aria-label'));
  if (parsedLabelAge) return parsedLabelAge;
  return stripHtmlText(element?.textContent);
};

const getFirstVisibleText = (root, selectors, getText) => {
  const element = getVisibleElements(root, selectors).find((candidate) => {
    const text = getText(candidate);
    return text.length > 0;
  });

  return element ? getText(element) : '';
};

const extractBackgroundImageUrl = (element) => {
  const backgroundImage =
    element?.style?.backgroundImage || getAttribute(element, 'style');
  const match = String(backgroundImage).match(/url\(["']?([^"')]+)["']?\)/i);
  return match ? match[1] : '';
};

const getProfileImageId = (root) => {
  const image = getVisibleElements(root, IMAGE_SELECTORS).find((element) => {
    const src = element?.src || getAttribute(element, 'src') || extractBackgroundImageUrl(element);
    return Boolean(src);
  });

  if (!image) return '';
  return image.src || getAttribute(image, 'src') || extractBackgroundImageUrl(image);
};

const getProfileIdentityFromScope = (scope) => {
  if (!scope) return null;

  const name = getFirstVisibleText(scope, NAME_SELECTORS, getProfileNameFromElement);
  if (name) {
    const age = getFirstVisibleText(scope, AGE_SELECTORS, getProfileAgeFromElement);
    return age ? `name:${name}|age:${age}` : `name:${name}`;
  }

  const imageId = getProfileImageId(scope);
  return imageId ? `img:${imageId}` : null;
};

const getProfileIdentity = (root = document) =>
  getProfileIdentityFromScope(getExpandedProfileContent(root)) ||
  getProfileIdentityFromScope(getActiveProfileCard(root)) ||
  getProfileIdentityFromScope(root);

const getActiveProfileSurface = (root = document) =>
  getExpandedProfileContent(root) || getActiveProfileCard(root) || root;

module.exports = {
  getActiveProfileCard,
  getActiveProfileSurface,
  getExpandedProfileContent,
  getProfileIdentity,
  getProfileIdentityFromScope,
  isVisibleProfileElement
};
