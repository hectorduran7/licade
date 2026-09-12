/**
 * KNOWY - Background Timer Worker
 * Accurate, drift-free timestamp pulsing for Pomodoro & Stopwatch
 */

let timerInterval = null;
let state = {
  running: false,
  isUnlimited: false,
  targetEndTime: null,
  chronoStartTime: null,
  chronoAccumulated: 0
};

function tick() {
  if (!state.running) return;
  const now = Date.now();

  if (state.isUnlimited) {
    const elapsedMs = state.chronoAccumulated + (state.chronoStartTime ? (now - state.chronoStartTime) : 0);
    const secs = Math.floor(elapsedMs / 1000);
    self.postMessage({ type: 'TICK', currentSeconds: secs, isUnlimited: true });
  } else {
    const remainingMs = (state.targetEndTime || now) - now;
    if (remainingMs <= 0) {
      state.running = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      self.postMessage({ type: 'COMPLETE', currentSeconds: 0, isUnlimited: false });
    } else {
      const remainingSecs = Math.ceil(remainingMs / 1000);
      self.postMessage({ type: 'TICK', currentSeconds: remainingSecs, isUnlimited: false });
    }
  }
}

self.onmessage = function(e) {
  const data = e.data || {};
  switch (data.type) {
    case 'START':
      state.running = true;
      state.isUnlimited = !!data.isUnlimited;
      state.targetEndTime = data.targetEndTime || null;
      state.chronoStartTime = data.chronoStartTime || Date.now();
      state.chronoAccumulated = data.chronoAccumulated || 0;
      if (timerInterval) clearInterval(timerInterval);
      tick();
      timerInterval = setInterval(tick, 250);
      break;

    case 'PAUSE':
      state.running = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      if (state.isUnlimited && state.chronoStartTime) {
        state.chronoAccumulated += (Date.now() - state.chronoStartTime);
        state.chronoStartTime = null;
      }
      self.postMessage({ type: 'PAUSED', chronoAccumulated: state.chronoAccumulated });
      break;

    case 'RESET':
      state.running = false;
      state.targetEndTime = null;
      state.chronoStartTime = null;
      state.chronoAccumulated = 0;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      self.postMessage({ type: 'RESET_DONE' });
      break;

    case 'SYNC':
      if (typeof data.isUnlimited !== 'undefined') state.isUnlimited = data.isUnlimited;
      if (typeof data.targetEndTime !== 'undefined') state.targetEndTime = data.targetEndTime;
      if (typeof data.chronoStartTime !== 'undefined') state.chronoStartTime = data.chronoStartTime;
      if (typeof data.chronoAccumulated !== 'undefined') state.chronoAccumulated = data.chronoAccumulated;
      break;
  }
};
