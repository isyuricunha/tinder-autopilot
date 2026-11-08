const SWIPE_PHASES = Object.freeze({
  openingFeed: 'Opening feed',
  waitingForCard: 'Waiting for card',
  dismissingDialog: 'Dismissing dialog',
  openingProfile: 'Opening profile',
  readingProfile: 'Reading profile',
  waitingForAi: 'Waiting for AI',
  closingProfile: 'Closing profile',
  pacing: 'Swipe delay',
  preparingSwipe: 'Finding swipe control',
  confirmingSwipe: 'Confirming swipe',
  cooldown: 'Between swipes',
  finishing: 'Finishing previous cycle',
  off: 'Off',
  paused: 'Paused'
});

const formatSwipeDuration = (durationMs) => {
  const seconds = Math.max(0, Math.floor(durationMs / 1000));
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

const createSwipeCycle = (now) => ({
  startedAt: now,
  phase: null,
  phaseStartedAt: now,
  durations: new Map(),
  reason: '',
  outcome: 'No swipe',
  cancelled: false
});

const trackSwipePhase = (cycle, phase, now) => {
  if (cycle.phase === phase) return;
  if (cycle.phase) {
    const elapsed = Math.max(0, now - cycle.phaseStartedAt);
    cycle.durations.set(cycle.phase, (cycle.durations.get(cycle.phase) || 0) + elapsed);
  }
  cycle.phase = phase;
  cycle.phaseStartedAt = now;
};

const formatActivityDuration = (elapsed) => {
  const ms = Math.max(0, elapsed);
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${Math.round(ms / 100) / 10} s`;
  return formatSwipeDuration(ms);
};

const summarizeSwipeCycle = (cycle, now) => {
  trackSwipePhase(cycle, null, now);
  return {
    outcome: cycle.outcome,
    duration: formatActivityDuration(now - cycle.startedAt),
    reason: cycle.reason.trim().replace(/\s+/g, ' '),
    timings: Array.from(cycle.durations, ([phase, elapsed]) => ({
      phase,
      duration: formatActivityDuration(elapsed)
    }))
  };
};

module.exports = {
  SWIPE_PHASES,
  createSwipeCycle,
  formatSwipeDuration,
  summarizeSwipeCycle,
  trackSwipePhase
};
