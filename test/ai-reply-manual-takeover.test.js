const test = require('node:test');
const assert = require('node:assert/strict');
const {
  detectAiReplyManualTakeover,
  hasUserAlreadySharedContact,
  normalizeGuardText
} = require('../src/misc/ai-reply-manual-takeover');

const conversationWithLatestMatch = (text) => [
  { role: 'user', text: 'oi' },
  { role: 'match', text }
];

test('normalizeGuardText removes accents and repeated whitespace', () => {
  assert.equal(normalizeGuardText('  Você   é de São Paulo?  '), 'voce e de sao paulo?');
});

test('detectAiReplyManualTakeover catches shared contact details', () => {
  assert.equal(
    detectAiReplyManualTakeover(conversationWithLatestMatch('11937340064 me chama')),
    'Latest match message shared contact information'
  );
  assert.equal(
    detectAiReplyManualTakeover(conversationWithLatestMatch('me segue no @ana.teste')),
    'Latest match message shared contact information'
  );
});

test('detectAiReplyManualTakeover catches contact exchange requests', () => {
  assert.equal(
    detectAiReplyManualTakeover(conversationWithLatestMatch('me passa seu whats?')),
    'Latest match message asks to exchange contact information'
  );
  assert.equal(
    detectAiReplyManualTakeover(conversationWithLatestMatch('vamos trocar números?')),
    'Latest match message asks to exchange contact information'
  );
});

test('detectAiReplyManualTakeover catches meeting proposals', () => {
  assert.equal(
    detectAiReplyManualTakeover(conversationWithLatestMatch('bora marcar um café?')),
    'Latest match message proposes meeting'
  );
});

test('detectAiReplyManualTakeover allows ordinary pending replies', () => {
  assert.equal(
    detectAiReplyManualTakeover(conversationWithLatestMatch('dormi bem e vc?')),
    ''
  );
});

test('hasUserAlreadySharedContact detects owner phone numbers and handles', () => {
  assert.equal(
    hasUserAlreadySharedContact([
      { role: 'match', text: 'me chama' },
      { role: 'user', text: 'me chama no +55 11 99999-9999' }
    ]),
    true
  );
  assert.equal(
    hasUserAlreadySharedContact([
      { role: 'match', text: 'qual seu insta?' },
      { role: 'user', text: '@user.test' }
    ]),
    true
  );
  assert.equal(
    hasUserAlreadySharedContact([
      { role: 'match', text: 'quer whats?' },
      { role: 'user', text: 'pode ser, manda ai' }
    ]),
    false
  );
});
