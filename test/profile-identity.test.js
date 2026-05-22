const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  getActiveProfileCard,
  getProfileIdentity
} = require('../src/misc/profile-identity');

class FakeElement {
  constructor(tagName, attributes = {}, textContent = '', children = []) {
    this.tagName = tagName.toUpperCase();
    this.attributes = attributes;
    this.textContent = textContent;
    this.children = children;
    this.disabled = Object.prototype.hasOwnProperty.call(attributes, 'disabled');
    this.offsetParent = {};
    this.parentElement = null;
    this.style = {};

    if (attributes.style) {
      this.style.backgroundImage = attributes.style;
    }
    if (attributes.src) {
      this.src = attributes.src;
    }

    this.children.forEach((child) => {
      child.parentElement = this;
    });
  }

  get className() {
    return this.attributes.class || '';
  }

  getAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this.attributes, name)
      ? this.attributes[name]
      : null;
  }

  hasAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this.attributes, name);
  }

  getBoundingClientRect() {
    return { width: 320, height: 540 };
  }

  querySelectorAll(selector) {
    const selectors = selector.split(',').map((value) => value.trim());
    const matches = [];

    const visit = (element) => {
      if (selectors.some((singleSelector) => matchesSelector(element, singleSelector))) {
        matches.push(element);
      }
      element.children.forEach(visit);
    };

    this.children.forEach(visit);
    return matches;
  }
}

class HtmlRoot extends FakeElement {
  constructor(html) {
    super('main', {}, '', parseProfileContents(html).concat(parseKeyboardCards(html)));
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

const getFirstMatch = (html, pattern) => {
  const match = html.match(pattern);
  return match ? match[1].trim() : '';
};

const buildCardChildren = (html) => {
  const children = [];
  const name = getFirstMatch(html, /itemprop="name"[^>]*>([\s\S]*?)<\/span>/i);
  const age = getFirstMatch(html, /itemprop="age"[^>]*>([\s\S]*?)<\/span>/i);
  const backgroundImage = getFirstMatch(html, /background-image:\s*url\(&quot;([^&]+).*?&quot;\)/i);

  if (name) {
    children.push(new FakeElement('span', { itemprop: 'name' }, stripHtml(name)));
  }
  if (age) {
    children.push(new FakeElement('span', { itemprop: 'age' }, stripHtml(age)));
  }
  if (backgroundImage) {
    children.push(
      new FakeElement(
        'div',
        {
          role: 'img',
          style: `background-image: url("${backgroundImage}")`
        },
        ''
      )
    );
  }

  return children;
};

const parseKeyboardCards = (html) => {
  const matches = Array.from(
    html.matchAll(/<div\b([^>]*data-keyboard-gamepad="true"[^>]*)>/gi)
  );

  return matches.map((match, index) => {
    const nextMatch = matches[index + 1];
    const content = html.slice(match.index + match[0].length, nextMatch?.index || html.length);
    return new FakeElement(
      'div',
      parseAttributes(match[1]),
      stripHtml(content),
      buildCardChildren(content)
    );
  });
};

const parseProfileContents = (html) => {
  if (!html.includes('profileContent')) return [];

  const h1Match = html.match(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/i);
  if (!h1Match) return [];

  return [
    new FakeElement(
      'div',
      { class: 'profileContent' },
      stripHtml(html),
      [new FakeElement('h1', parseAttributes(h1Match[1]), stripHtml(h1Match[2]))]
    )
  ];
};

const matchesSelector = (element, selector) => {
  if (selector === '[data-keyboard-gamepad="true"][aria-hidden="false"]') {
    return (
      element.getAttribute('data-keyboard-gamepad') === 'true' &&
      element.getAttribute('aria-hidden') === 'false'
    );
  }
  if (selector === '[data-keyboard-gamepad="true"]') {
    return element.getAttribute('data-keyboard-gamepad') === 'true';
  }
  if (selector.includes('profileContent')) {
    return element.className.includes('profileContent');
  }
  if (selector === '[itemprop="name"]') {
    return element.getAttribute('itemprop') === 'name';
  }
  if (selector === '[itemprop="age"]') {
    return element.getAttribute('itemprop') === 'age';
  }
  if (selector === 'h1' || selector === 'h1[aria-label*="years"]') {
    return element.tagName === 'H1';
  }
  if (selector === 'img[src]') {
    return element.tagName === 'IMG' && Boolean(element.getAttribute('src'));
  }
  if (selector.includes('[style*="background-image"]')) {
    return String(element.getAttribute('style') || '').includes('background-image');
  }
  if (selector.includes('[role="img"]')) {
    return element.getAttribute('role') === 'img';
  }
  return false;
};

const loadFixture = (fixturePath) =>
  new HtmlRoot(readFileSync(path.join(__dirname, '..', fixturePath), 'utf8'));

test('uses the active Explorer card identity and ignores hidden deck cards', () => {
  const root = loadFixture('tinder-html/tinder-explorer.html');
  const activeCard = getActiveProfileCard(root);

  assert.equal(activeCard.getAttribute('aria-hidden'), 'false');
  assert.equal(getProfileIdentity(root), 'name:Lais|age:29');
});

test('uses expanded profile content before the background card stack', () => {
  const root = loadFixture('tinder-html/tinder-open-profile-with-gender.html');

  assert.equal(getProfileIdentity(root), 'name:Maria Eduarda|age:26');
});
