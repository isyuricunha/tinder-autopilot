const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  classifyVisibleDialog,
  findDislikeButton,
  findLikeButton,
  findOpenProfileButton,
  findProfileBackButton,
  findSuperLikeButton,
  findVisibleDialog,
  getDialogType
} = require('../src/misc/tinder-dom-detectors');

class FakeElement {
  constructor(tagName, attributes = {}, textContent = '') {
    this.tagName = tagName.toUpperCase();
    this.attributes = attributes;
    this.textContent = textContent;
    this.disabled = Object.prototype.hasOwnProperty.call(attributes, 'disabled');
    this.offsetParent = {};
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
    this.dialogs = parseDialogs(html);
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
    if (selector === '[role="dialog"]') {
      return this.dialogs;
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

const parseRoleButtons = (html) =>
  Array.from(html.matchAll(/<(\w+)\b([^>]*role="button"[^>]*)>([\s\S]*?)<\/\1>/gi)).map(
    (match) => new FakeElement(match[1], parseAttributes(match[2]), stripHtml(match[3]))
  );

const parseDialogs = (html) =>
  Array.from(html.matchAll(/<(\w+)\b([^>]*role="dialog"[^>]*)>/gi)).map(
    (match) => new FakeElement(match[1], parseAttributes(match[2]), stripHtml(html.slice(match.index)))
  );

const parseProfileBackButtons = (html) =>
  Array.from(html.matchAll(/<(\w+)\b([^>]*data-testid="profileBackButton"[^>]*)>/gi)).map(
    (match) => new FakeElement(match[1], parseAttributes(match[2]), 'Back')
  );

const loadFixture = (fixturePath) =>
  new HtmlRoot(readFileSync(path.join(__dirname, '..', fixturePath), 'utf8'));

test('finds gamepad action buttons from the closed recs snapshot', () => {
  const root = loadFixture('tinder-html/tinder-closed-profile.html');

  assert.equal(findDislikeButton(root).textContent, 'Nope');
  assert.equal(findLikeButton(root).textContent, 'Like');
  assert.equal(findSuperLikeButton(root).textContent, 'Super Like');
  assert.match(findOpenProfileButton(root).textContent, /Open Profile/);
});

test('finds profile controls from the open profile snapshot', () => {
  const root = loadFixture('tinder-html/tinder-open-profile-with-gender.html');

  assert.equal(findDislikeButton(root).textContent, 'Nope');
  assert.equal(findLikeButton(root).textContent, 'Like');
  assert.equal(findSuperLikeButton(root).textContent, 'Super Like');
  assert.equal(findProfileBackButton(root).getAttribute('data-testid'), 'profileBackButton');
});

test('does not confuse explore boost or first impression controls with like actions', () => {
  const root = loadFixture('tinder-html/tinder-explore-page-closed-profile copy.html');

  assert.equal(findDislikeButton(root).textContent, 'Nope');
  assert.equal(findLikeButton(root).textContent, 'Like');
  assert.equal(findSuperLikeButton(root).textContent, 'Super Like');
});

test('classifies visible super like upsell and ignores hidden Tinder sheets', () => {
  const superLikeDialog = loadFixture('tinder-html/tinder-modal-super-like.html');
  const hiddenExploreDialog = loadFixture('tinder-html/tinder-explore-page-open-profile.html');

  assert.equal(classifyVisibleDialog(superLikeDialog), 'superLikeUpsell');
  assert.equal(getDialogType(superLikeDialog.querySelector('[role="dialog"]')), 'superLikeUpsell');
  assert.equal(findVisibleDialog(hiddenExploreDialog), null);
  assert.equal(classifyVisibleDialog(hiddenExploreDialog), null);
});
