import { getMatches, getRawMessagesForMatch, sendMessageToMatch } from '../misc/api';
import { logger, randomDelay } from '../misc/helper';
import { getCheckboxValue, setToggleState } from '../views/toggle-control';

class Messenger {
  selector = '.tinderAutopilotMessage';

  newSelector = '.tinderAutopilotMessageNewOnly';

  session = null;

  get isBusy() {
    return this.session !== null;
  }

  start = () => {
    if (this.session) {
      setToggleState(this.selector, !this.session.cancelled);
      logger('Auto Message is still finishing the previous run');
      return;
    }

    const template = document.getElementById('messageToSend')?.value.trim();
    if (!template) {
      logger('Enter an Auto Message template before starting');
      setToggleState(this.selector, false);
      return;
    }

    const session = { template, newOnly: getCheckboxValue(this.newSelector), cancelled: false };
    this.session = session;
    logger('Auto Message is checking for empty conversations');
    this.run(session)
      .catch((error) => logger(`Auto Message stopped · ${error.message}`))
      .finally(() => {
        this.session = null;
        setToggleState(this.selector, false);
      });
  };

  stop = () => {
    if (this.session) this.session.cancelled = true;
    setToggleState(this.selector, false);
  };

  collectMatches = async (session) => {
    const matches = new Map();
    const pageTokens = new Set();
    let pageToken;

    do {
      const { data } = await getMatches(session.newOnly, pageToken);
      if (session.cancelled) break;
      if (!Array.isArray(data?.matches)) throw new Error('Tinder returned an invalid match list');

      for (const match of data.matches) {
        if (match?.id && !matches.has(match.id)) matches.set(match.id, match);
      }
      pageToken = data.next_page_token;
      if (pageTokens.has(pageToken)) throw new Error('Tinder repeated a match page');
      if (pageToken) pageTokens.add(pageToken);
    } while (pageToken && !session.cancelled);

    return Array.from(matches.values()).reverse();
  };

  run = async (session) => {
    const matches = await this.collectMatches(session);
    let sent = 0;
    let skipped = 0;

    for (const match of matches) {
      if (session.cancelled) break;
      const name = match.person?.name?.trim();
      if (session.template.includes('{name}') && !name) {
        skipped += 1;
        continue;
      }

      const messages = await getRawMessagesForMatch(match.id);
      if (session.cancelled) break;
      if (messages.length) {
        skipped += 1;
        continue;
      }

      const message = session.template.replaceAll('{name}', () => name);
      const response = await sendMessageToMatch(match.id, { message });
      if (!response?.sent_date) throw new Error('Tinder did not confirm the send');
      sent += 1;
      if (!session.cancelled) await randomDelay(1000, 1800);
    }

    logger(`Auto Message ${session.cancelled ? 'stopped' : 'finished'} · ${sent} sent · ${skipped} skipped`);
  };
}

export default Messenger;
