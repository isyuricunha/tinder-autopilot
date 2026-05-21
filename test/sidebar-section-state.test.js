const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getSidebarSectionSettingKey,
  normalizeSidebarSectionId,
  parseSidebarSectionOpen,
  readSidebarSectionOpen,
  writeSidebarSectionOpen
} = require('../src/views/sidebar-section-state');

test('sidebar section state normalizes section ids for storage keys', () => {
  assert.equal(normalizeSidebarSectionId('AI Reply Runtime'), 'AI-Reply-Runtime');
  assert.equal(normalizeSidebarSectionId('   '), 'section');
  assert.equal(getSidebarSectionSettingKey('ai reply runtime'), 'sidebarSection/ai-reply-runtime');
});

test('sidebar section state reads explicit values before defaults', () => {
  assert.equal(parseSidebarSectionOpen('true', false), true);
  assert.equal(parseSidebarSectionOpen('false', true), false);
  assert.equal(parseSidebarSectionOpen('', true), true);
  assert.equal(parseSidebarSectionOpen('', false), false);
});

test('sidebar section state reads and writes through injected setting functions', () => {
  const settings = {};
  const readSetting = (key, fallback) => settings[key] ?? fallback;
  const writeSetting = (key, value) => {
    settings[key] = value;
  };

  assert.equal(
    readSidebarSectionOpen({
      sectionId: 'ai-reply-testing',
      defaultOpen: false,
      readSetting
    }),
    false
  );

  assert.equal(
    writeSidebarSectionOpen({
      sectionId: 'ai-reply-testing',
      isOpen: true,
      writeSetting
    }),
    true
  );
  assert.equal(settings['sidebarSection/ai-reply-testing'], 'true');
  assert.equal(
    readSidebarSectionOpen({
      sectionId: 'ai-reply-testing',
      defaultOpen: false,
      readSetting
    }),
    true
  );
});

test('sidebar section state safely handles missing writers', () => {
  assert.equal(writeSidebarSectionOpen({ sectionId: 'main-settings', isOpen: false }), false);
});
