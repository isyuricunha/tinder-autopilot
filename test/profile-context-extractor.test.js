const test = require('node:test');
const assert = require('node:assert/strict');
const {
  extractProfileContext,
  formatProfileContextForPrompt
} = require('../src/misc/profile-context-extractor');

class FakeElement {
  constructor(tagName, text = '', attributes = {}, children = []) {
    this.tagName = tagName.toUpperCase();
    this.text = text;
    this.attributes = attributes;
    this.children = children;
    this.parentElement = null;
    this.children.forEach((child) => {
      child.parentElement = this;
    });
  }

  get textContent() {
    return [this.text, ...this.children.map((child) => child.textContent)].join(' ');
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    return this.getDescendants().filter((element) => element.matches(selector));
  }

  closest(selector) {
    let current = this;
    while (current) {
      if (current.matches(selector)) return current;
      current = current.parentElement;
    }
    return null;
  }

  getDescendants() {
    return this.children.flatMap((child) => [child, ...child.getDescendants()]);
  }

  matches(selector) {
    return selector.split(',').some((part) => this.matchesSingleSelector(part.trim()));
  }

  matchesSingleSelector(selector) {
    if (!selector) return false;
    if (selector === '[aria-label]') return Boolean(this.getAttribute('aria-label'));
    if (selector === '[aria-label^="Photo "]') {
      return (this.getAttribute('aria-label') || '').startsWith('Photo ');
    }
    if (selector.startsWith('[class*="')) {
      const expectedClass = selector.slice(9, -2);
      return (this.getAttribute('class') || '').includes(expectedClass);
    }
    if (selector.startsWith('.')) {
      const expectedClass = selector.slice(1).replace(/\\/g, '');
      return (this.getAttribute('class') || '').includes(expectedClass);
    }
    return this.tagName.toLowerCase() === selector.toLowerCase();
  }
}

const element = (tagName, text = '', attributes = {}, children = []) =>
  new FakeElement(tagName, text, attributes, children);

const card = (heading, children) =>
  element('div', '', { class: 'P(24px) Bgc($c-ds-background-primary)' }, [
    element('h2', heading),
    ...children
  ]);

const section = (heading, items) =>
  element('section', '', {}, [element('h2', heading), element('ul', '', {}, items)]);

const textItem = (text) =>
  element('li', '', {}, [element('div', text, { class: 'Typs(body-1-regular)' })]);

const labeledItem = (label, value) =>
  element('li', '', {}, [
    element('h3', label),
    element('div', value, { class: 'Typs(body-1-regular)' })
  ]);

const createProfileFixture = () =>
  element('main', '', {}, [
    element('h1', '', { 'aria-label': 'Maria Eduarda 26 years' }),
    element('button', '', { 'aria-label': 'Photo 1' }),
    element('button', '', { 'aria-label': 'Photo 2' }),
    element('button', '', { 'aria-label': 'Photo 3' }),
    element('button', '', { 'aria-label': 'Photo 4' }),
    card('Looking for', [
      element('span', 'Still figuring it out', { class: 'Typs(display-3-strong)' })
    ]),
    card('About me', [
      element('div', 'Riso facil, sertanejo e cerveja com uma boa cia', {
        class: 'Typs(body-1-regular)'
      })
    ]),
    card('Essentials', [
      section('Essentials', [
        textItem('10 kilometers away'),
        textItem('Advogada'),
        textItem('Woman'),
        textItem('English, Spanish')
      ])
    ]),
    section('Basics', [
      labeledItem('Zodiac', 'Pisces'),
      labeledItem('Education', 'Bachelors'),
      labeledItem('Family Plans', 'Not sure yet'),
      labeledItem('Communication Style', 'Phone caller')
    ]),
    section('Lifestyle', [
      labeledItem('Drinking', 'Socially on weekends'),
      labeledItem('Smoking', 'Non-smoker'),
      labeledItem('Workout', 'Sometimes')
    ]),
    section('Interests', [
      textItem('Language Exchange'),
      textItem('Travel'),
      textItem('Reading'),
      textItem('Cooking'),
      textItem('Live Music')
    ])
  ]);

test('extractProfileContext reads structured optional Tinder profile fields', () => {
  const profile = extractProfileContext(createProfileFixture());

  assert.equal(profile.name, 'Maria Eduarda');
  assert.equal(profile.age, 26);
  assert.equal(profile.bio, 'Riso facil, sertanejo e cerveja com uma boa cia');
  assert.equal(profile.lookingFor, 'Still figuring it out');
  assert.equal(profile.photoCount, 4);
  assert.equal(profile.distance, '10 kilometers away');
  assert.equal(profile.occupation, 'Advogada');
  assert.equal(profile.gender, 'Woman');
  assert.deepEqual(profile.languages, ['English', 'Spanish']);
  assert.equal(profile.basics.Zodiac, 'Pisces');
  assert.equal(profile.basics.Education, 'Bachelors');
  assert.equal(profile.lifestyle.Smoking, 'Non-smoker');
  assert.deepEqual(profile.interests, [
    'Language Exchange',
    'Travel',
    'Reading',
    'Cooking',
    'Live Music'
  ]);
});

test('formatProfileContextForPrompt omits missing optional fields safely', () => {
  const prompt = formatProfileContextForPrompt(
    {
      name: 'Alice',
      age: 30,
      bio: '',
      basics: {},
      lifestyle: {},
      interests: []
    },
    { bio: 'fallback bio' }
  );

  assert.equal(prompt.includes('Name: Alice'), true);
  assert.equal(prompt.includes('Age: 30'), true);
  assert.equal(prompt.includes('Bio: fallback bio'), true);
  assert.equal(prompt.includes('Lifestyle:'), false);
});
