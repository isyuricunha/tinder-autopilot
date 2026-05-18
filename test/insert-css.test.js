const test = require('node:test');
const assert = require('node:assert/strict');
const { insertCss, removeCss } = require('../src/misc/insert-css');

const createDocumentFixture = () => {
  const head = {
    childNodes: [],
    appendChild(element) {
      element.parentNode = this;
      this.childNodes.push(element);
    },
    insertBefore(element, referenceElement) {
      element.parentNode = this;
      const index = this.childNodes.indexOf(referenceElement);
      if (index === -1) {
        this.childNodes.push(element);
      } else {
        this.childNodes.splice(index, 0, element);
      }
    }
  };

  global.document = {
    querySelector(selector) {
      return selector === 'head' ? head : null;
    },
    getElementById(id) {
      return head.childNodes.find((element) => element.id === id) || null;
    },
    createElement(tagName) {
      return {
        tagName,
        id: '',
        textContent: '',
        parentNode: null,
        attributes: {},
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
        remove() {
          if (!this.parentNode) return;
          this.parentNode.childNodes = this.parentNode.childNodes.filter(
            (element) => element !== this
          );
          this.parentNode = null;
        }
      };
    }
  };

  return head;
};

test('insertCss keeps separate style elements by id', () => {
  const head = createDocumentFixture();

  insertCss('.sidebar {}', { id: 'sidebar' });
  insertCss('.instagram {}', { id: 'instagram' });

  assert.equal(head.childNodes.length, 2);
  assert.equal(document.getElementById('TinderAutopilot-insert-css-sidebar').textContent, '.sidebar {}');
  assert.equal(
    document.getElementById('TinderAutopilot-insert-css-instagram').textContent,
    '.instagram {}'
  );
});

test('removeCss only removes the requested style id', () => {
  const head = createDocumentFixture();

  insertCss('.sidebar {}', { id: 'sidebar' });
  insertCss('.anonymous {}', { id: 'anonymous' });
  removeCss({ id: 'anonymous' });

  assert.equal(head.childNodes.length, 1);
  assert.ok(document.getElementById('TinderAutopilot-insert-css-sidebar'));
  assert.equal(document.getElementById('TinderAutopilot-insert-css-anonymous'), null);
});
