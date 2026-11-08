const { normalizeGuardText } = require('./ai-reply-manual-takeover');

const getLatestMatchTurn = (conversationTurns = []) => {
  for (let index = conversationTurns.length - 1; index >= 0; index -= 1) {
    if (conversationTurns[index]?.role === 'match') return conversationTurns[index];
  }
  return null;
};

const matchesAny = (text, patterns = []) => patterns.some((pattern) => pattern.test(text));

const classifyAiReplyConversationIntent = (conversationTurns = []) => {
  const latestMatchTurn = getLatestMatchTurn(conversationTurns);
  const latestText = normalizeGuardText(latestMatchTurn?.text);

  return {
    asksAboutWork: matchesAny(latestText, [
      /\b(?:trabalha|trampo|servico|serviço|profissao|profissão)\b/,
      /\b(?:faz|fazendo)\s+(?:o\s+)?que\s+(?:da\s+vida|de\s+trabalho)\b/,
      /\b(?:estuda|faculdade|curso)\b/
    ]),
    asksForContact: matchesAny(latestText, [
      /\b(?:whats|whatsapp|wpp|zap|telegram|insta|instagram|sms|telefone|numero|número|contato)\b/
    ]),
    asksForLocation: matchesAny(latestText, [
      /\b(?:onde|aonde)\s+(?:tu|vc|voce|você|ce|cê)?\s*(?:mora|vive|fica|esta|está)\b/,
      /\b(?:mora|vive|fica|esta|está)\s+(?:onde|aonde)\b/,
      /\b(?:tu|vc|voce|você|ce|cê)\s+(?:mora|vive|fica|esta|está)\s+(?:onde|aonde)\b/,
      /\b(?:de|da)\s+onde\s+(?:tu|vc|voce|você|ce|cê)\s+(?:e|é|eh)\b/,
      /\b(?:tu|vc|voce|você|ce|cê)\s+(?:e|é|eh)\s+(?:de|da)\s+onde\b/,
      /\b(?:qual|onde|aonde).{0,30}\b(?:cidade|bairro|regiao|região)\b/,
      /\b(?:onde|aonde).{0,30}\b(?:encontrar|se ver|vamos nos ver)\b/,
      /\bwhere\b.{0,35}\b(?:live|from|stay|meet)\b/,
      /\b(?:endereco|endereço)\b/
    ]),
    mentionsTiredSickColdBusyOrSleep: matchesAny(latestText, [
      /\b(?:cansad\w*|sono|dormi\w*|dormiu|dormir|gripad\w*|gripe|doente|frio|correria|corrido|ocupad\w*)\b/
    ]),
    proposesMeeting: matchesAny(latestText, [
      /\b(?:vamos|bora|partiu|topa|quer|marcar|marca|combinar|combinamos)\b.{0,50}\b(?:sair|encontrar|se ver|ver voce|ver você|cafe|café|bar|jantar|cinema|role|rol[eê]|drink|cerveja)\b/,
      /\b(?:quando|que dia)\b.{0,50}\b(?:sair|se ver|encontrar|marcar)\b/
    ]),
    sharesContact: matchesAny(latestText, [
      /(?:\+?\d[\d\s().-]{7,}\d)/,
      /(?:^|\s)@[\w.]{3,}/
    ]),
    showsDiscomfortOrAutomationConcern: matchesAny(latestText, [
      /\b(?:golpe|bot|robo|robô|automacao|automação|automatico|automático|automatica|automática|fake|sumiu|vacuo|vácuo|nao responde|não responde|nao respondeu|não respondeu|para com isso|para de)\b/
    ]),
    hasSensitiveSexualContent: matchesAny(latestText, [
      /\b(?:nude|nudes|sexo|transar|tesao|tesão|tesuda|tesudo|manda foto|foto agora)\b/
    ])
  };
};

const formatAiReplyConversationSignals = (conversationTurns = []) => {
  const intent = classifyAiReplyConversationIntent(conversationTurns);
  const signals = [];

  if (intent.asksForLocation) signals.push('- Latest match message asks about location.');
  if (intent.asksForContact) signals.push('- Latest match message asks about contact or another app.');
  if (intent.sharesContact) signals.push('- Latest match message shares direct contact.');
  if (intent.proposesMeeting) signals.push('- Latest match message proposes meeting.');
  if (intent.asksAboutWork) signals.push('- Latest match message asks about work, study, or routine.');
  if (intent.mentionsTiredSickColdBusyOrSleep) {
    signals.push('- Latest match message mentions tiredness, sickness, cold, busyness, or sleep.');
  }
  if (intent.showsDiscomfortOrAutomationConcern) {
    signals.push('- Latest match message may require manual context because it shows discomfort or automation concern.');
  }
  if (intent.hasSensitiveSexualContent) {
    signals.push('- Latest match message has sensitive sexual content.');
  }

  return signals.join('\n');
};

module.exports = {
  classifyAiReplyConversationIntent,
  formatAiReplyConversationSignals
};
