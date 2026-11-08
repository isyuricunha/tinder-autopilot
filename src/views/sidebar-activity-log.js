const createActivityElement = (doc, tag, className, text) => {
  const element = doc.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

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
};

module.exports = { appendActivityEntry };
