const test = require('node:test');
const assert = require('node:assert/strict');
const { getPathname, isSwipeSurfaceUrl } = require('../src/misc/tinder-route-state');

test('getPathname reads strings and browser-like location objects', () => {
  assert.equal(getPathname('https://tinder.com/app/explore/cl_zw9iz'), '/app/explore/cl_zw9iz');
  assert.equal(getPathname({ pathname: '/app/recs' }), '/app/recs');
  assert.equal(
    getPathname({ toString: () => 'https://tinder.com/app/explore/cl_zw9iz' }),
    '/app/explore/cl_zw9iz'
  );
});

test('isSwipeSurfaceUrl accepts recs, matches, and nested Explorer sections', () => {
  assert.equal(isSwipeSurfaceUrl('https://tinder.com/app/recs'), true);
  assert.equal(isSwipeSurfaceUrl('https://tinder.com/app/matches'), true);
  assert.equal(isSwipeSurfaceUrl('https://tinder.com/app/explore'), true);
  assert.equal(isSwipeSurfaceUrl('https://tinder.com/app/explore/cl_zw9iz'), true);
  assert.equal(isSwipeSurfaceUrl({ pathname: '/app/explore/cl_zw9iz' }), true);
});

test('isSwipeSurfaceUrl rejects non-swipe pages', () => {
  assert.equal(isSwipeSurfaceUrl('https://tinder.com/app/profile'), false);
  assert.equal(isSwipeSurfaceUrl('https://tinder.com/app/messages'), false);
});
