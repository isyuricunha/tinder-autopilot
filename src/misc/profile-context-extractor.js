const { isVisibleProfileElement } = require('./profile-identity');

const ABOUT_ME_HEADINGS = ['About me', 'Sobre mim'];
const LOOKING_FOR_HEADINGS = ['Looking for', 'Procurando', 'Buscando'];
const ESSENTIALS_HEADINGS = ['Essentials', 'Essenciais'];
const BASICS_HEADINGS = ['Basics', 'Básico', 'Basico'];
const LIFESTYLE_HEADINGS = ['Lifestyle', 'Estilo de vida'];
const INTERESTS_HEADINGS = ['Interests', 'Interesses'];

const GENDER_VALUES = [
  'trans woman',
  'trans man',
  'non-binary',
  'genderfluid',
  'agender',
  'woman',
  'man',
  'female',
  'male',
  'mulher',
  'homem'
];

const GENDER_FIELD_SELECTOR = '[data-testid="gender"], .profileCard__gender, .gender';

const LANGUAGE_WORDS = [
  'arabic',
  'chinese',
  'dutch',
  'english',
  'french',
  'german',
  'italian',
  'japanese',
  'korean',
  'portuguese',
  'spanish'
];

const normalizeProfileText = (value) =>
  String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseProfileDistance = (value) => {
  const match = normalizeProfileText(value).match(/(\d+)\s*(kilometers?|km|miles?)/i);
  if (!match) return null;

  return {
    value: parseInt(match[1], 10),
    unit: match[2].toLowerCase()
  };
};

const getElements = (root, selector) => {
  try {
    return Array.from(root?.querySelectorAll?.(selector) || []);
  } catch {
    return [];
  }
};

const getFirstElement = (root, selector) => getElements(root, selector)[0] || null;

const getElementText = (element) => normalizeProfileText(element?.textContent || '');

const normalizeHeading = (heading) => normalizeProfileText(heading).toLowerCase();

const findHeading = (root, headings) => {
  const acceptedHeadings = headings.map(normalizeHeading);
  return getElements(root, 'h2,h3').find(
    (heading) =>
      isVisibleProfileElement(heading) &&
      acceptedHeadings.includes(normalizeHeading(heading.textContent))
  );
};

const getProfileCardForHeading = (heading) => {
  if (!heading) return null;
  return (
    heading.closest?.('section') ||
    heading.closest?.('[class*="Bgc($c-ds-background-primary)"]') ||
    heading.parentElement
  );
};

const removeLeadingLabel = (text, label) => {
  const normalizedText = normalizeProfileText(text);
  const normalizedLabel = normalizeProfileText(label);
  if (!normalizedLabel) return normalizedText;
  if (normalizedText.toLowerCase().startsWith(normalizedLabel.toLowerCase())) {
    return normalizeProfileText(normalizedText.slice(normalizedLabel.length));
  }
  return normalizedText;
};

const removeSectionNoise = (text) => normalizeProfileText(text).replace(/\bView all \d+\b/gi, '').trim();

const getCardValue = (root, headings, selectors = []) => {
  const heading = findHeading(root, headings);
  const card = getProfileCardForHeading(heading);
  if (!card) return '';

  for (const selector of selectors) {
    const value = getElements(card, selector)
      .map(getElementText)
      .find((text) => text && !headings.map(normalizeHeading).includes(normalizeHeading(text)));
    if (value) return value;
  }

  const rawText = removeSectionNoise(getElementText(card));
  const value = headings.reduce((current, sectionHeading) => {
    return removeLeadingLabel(current, sectionHeading);
  }, rawText);
  return normalizeProfileText(value);
};

const extractNameAndAge = (root) => {
  for (const heading of getElements(root, 'h1')) {
    const candidates = [heading.getAttribute?.('aria-label'), heading.textContent].filter(Boolean);
    for (const candidate of candidates) {
      const text = normalizeProfileText(candidate);
      const match = text.match(/^(.+?)\s+(\d{2})(?:\s*(?:years?|anos?))?$/i);
      if (match) {
        return {
          name: normalizeProfileText(match[1]),
          age: parseInt(match[2], 10)
        };
      }
    }
  }

  return { name: null, age: null };
};

const extractPhotoCount = (root) => {
  const photoIndexes = getElements(root, '[aria-label^="Photo "]')
    .map((element) => element.getAttribute?.('aria-label') || '')
    .map((label) => label.match(/Photo\s+(\d+)/i))
    .filter(Boolean)
    .map((match) => parseInt(match[1], 10));

  const carouselCounts = getElements(root, '[aria-label]')
    .map((element) => element.getAttribute?.('aria-label') || '')
    .map((label) => label.match(/\d+\s+of\s+(\d+)/i))
    .filter(Boolean)
    .map((match) => parseInt(match[1], 10));

  const counts = photoIndexes.concat(carouselCounts).filter((count) => Number.isFinite(count));
  return counts.length ? Math.max(...counts) : null;
};

const extractLabeledSection = (root, headings) => {
  const heading = findHeading(root, headings);
  const section = getProfileCardForHeading(heading);
  if (!section) return {};

  return getElements(section, 'li').reduce((items, item) => {
    const label = getElementText(getFirstElement(item, 'h3'));
    if (!label) return items;
    const value = removeSectionNoise(removeLeadingLabel(getElementText(item), label));
    if (value) items[label] = value;
    return items;
  }, {});
};

const extractUnlabeledSection = (root, headings) => {
  const heading = findHeading(root, headings);
  const section = getProfileCardForHeading(heading);
  if (!section) return [];

  return getElements(section, 'li')
    .filter(isVisibleProfileElement)
    .map((item) => removeSectionNoise(getElementText(item)))
    .filter(Boolean);
};

const isGenderText = (value) => {
  const normalizedValue = normalizeHeading(value);
  return GENDER_VALUES.some((gender) => normalizedValue === gender);
};

const isLanguageText = (value) => {
  const normalizedValue = normalizeHeading(value);
  return (
    value.includes(',') ||
    LANGUAGE_WORDS.some((language) => normalizedValue.split(/\W+/).includes(language))
  );
};

const extractEssentials = (root) => {
  const essentials = extractUnlabeledSection(root, ESSENTIALS_HEADINGS);
  const details = {
    essentials,
    distance: null,
    occupation: null,
    gender:
      getElements(root, GENDER_FIELD_SELECTOR)
        .filter(isVisibleProfileElement)
        .map(getElementText)
        .find(isGenderText) || null,
    languages: []
  };

  for (const item of essentials) {
    if (!details.distance && /(\d+)\s*(miles?|km|kilometers?)/i.test(item)) {
      details.distance = item;
    } else if (!details.gender && isGenderText(item)) {
      details.gender = item;
    } else if (details.languages.length === 0 && isLanguageText(item)) {
      details.languages = item.split(',').map(normalizeProfileText).filter(Boolean);
    } else if (!details.occupation) {
      details.occupation = item;
    }
  }

  return details;
};

const extractProfileContext = (root = document) => {
  const nameAndAge = extractNameAndAge(root);
  const essentials = extractEssentials(root);

  return {
    name: nameAndAge.name,
    age: nameAndAge.age,
    bio: getCardValue(root, ABOUT_ME_HEADINGS, ['.Typs\\(body-1-regular\\)']),
    lookingFor: getCardValue(root, LOOKING_FOR_HEADINGS, ['.Typs\\(display-3-strong\\)']),
    photoCount: extractPhotoCount(root),
    distance: essentials.distance,
    occupation: essentials.occupation,
    gender: essentials.gender,
    languages: essentials.languages,
    essentials: essentials.essentials,
    basics: extractLabeledSection(root, BASICS_HEADINGS),
    lifestyle: extractLabeledSection(root, LIFESTYLE_HEADINGS),
    interests: extractUnlabeledSection(root, INTERESTS_HEADINGS)
  };
};

const hasValues = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
};

const formatProfileContextForPrompt = (profileContext = {}, fallbacks = {}) => {
  const profile = profileContext || {};
  const fields = {
    name: profile.name || fallbacks.name,
    age: profile.age || fallbacks.age,
    bio: profile.bio || fallbacks.bio,
    lookingFor: profile.lookingFor,
    gender: isGenderText(profile.gender) ? profile.gender : undefined,
    distance: profile.distance,
    occupation: profile.occupation,
    languages: profile.languages,
    photoCount: profile.photoCount,
    basics: profile.basics,
    lifestyle: profile.lifestyle,
    interests: profile.interests
  };

  return JSON.stringify(
    Object.fromEntries(Object.entries(fields).filter(([, value]) => hasValues(value)))
  );
};

module.exports = {
  extractProfileContext,
  formatProfileContextForPrompt,
  normalizeProfileText,
  parseProfileDistance
};
