const createActivityElement = (doc, tag, className, text) => {
  const element = doc.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

const ACTIVITY_FILTERS = {
  all: [],
  liked: ['Liked', 'Super Liked'],
  skipped: ['Skipped'],
  attention: ['Paused', 'No swipe']
};

const updateActivityView = (log) => {
  const section = log.parentElement;
  const filter = section?.querySelector('#activityFilter');
  if (!filter) return;

  const outcomes = ACTIVITY_FILTERS[filter.value] || ACTIVITY_FILTERS.all;
  let visible = 0;
  Array.from(log.children).forEach((row) => {
    const hidden = outcomes.length > 0 && !outcomes.includes(row.dataset.outcome);
    if (row.hidden !== hidden) row.hidden = hidden;
    if (!hidden) visible += 1;
  });

  section.querySelector('#copyActivityLog').disabled = visible === 0;
  section.querySelector('#clearActivityLog').disabled = log.childElementCount === 0;
  section.querySelector('.ta-activity-empty-filter').hidden = visible > 0 || log.childElementCount === 0;
};

const formatActivityLog = (log) =>
  Array.from(log.children).filter((row) => !row.hidden).map((row) => {
    const time = row.querySelector('time').textContent;
    const message = row.querySelector('.ta-activity-message');
    if (message) return `${time}  ${message.textContent}`;

    const duration = row.querySelector('.ta-activity-duration').textContent;
    const lines = [`${time}  ${row.dataset.outcome} · ${duration}`];
    const reason = row.querySelector('.ta-activity-reason');
    if (reason) lines.push(`  ${reason.textContent}`);
    row.querySelectorAll('.ta-activity-timings dt').forEach((label) => {
      lines.push(`  ${label.textContent}: ${label.nextElementSibling.textContent}`);
    });
    return lines.join('\n');
  }).join('\n\n');

const appendActivityEntry = (log, entry, now = new Date()) => {
  const doc = log.ownerDocument;
  const row = createActivityElement(doc, 'li', 'ta-activity-entry');
  const header = createActivityElement(doc, 'div', 'ta-activity-meta');
  const timestamp = createActivityElement(doc, 'time', 'ta-activity-time',
    [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((part) => String(part).padStart(2, '0')).join(':'));
  timestamp.dateTime = now.toISOString();
  const isSwipe = typeof entry?.outcome === 'string';

  if (isSwipe) {
    row.classList.add('ta-activity-swipe');
    row.dataset.outcome = entry.outcome;
    const outcome = createActivityElement(doc, 'strong', 'ta-activity-outcome', entry.outcome);
    const duration = createActivityElement(doc, 'span', 'ta-activity-duration', entry.duration);
    header.append(outcome, duration, timestamp);
    row.append(header);

    if (entry.reason) {
      row.append(createActivityElement(doc, 'p', 'ta-activity-reason', entry.reason));
    }

    if (entry.timings.length) {
      const details = createActivityElement(doc, 'details', 'ta-activity-details');
      const timings = createActivityElement(doc, 'dl', 'ta-activity-timings');
      entry.timings.forEach(({ phase, duration: elapsed }) => {
        timings.append(
          createActivityElement(doc, 'dt', '', phase),
          createActivityElement(doc, 'dd', '', elapsed)
        );
      });
      details.append(
        createActivityElement(doc, 'summary', '', 'Step timings'),
        timings
      );
      row.append(details);
    }
  } else {
    header.append(createActivityElement(doc, 'span', 'ta-activity-message', String(entry)), timestamp);
    row.append(header);
  }

  log.prepend(row);
  if (log.children.length > 50) log.lastElementChild.remove();
  updateActivityView(log);
};

module.exports = { appendActivityEntry, formatActivityLog, updateActivityView };
