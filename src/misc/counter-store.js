import { getSetting, setSetting } from './settings-store';

const COUNTERS = {
  likes: 'likeCount',
  matches: 'matchCount',
  dislikes: 'deslikeCount'
};

const getCounter = (counterName) => parseInt(getSetting(counterName, '0'), 10) || 0;

const setCounter = (counterName, value) => {
  setSetting(counterName, String(value));
  return value;
};

const incrementCounter = (counterName) => setCounter(counterName, getCounter(counterName) + 1);

const resetCounters = () => {
  Object.values(COUNTERS).forEach((counterName) => setCounter(counterName, 0));
};

const readCounters = () => ({
  likeCount: getCounter(COUNTERS.likes),
  matchCount: getCounter(COUNTERS.matches),
  deslikeCount: getCounter(COUNTERS.dislikes)
});

const updateCounterElement = (elementId, value) => {
  const element = document.getElementById(elementId);
  if (element) element.textContent = value;
};

const renderCounters = () => {
  const counters = readCounters();
  updateCounterElement('likeCount', counters.likeCount);
  updateCounterElement('matchCount', counters.matchCount);
  updateCounterElement('deslikeCount', counters.deslikeCount);
  return counters;
};

export { COUNTERS, getCounter, setCounter, incrementCounter, resetCounters, renderCounters };
