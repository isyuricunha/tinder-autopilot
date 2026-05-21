const ROLE_PREFIXES = {
  match: 'match',
  user: 'user',
  owner: 'user',
  me: 'user'
};

const normalizeRolePrefix = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return ROLE_PREFIXES[normalized] || '';
};

const parseAiReplyTestConversation = (value = '') => {
  const turns = [];
  const lines = String(value || '').split(/\r?\n/);

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    const match = trimmedLine.match(/^(user|owner|me|match)\s*:\s*(.*)$/i);
    if (match) {
      const role = normalizeRolePrefix(match[1]);
      const text = match[2].trim();
      if (role && text) turns.push({ role, text });
      return;
    }

    const previousTurn = turns[turns.length - 1];
    if (previousTurn) {
      previousTurn.text = `${previousTurn.text}\n${trimmedLine}`;
    }
  });

  return turns;
};

module.exports = {
  parseAiReplyTestConversation
};
