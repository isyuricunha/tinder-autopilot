const SIDEBAR_SECTION_STATE_PREFIX = 'sidebarSection/';

const normalizeSidebarSectionId = (sectionId) => {
  const normalizedId = String(sectionId || 'section')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-');
  return normalizedId || 'section';
};

const getSidebarSectionSettingKey = (sectionId) =>
  `${SIDEBAR_SECTION_STATE_PREFIX}${normalizeSidebarSectionId(sectionId)}`;

const parseSidebarSectionOpen = (storedValue, defaultOpen = true) => {
  if (storedValue === 'true') return true;
  if (storedValue === 'false') return false;
  return Boolean(defaultOpen);
};

const readSidebarSectionOpen = ({ sectionId, defaultOpen = true, readSetting } = {}) => {
  const fallbackValue = defaultOpen ? 'true' : 'false';
  const storedValue =
    typeof readSetting === 'function'
      ? readSetting(getSidebarSectionSettingKey(sectionId), fallbackValue)
      : fallbackValue;

  return parseSidebarSectionOpen(storedValue, defaultOpen);
};

const writeSidebarSectionOpen = ({ sectionId, isOpen, writeSetting } = {}) => {
  if (typeof writeSetting !== 'function') return false;

  writeSetting(getSidebarSectionSettingKey(sectionId), String(Boolean(isOpen)));
  return true;
};

module.exports = {
  SIDEBAR_SECTION_STATE_PREFIX,
  getSidebarSectionSettingKey,
  normalizeSidebarSectionId,
  parseSidebarSectionOpen,
  readSidebarSectionOpen,
  writeSidebarSectionOpen
};
