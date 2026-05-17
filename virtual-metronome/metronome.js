(function () {
  "use strict";

  const BPM_MIN = 30;
  const BPM_MAX = 300;

  const els = {
    bpmInput: document.getElementById("bpm-input"),
    bpmSlider: document.getElementById("bpm-slider"),
    bpmDisplay: document.getElementById("bpm-display-num"),
    beatsSelect: document.getElementById("beats-select"),
    toggleBtn: document.getElementById("toggle-btn"),
    tapBtn: document.getElementById("tap-btn"),
    dots: document.getElementById("beat-dots"),
    status: document.getElementById("running-label"),
  };

  let audioCtx = null;
  let isRunning = false;
  let scheduleAhead = 0.14;
  let nextNoteTime = 0;
  let current16th = 0;
  let timerId = null;
  let beatsPerBar = 4;
  let currentBeatInBar = 0;

  let tapTimes = [];

  function clampBpm(n) {
    const v = Math.round(Number(n));
    if (Number.isNaN(v)) return 120;
    return Math.min(BPM_MAX, Math.max(BPM_MIN, v));
  }

  function syncUiBpm(bpm) {
    els.bpmInput.value = String(bpm);
    els.bpmSlider.value = String(bpm);
    els.bpmDisplay.textContent = String(bpm);
  }

  function getBpm() {
    return clampBpm(els.bpmInput.value);
  }

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") {
      return audioCtx.resume();
    }
    return Promise.resolve();
  }

  function playClick(time, accent) {
    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const freq = accent ? 1320 : 880;
    const peak = accent ? 0.45 : 0.28;
    const dur = accent ? 0.024 : 0.018;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  function renderDots() {
    const n = beatsPerBar;
    els.dots.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const d = document.createElement("span");
      d.className = "beat-dot" + (i === 0 ? " accent" : "");
      d.setAttribute("aria-hidden", "true");
      els.dots.appendChild(d);
    }
  }

  function highlightBeat(beatIndexZeroBased) {
    const children = els.dots.children;
    for (let i = 0; i < children.length; i++) {
      children[i].classList.toggle("active", i === beatIndexZeroBased);
    }
  }

  function scheduler() {
    if (!isRunning) return;
    const ctx = audioCtx;
    let bpm = getBpm();
    let secondsPerBeat = 60 / bpm;

    while (nextNoteTime < ctx.currentTime) {
      nextNoteTime += secondsPerBeat;
      currentBeatInBar = (currentBeatInBar + 1) % beatsPerBar;
      bpm = getBpm();
      secondsPerBeat = 60 / bpm;
    }

    while (nextNoteTime < ctx.currentTime + scheduleAhead && isRunning) {
      bpm = getBpm();
      secondsPerBeat = 60 / bpm;
      playClick(nextNoteTime, currentBeatInBar === 0);
      highlightBeat(currentBeatInBar);
      nextNoteTime += secondsPerBeat;
      currentBeatInBar = (currentBeatInBar + 1) % beatsPerBar;
    }

    if (isRunning) {
      timerId = window.setTimeout(scheduler, 25);
    }
  }

  function startMetronome() {
    return ensureAudio().then(function () {
      if (isRunning) return;
      isRunning = true;
      nextNoteTime = audioCtx.currentTime + 0.05;
      currentBeatInBar = 0;
      els.toggleBtn.textContent = "Stop";
      els.status.textContent = "Running";
      scheduler();
    });
  }

  function stopMetronome() {
    if (!isRunning) return;
    isRunning = false;
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    els.toggleBtn.textContent = "Start";
    els.status.textContent = "Stopped";
    const children = els.dots.children;
    for (let i = 0; i < children.length; i++) {
      children[i].classList.remove("active");
    }
  }

  function toggle() {
    if (isRunning) stopMetronome();
    else startMetronome();
  }

  els.bpmInput.addEventListener("input", function () {
    syncUiBpm(clampBpm(els.bpmInput.value));
  });

  els.bpmSlider.addEventListener("input", function () {
    syncUiBpm(clampBpm(els.bpmSlider.value));
    els.bpmInput.value = els.bpmSlider.value;
  });

  els.beatsSelect.addEventListener("change", function () {
    beatsPerBar = parseInt(els.beatsSelect.value, 10) || 4;
    stopMetronome();
    renderDots();
  });

  els.toggleBtn.addEventListener("click", function () {
    toggle();
  });

  els.tapBtn.addEventListener("click", function () {
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    tapTimes.push(now);
    const cutoff = now - 2500;
    tapTimes = tapTimes.filter(function (t) {
      return t >= cutoff;
    });
    if (tapTimes.length < 2) return;

    const intervals = [];
    for (let i = 1; i < tapTimes.length; i++) {
      intervals.push(tapTimes[i] - tapTimes[i - 1]);
    }
    const avg = intervals.reduce(function (a, b) {
      return a + b;
    }, 0) / intervals.length;
    const bpm = clampBpm(Math.round(60000 / avg));
    syncUiBpm(bpm);
    els.bpmInput.value = String(bpm);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && isRunning) {
      stopMetronome();
    }
  });

  beatsPerBar = parseInt(els.beatsSelect.value, 10) || 4;
  renderDots();
  syncUiBpm(getBpm());
})();
