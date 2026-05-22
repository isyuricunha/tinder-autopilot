const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  findProfileCloseControl,
  isNavigationBackControl,
  isProfileModalOpen
} = require('../src/misc/profile-modal-state');

class FakeElement {
  constructor(tagName, attributes = {}, textContent = '') {
    this.tagName = tagName.toUpperCase();
    this.attributes = attributes;
    this.textContent = textContent;
    this.disabled = Object.prototype.hasOwnProperty.call(attributes, 'disabled');
    this.offsetParent = {};
    this.style = parseStyle(attributes.style || '');
  }

  get className() {
    return this.attributes.class || '';
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  querySelectorAll() {
    return [];
  }
}

class HtmlRoot {
  constructor(html) {
    this.buttons = parseElements(html, 'button');
    this.roleButtons = parseRoleButtons(html);
    this.profileBackButtons = parseProfileBackButtons(html);
    this.profileContentElements = parseElementsByClass(html, 'profileContent');
    this.cardStacks = parseElementsByClass(html, 'recsCardboard__cardsContainer');
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    if (selector === 'button, [role="button"]') {
      return this.buttons.concat(this.roleButtons);
    }
    if (selector === '[data-testid="profileBackButton"]') {
      return this.profileBackButtons;
    }
    if (selector.includes('profileContent')) {
      return this.profileContentElements;
    }
    if (selector === '.recsCardboard__cardsContainer') {
      return this.cardStacks;
    }
    return [];
  }
}

const stripHtml = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseStyle = (styleText) =>
  String(styleText || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((style, part) => {
      const [property, value] = part.split(':').map((valuePart) => valuePart.trim());
      if (property && value) style[property] = value;
      return style;
    }, {});

const parseAttributes = (rawAttributes) => {
  const attributes = {};
  const attributePattern = /([:\w-]+)(?:="([^"]*)")?/g;
  let match = attributePattern.exec(rawAttributes);
  while (match) {
    attributes[match[1]] = match[2] || '';
    match = attributePattern.exec(rawAttributes);
  }
  return attributes;
};

const parseElements = (html, tagName) => {
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  return Array.from(html.matchAll(pattern)).map(
    (match) => new FakeElement(tagName, parseAttributes(match[1]), stripHtml(match[2]))
  );
};

const parseElementsByClass = (html, classMarker) =>
  Array.from(
    html.matchAll(
      new RegExp(`<([\\w-]+)\\b([^>]*class="[^"]*${classMarker}[^"]*"[^>]*)>([\\s\\S]*?)<\\/\\1>`, 'gi')
    )
  ).map(
    (match) => new FakeElement(match[1], parseAttributes(match[2]), stripHtml(match[3]))
  );

const parseRoleButtons = (html) =>
  Array.from(html.matchAll(/<(\w+)\b([^>]*role="button"[^>]*)>([\s\S]*?)<\/\1>/gi)).map(
    (match) => new FakeElement(match[1], parseAttributes(match[2]), stripHtml(match[3]))
  );

const parseProfileBackButtons = (html) =>
  Array.from(html.matchAll(/<(\w+)\b([^>]*data-testid="profileBackButton"[^>]*)>/gi)).map(
    (match) => new FakeElement(match[1], parseAttributes(match[2]), 'Back')
  );

const loadFixture = (fixturePath) =>
  new HtmlRoot(readFileSync(path.join(__dirname, '..', fixturePath), 'utf8'));

test('closed Explorer section is not treated as an open profile modal', () => {
  const root = loadFixture('tinder-html/tinder-explorer.html');
  const location = { pathname: '/app/explore/cl_zw9iz', search: '' };

  assert.equal(isProfileModalOpen(root, location), false);
  assert.equal(findProfileCloseControl(root), null);
});

test('open Explorer profile is treated as an open profile modal', () => {
  const root = loadFixture('tinder-html/tinder-explore-page-open-profile.html');
  const closeControl = findProfileCloseControl(root);

  assert.equal(isProfileModalOpen(root, { pathname: '/app/explore/cl_zw9iz', search: '' }), true);
  assert.equal(closeControl.getAttribute('data-testid'), 'profileBackButton');
});

test('Back to Explore is navigation, not a profile close control', () => {
  const root = loadFixture('tinder-html/tinder-explorer.html');
  const backToExplore = root.querySelector('button, [role="button"]');

  assert.equal(isNavigationBackControl(backToExplore), true);
  assert.equal(findProfileCloseControl(root), null);
});

test('open recs profile is still detected as an open profile modal', () => {
  const root = loadFixture('tinder-html/tinder-open-profile-with-gender.html');

  assert.equal(isProfileModalOpen(root, { pathname: '/app/recs', search: '' }), true);
  assert.equal(findProfileCloseControl(root).getAttribute('data-testid'), 'profileBackButton');
});
