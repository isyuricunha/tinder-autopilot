const test = require('node:test');
const assert = require('node:assert/strict');
const { SIDEBAR_THEME } = require('../src/views/sidebar-theme');

test('sidebar theme exposes stable dark surface and accent tokens', () => {
  assert.equal(SIDEBAR_THEME.background, '#0c0c0d');
  assert.equal(SIDEBAR_THEME.surface, '#151518');
  assert.equal(SIDEBAR_THEME.text, '#f4f4f5');
  assert.match(SIDEBAR_THEME.accentGradient, /#8b5cf6/);
});
