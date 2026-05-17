(function () {
  "use strict";

  var NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  function midiToFreq(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  function freqToMidi(f) {
    return 69 + (12 * Math.log(f / 440)) / Math.LN2;
  }

  function midiToName(m) {
    var rounded = Math.round(m);
    var name = NOTE_NAMES[((rounded % 12) + 12) % 12];
    var octave = Math.floor(rounded / 12) - 1;
    return name + octave;
  }

  function centsBetween(freq, target) {
    return 1200 * (Math.log(freq / target) / Math.LN2);
  }

  /** ET MIDI numbers for open strings (A4 = 440) */
  var INSTRUMENTS = {
    guitar: {
      label: "Guitar",
      strings: [
        { id: "g6", midi: 40, short: "E" },
        { id: "g5", midi: 45, short: "A" },
        { id: "g4", midi: 50, short: "D" },
        { id: "g3", midi: 55, short: "G" },
        { id: "g2", midi: 59, short: "B" },
        { id: "g1", midi: 64, short: "E" },
      ],
    },
    ukulele: {
      label: "Ukulele",
      strings: [
        { id: "u4", midi: 67, short: "G" },
        { id: "u3", midi: 60, short: "C" },
        { id: "u2", midi: 64, short: "E" },
        { id: "u1", midi: 69, short: "A" },
      ],
    },
    violin: {
      label: "Violin",
      strings: [
        { id: "v4", midi: 55, short: "G" },
        { id: "v3", midi: 62, short: "D" },
        { id: "v2", midi: 69, short: "A" },
        { id: "v1", midi: 76, short: "E" },
      ],
    },
  };

  var COOKIE_VIEW = "oml-tuner-view";
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

  var els = {
    instrument: document.getElementById("instrument-select"),
    stringContainer: document.getElementById("string-options"),
    toggleBtn: document.getElementById("toggle-mic"),
    freqEl: document.getElementById("freq-value"),
    noteEl: document.getElementById("note-value"),
    plainEl: document.getElementById("tuning-plain"),
    centsEl: document.getElementById("cents-value"),
    needle: document.getElementById("meter-needle"),
    targetHint: document.getElementById("target-hint"),
    statusDot: document.getElementById("status-dot"),
    statusLabel: document.getElementById("status-label"),
  };

  function getCookie(name) {
    var escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var m = document.cookie.match(new RegExp("(?:^|; )" + escaped + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setCookie(name, value, maxAgeSec) {
    document.cookie =
      name +
      "=" +
      encodeURIComponent(value) +
      ";path=/;max-age=" +
      maxAgeSec +
      ";SameSite=Lax";
  }

  function getViewMode() {
    var r = document.querySelector('input[name="view-mode"]:checked');
    return r && r.value === "advanced" ? "advanced" : "simple";
  }

  function setViewBodyClass(mode) {
    document.body.classList.toggle("tuner-view-simple", mode === "simple");
    document.body.classList.toggle("tuner-view-advanced", mode === "advanced");
  }

  function persistViewMode(mode) {
    setCookie(COOKIE_VIEW, mode, COOKIE_MAX_AGE);
  }

  function initViewModeFromCookie() {
    var saved = getCookie(COOKIE_VIEW);
    var mode = saved === "advanced" ? "advanced" : "simple";
    var radio = document.querySelector('input[name="view-mode"][value="' + mode + '"]');
    if (radio) radio.checked = true;
    setViewBodyClass(mode);
  }

  function wireViewModeRadios() {
    var nodes = document.querySelectorAll('input[name="view-mode"]');
    var i;
    for (i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener("change", function () {
        if (!this.checked) return;
        var mode = this.value === "advanced" ? "advanced" : "simple";
        setViewBodyClass(mode);
        persistViewMode(mode);
        buildStringRadios();
        updateTargetHint();
      });
    }
  }

  function getOrderHint() {
    if (activeInstrument === "guitar") {
      return "Strings run from the 6th (low E) to the 1st (high E).";
    }
    if (activeInstrument === "ukulele") {
      return "Strings 4 (G) through 1 (A), low pitch to high.";
    }
    return "Strings IV (G) through I (E), low pitch to high.";
  }

  var audioCtx = null;
  var analyser = null;
  var mediaStream = null;
  var sourceNode = null;
  var rafId = null;
  var buf = null;

  var smoothedHz = 0;
  var activeInstrument = "guitar";
  var activeStringId = null;

  function getActiveStrings() {
    return INSTRUMENTS[activeInstrument].strings;
  }

  function getSelectedTarget() {
    var list = getActiveStrings();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === activeStringId) {
        return list[i];
      }
    }
    return list[0];
  }

  function formatHz(hz) {
    if (!hz || hz <= 0 || hz > 5000) return "—";
    if (hz >= 1000) return hz.toFixed(1);
    if (hz >= 100) return hz.toFixed(2);
    return hz.toFixed(2);
  }

  function buildStringRadios() {
    var list = getActiveStrings();
    els.stringContainer.innerHTML = "";
    var instLabel = INSTRUMENTS[activeInstrument].label;

    var ids = list.map(function (x) {
      return x.id;
    });
    if (activeStringId === null || ids.indexOf(activeStringId) === -1) {
      activeStringId = list[0].id;
    }

    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var wrap = document.createElement("div");
      wrap.className = "string-option";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "string-choice";
      input.value = s.id;
      input.id = "str-" + s.id;
      input.checked = s.id === activeStringId;
      var label = document.createElement("label");
      label.htmlFor = "str-" + s.id;
      var midi = s.midi;
      var hz = midiToFreq(midi);
      var numLabel =
        instLabel === "Guitar"
          ? String(6 - i)
          : String(4 - i);
      label.textContent =
        getViewMode() === "advanced"
          ? numLabel + " · " + s.short + " · " + hz.toFixed(1) + " Hz"
          : numLabel + " · " + s.short;

      wrap.appendChild(input);
      wrap.appendChild(label);
      els.stringContainer.appendChild(wrap);

      input.addEventListener("change", function () {
        if (this.checked) activeStringId = this.value;
        updateTargetHint();
      });
    }

    updateTargetHint();
  }

  function updateTargetHint() {
    var t = getSelectedTarget();
    var hz = midiToFreq(t.midi);
    var note = midiToName(t.midi);
    var orderHint = getOrderHint();

    if (getViewMode() === "advanced") {
      els.targetHint.textContent =
        "Target is the open string you selected. " +
        orderHint +
        " Aim for " +
        note +
        " · " +
        hz.toFixed(2) +
        " Hz (equal temperament, A4 = 440 Hz).";
    } else {
      els.targetHint.textContent =
        "Pick the string you are tuning above, then start the microphone.";
    }
  }

  /**
   * Band-limited autocorrelation peak near expected fundamental.
   */
  function detectPitch(samples, sampleRate, hintHz) {
    var n = samples.length;
    var sum = 0;
    var i;
    for (i = 0; i < n; i++) {
      sum += samples[i] * samples[i];
    }
    var rms = Math.sqrt(sum / n);
    if (rms < 0.012) return 0;

    var minHz = 65;
    var maxHz = 1200;
    if (hintHz > 0) {
      minHz = hintHz * 0.85;
      maxHz = hintHz * 1.15;
    }

    var minLag = Math.max(2, Math.floor(sampleRate / maxHz));
    var maxLag = Math.min(Math.floor(n / 2) - 2, Math.floor(sampleRate / minHz));

    if (minLag >= maxLag) return 0;

    var bestLag = -1;
    var bestCorr = -Infinity;
    var lag;
    var j;
    var corr;

    for (lag = minLag; lag <= maxLag; lag++) {
      corr = 0;
      for (j = 0; j < n - lag; j++) {
        corr += samples[j] * samples[j + lag];
      }
      if (corr > bestCorr) {
        bestCorr = corr;
        bestLag = lag;
      }
    }

    if (bestLag < 2) return 0;

    var x0 = 0;
    var x1 = 0;
    var x2 = 0;
    for (j = 0; j < n - (bestLag - 1); j++) {
      x0 += samples[j] * samples[j + bestLag - 1];
    }
    for (j = 0; j < n - bestLag; j++) {
      x1 += samples[j] * samples[j + bestLag];
    }
    for (j = 0; j < n - (bestLag + 1); j++) {
      x2 += samples[j] * samples[j + bestLag + 1];
    }

    var denom = x0 + x2 - 2 * x1;
    var frac = denom !== 0 ? (x2 - x0) / (2 * denom) : 0;
    var refinedLag = bestLag + frac;
    if (refinedLag < 2) refinedLag = bestLag;

    return sampleRate / refinedLag;
  }

  function tick() {
    if (!analyser || !buf) return;

    analyser.getFloatTimeDomainData(buf);

    var hint = midiToFreq(getSelectedTarget().midi);
    var raw = detectPitch(buf, audioCtx.sampleRate, hint);

    if (raw > 0) {
      smoothedHz = smoothedHz === 0 ? raw : smoothedHz * 0.82 + raw * 0.18;
    }

    var displayHz = smoothedHz;
    els.freqEl.textContent = formatHz(displayHz);

    if (displayHz > 0) {
      els.noteEl.textContent = midiToName(freqToMidi(displayHz));
      var target = midiToFreq(getSelectedTarget().midi);
      var cents = centsBetween(displayHz, target);
      var rounded = Math.round(cents);
      var absC = Math.abs(rounded);

      if (absC <= 5) {
        els.centsEl.textContent = "In tune (" + (rounded >= 0 ? "+" : "") + rounded + " cents)";
        els.centsEl.className = "cents-line advanced-only in-tune";
      } else if (rounded < 0) {
        els.centsEl.textContent = "Flat · " + rounded + " cents — tighten";
        els.centsEl.className = "cents-line advanced-only";
      } else {
        els.centsEl.textContent = "Sharp · +" + rounded + " cents — loosen";
        els.centsEl.className = "cents-line advanced-only";
      }

      if (els.plainEl) {
        if (absC <= 5) {
          els.plainEl.textContent = "In tune";
          els.plainEl.classList.add("in-tune");
        } else if (rounded < 0) {
          els.plainEl.textContent = "Too low — tighten the string";
          els.plainEl.classList.remove("in-tune");
        } else {
          els.plainEl.textContent = "Too high — loosen the string";
          els.plainEl.classList.remove("in-tune");
        }
      }

      var clamped = Math.max(-50, Math.min(50, cents));
      var pct = 50 + clamped;
      els.needle.style.left = pct + "%";
    } else {
      els.noteEl.textContent = "—";
      els.centsEl.textContent = "Play a clear note…";
      els.centsEl.className = "cents-line advanced-only";
      if (els.plainEl) {
        els.plainEl.textContent = "Play a clear note…";
        els.plainEl.classList.remove("in-tune");
      }
      els.needle.style.left = "50%";
    }

    rafId = requestAnimationFrame(tick);
  }

  function stopMic() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    smoothedHz = 0;

    if (sourceNode) {
      try {
        sourceNode.disconnect();
      } catch (e) {}
      sourceNode = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(function (t) {
        t.stop();
      });
      mediaStream = null;
    }
    if (audioCtx && audioCtx.state !== "closed") {
      audioCtx.close();
      audioCtx = null;
    }
    analyser = null;
    buf = null;

    els.toggleBtn.textContent = "Start microphone";
    els.statusDot.classList.remove("live");
    els.statusLabel.textContent = "Mic off";
    els.freqEl.textContent = "—";
    els.noteEl.textContent = "—";
    els.centsEl.textContent = "—";
    els.centsEl.className = "cents-line advanced-only";
    if (els.plainEl) {
      els.plainEl.textContent = "—";
      els.plainEl.classList.remove("in-tune");
    }
    els.needle.style.left = "50%";
  }

  function startMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      els.targetHint.textContent =
        getViewMode() === "advanced"
          ? "Microphone access is not available in this browser."
          : "This browser doesn’t support microphone input here.";
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      .then(function (stream) {
        mediaStream = stream;
        var AC = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AC();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 8192;
        sourceNode = audioCtx.createMediaStreamSource(stream);
        sourceNode.connect(analyser);
        buf = new Float32Array(analyser.fftSize);
        smoothedHz = 0;

        els.toggleBtn.textContent = "Stop microphone";
        els.statusDot.classList.add("live");
        els.statusLabel.textContent = "Listening";

        return audioCtx.resume();
      })
      .then(function () {
        rafId = requestAnimationFrame(tick);
      })
      .catch(function () {
        els.targetHint.textContent =
          getViewMode() === "advanced"
            ? "Could not access the microphone. Check browser permissions and try again."
            : "Microphone access was blocked. Allow the mic for this page and try again.";
        stopMic();
      });
  }

  function toggleMic() {
    if (audioCtx && analyser) {
      stopMic();
    } else {
      startMic();
    }
  }

  els.instrument.addEventListener("change", function () {
    activeInstrument = els.instrument.value;
    activeStringId = null;
    buildStringRadios();
    updateTargetHint();
  });

  els.toggleBtn.addEventListener("click", toggleMic);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && audioCtx) {
      stopMic();
    }
  });

  initViewModeFromCookie();
  wireViewModeRadios();
  buildStringRadios();
  updateTargetHint();
})();
