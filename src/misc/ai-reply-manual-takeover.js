const normalizeGuardText = (value) =>
  String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getLatestMatchTurn = (conversationTurns = []) => {
  for (let index = conversationTurns.length - 1; index >= 0; index -= 1) {
    if (conversationTurns[index]?.role === 'match') return conversationTurns[index];
  }
  return null;
};

const hasPhoneNumber = (text) => /(?:\+?\d[\d\s().-]{7,}\d)/.test(text);

const hasSocialHandle = (text) => /(?:^|\s)@[\w.]{3,}/.test(text);

const hasDirectContactValue = (text) => hasPhoneNumber(text) || hasSocialHandle(text);

const mentionsContactApp = (text) =>
  /\b(?:whats|whatsapp|wpp|zap|telegram|insta|instagram|sms|telefone|numeros?|contato)\b/.test(
    text
  );

const asksForContact = (text) =>
  mentionsContactApp(text) &&
  /(?:\b(?:manda|passa|me passa|me chama|chama|add|adiciona|anota|salva|tem|qual|trocar|bora|vamos|sair|ir)\b|\b(?:seu|teu)\b)/.test(
    text
  );

const asksForMeeting = (text) =>
  /(?:\b(?:vamos|bora|partiu|topa|quer|marcar|marca|combinar|combinamos)\b.{0,50}\b(?:sair|encontrar|se ver|ver voce|ver voce|cafe|bar|jantar|cinema|role|rol[eê]|drink|cerveja)\b|\b(?:quando|que dia)\b.{0,50}\b(?:sair|se ver|encontrar|marcar)\b)/.test(
    text
  );

const needsSensitiveTakeover = (text) =>
  /\b(?:nude|nudes|sexo|transar|tesao|tesao|tesuda|tesudo|manda foto|foto agora)\b/.test(
    text
  );

const indicatesDiscomfortOrAutomationConcern = (text) =>
  /\b(?:golpe|bot|robo|automacao|automatico|automatica|fake|sumiu|vacuo|nao responde|nao respondeu|para com isso|para de)\b/.test(
    text
  );

const detectAiReplyManualTakeover = (conversationTurns = []) => {
  const latestMatchTurn = getLatestMatchTurn(conversationTurns);
  const latestText = normalizeGuardText(latestMatchTurn?.text);
  if (!latestText) return '';

  if (hasPhoneNumber(latestText) || hasSocialHandle(latestText)) {
    return 'Latest match message shared contact information';
  }

  if (asksForContact(latestText)) {
    return 'Latest match message asks to exchange contact information';
  }

  if (asksForMeeting(latestText)) {
    return 'Latest match message proposes meeting';
  }

  if (needsSensitiveTakeover(latestText)) {
    return 'Latest match message needs sensitive manual handling';
  }

  if (indicatesDiscomfortOrAutomationConcern(latestText)) {
    return 'Latest match message needs manual context';
  }

  return '';
};

const hasUserAlreadySharedContact = (conversationTurns = []) =>
  conversationTurns.some(
    (turn) => turn?.role === 'user' && hasDirectContactValue(normalizeGuardText(turn.text))
  );

module.exports = {
  detectAiReplyManualTakeover,
  hasUserAlreadySharedContact,
  normalizeGuardText
};
