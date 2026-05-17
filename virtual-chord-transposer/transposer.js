(function () {
  "use strict";

  var CT = window.OMLChordTranspose;
  var VE = window.OMLTransposeVendorEngine;

  if (!CT) {
    throw new Error("oml-chord-transpose.js must load before transposer.js");
  }
  if (!VE) {
    throw new Error("engines/vendor-engine.js must load before transposer.js");
  }

  var STORAGE_VIEW = "oml-transpose-view";
  var STORAGE_METHOD = "oml-transpose-simple-method";
  var STORAGE_ENGINE = "oml-transpose-engine";
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

  var PLACEHOLDER_INPUT_ADVANCED =
    "Gm7 Fmaj7/Eb Bb13\nWalking [Am7] home [D7]\nGm  F    Eb     B    F     B   Gm";
  var PLACEHOLDER_OUTPUT_ADVANCED =
    "Transposed chords appear here after you tap Transpose.";

  var KEYS = [
    { id: "C", label: "C" },
    { id: "Db", label: "Db (C#)" },
    { id: "D", label: "D" },
    { id: "Eb", label: "Eb (D#)" },
    { id: "E", label: "E" },
    { id: "F", label: "F" },
    { id: "Gb", label: "Gb (F#)" },
    { id: "G", label: "G" },
    { id: "Ab", label: "Ab (G#)" },
    { id: "A", label: "A" },
    { id: "Bb", label: "Bb (A#)" },
    { id: "B", label: "B" },
  ];

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

  function setStored(key, value) {
    setCookie(key, value, COOKIE_MAX_AGE);
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  function getStored(key) {
    var c = getCookie(key);
    if (c !== null && c !== "") return c;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function engineMode() {
    var r = document.querySelector('input[name="transpose-engine"]:checked');
    return r && r.value === "vendor" ? "vendor" : "native";
  }

  function activeEngine() {
    return engineMode() === "vendor" ? VE : CT;
  }

  var facade = {
    noteToPc: function (id) {
      return activeEngine().noteToPc(id);
    },
    pcToName: function (pc, pf) {
      return activeEngine().pcToName(pc, pf);
    },
    signedSemitonesBetweenRoots: function (a, b) {
      return activeEngine().signedSemitonesBetweenRoots(a, b);
    },
    transposeText: function (text, n, opts) {
      return activeEngine().transposeText(text, n, opts);
    },
  };

  var engine = facade;

  function normalizeSimpleMethodStored(raw) {
    if (raw === "steps" || raw === "semitones") return "steps";
    return "keys";
  }

  function getSimpleMethodMode() {
    var r = document.querySelector('input[name="simple-method"]:checked');
    return r && r.value === "steps" ? "steps" : "keys";
  }

  function refreshLibVersionHint() {
    var el = document.getElementById("lib-version");

    if (!el) return;
    if (engineMode() === "vendor") {
      el.innerHTML = VE.getLibraryStatusMessage();
    } else {
      el.innerHTML = `
      Chord-line detection uses oml-chord-transpose v${CT.VERSION}
      <br><br><strong>OML</strong>:
      <code>shared/oml-chord-transpose.js</code>
      — moves letter names and accidentals (and bass after <code>/</code>).
    `;
    }
  }

  function restoreEngineFromStorage() {
    var saved = getStored(STORAGE_ENGINE);
    var mode = saved === "vendor" ? "vendor" : "native";
    var radio = document.querySelector('input[name="transpose-engine"][value="' + mode + '"]');
    if (radio) radio.checked = true;
  }

  function restoreSimpleMethodRadiosFromStorage() {
    var saved = getStored(STORAGE_METHOD);
    var method = normalizeSimpleMethodStored(saved);
    var r = document.querySelector('input[name="simple-method"][value="' + method + '"]');
    if (r) r.checked = true;
  }

  var els = {
    input: document.getElementById("song-input"),
    output: document.getElementById("song-output"),
    semitone: document.getElementById("semitone-input"),
    semitoneRange: document.getElementById("semitone-range"),
    preferFlats: document.getElementById("prefer-flats"),
    keyFrom: document.getElementById("key-from"),
    keyTo: document.getElementById("key-to"),
    transposeBtn: document.getElementById("transpose-btn"),
    copyBtn: document.getElementById("copy-btn"),
    libVer: document.getElementById("lib-version"),
  };

  function preferFlatsChecked() {
    return els.preferFlats ? els.preferFlats.checked : false;
  }

  function applySimpleMethod(method) {
    var keys = method === "keys";
    document.body.classList.toggle("transpose-simple-keys", keys);
    document.body.classList.toggle("transpose-simple-steps", !keys);
  }

  function syncTextareaPlaceholders(mode) {
    var advanced = mode === "advanced";
    if (els.input) {
      els.input.placeholder = advanced ? PLACEHOLDER_INPUT_ADVANCED : "";
    }
    if (els.output) {
      els.output.placeholder = advanced ? PLACEHOLDER_OUTPUT_ADVANCED : "";
    }
  }

  function applyTransposeView(mode) {
    var advanced = mode === "advanced";
    document.body.classList.toggle("transpose-view-advanced", advanced);
    document.body.classList.toggle("transpose-view-simple", !advanced);
    if (advanced) {
      document.body.classList.remove("transpose-simple-keys", "transpose-simple-steps");
    } else {
      applySimpleMethod(getSimpleMethodMode());
    }
    syncTextareaPlaceholders(mode);
  }

  function initTransposeViewFromStorage() {
    var saved = getStored(STORAGE_VIEW);
    var mode = saved === "advanced" ? "advanced" : "simple";
    var radio = document.querySelector('input[name="transpose-view"][value="' + mode + '"]');
    if (radio) radio.checked = true;
    if (mode === "simple") {
      restoreSimpleMethodRadiosFromStorage();
    }
    applyTransposeView(mode);
  }

  function wireTransposeViewRadios() {
    var nodes = document.querySelectorAll('input[name="transpose-view"]');
    var i;
    for (i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener("change", function () {
        if (!this.checked) return;
        var mode = this.value === "advanced" ? "advanced" : "simple";
        setStored(STORAGE_VIEW, mode);
        if (mode === "simple") {
          restoreSimpleMethodRadiosFromStorage();
        }
        applyTransposeView(mode);
      });
    }
  }

  function wireSimpleMethodRadios() {
    var nodes = document.querySelectorAll('input[name="simple-method"]');
    var i;
    for (i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener("change", function () {
        if (!this.checked) return;
        var method = this.value === "steps" ? "steps" : "keys";
        setStored(STORAGE_METHOD, method === "steps" ? "semitones" : "keys");
        applySimpleMethod(method);
      });
    }
  }

  function wireEngineRadios() {
    var nodes = document.querySelectorAll('input[name="transpose-engine"]');
    var i;
    for (i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener("change", function () {
        if (!this.checked) return;
        setStored(STORAGE_ENGINE, this.value);
        refreshLibVersionHint();
      });
    }
  }

  function populateKeySelects() {
    KEYS.forEach(function (k) {
      var a = document.createElement("option");
      a.value = k.id;
      a.textContent = k.label;
      els.keyFrom.appendChild(a);
      var b = document.createElement("option");
      b.value = k.id;
      b.textContent = k.label;
      els.keyTo.appendChild(b);
    });
    els.keyFrom.value = "C";
    els.keyTo.value = "D";
  }

  function syncSemitoneControlsFromNumber() {
    var v = parseInt(els.semitone.value, 10);
    if (Number.isNaN(v)) v = 0;
    v = Math.max(-12, Math.min(12, v));
    els.semitone.value = String(v);
    els.semitoneRange.value = String(v);
  }

  function syncNumberFromRange() {
    els.semitone.value = els.semitoneRange.value;
  }

  function keyOptionForPc(pc, preferFlats) {
    var want = engine.pcToName(pc, preferFlats);
    var i;
    for (i = 0; i < KEYS.length; i++) {
      if (KEYS[i].id === want) return KEYS[i].id;
    }
    var candidates = KEYS.filter(function (k) {
      return engine.noteToPc(k.id) === pc;
    });
    if (!candidates.length) return "C";
    return preferFlats ? candidates[candidates.length - 1].id : candidates[0].id;
  }

  function syncKeysFromSemitone() {
    var v = parseInt(els.semitone.value, 10);
    if (Number.isNaN(v)) v = 0;
    v = Math.max(-12, Math.min(12, v));
    var fromPc = engine.noteToPc(els.keyFrom.value);
    if (fromPc === undefined) return;
    var toPc = (((fromPc + v) % 12) + 12) % 12;
    els.keyTo.value = keyOptionForPc(toPc, preferFlatsChecked());
  }

  function syncSemitoneFromKeys() {
    var diff = engine.signedSemitonesBetweenRoots(els.keyFrom.value, els.keyTo.value);
    els.semitone.value = String(diff);
    els.semitoneRange.value = String(diff);
  }

  function runTranspose() {
    syncSemitoneControlsFromNumber();
    var n = parseInt(els.semitone.value, 10) || 0;
    els.output.value = engine.transposeText(els.input.value, n, {
      preferFlats: preferFlatsChecked(),
    });
  }

  function copyOutput() {
    var text = els.output.value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      return;
    }
    els.output.select();
    els.output.setSelectionRange(0, text.length);
    document.execCommand("copy");
  }

  restoreEngineFromStorage();

  els.semitone.addEventListener("input", function () {
    syncSemitoneControlsFromNumber();
    syncKeysFromSemitone();
  });

  els.semitoneRange.addEventListener("input", function () {
    syncNumberFromRange();
    syncKeysFromSemitone();
  });

  els.keyFrom.addEventListener("change", function () {
    syncKeysFromSemitone();
  });

  els.keyTo.addEventListener("change", function () {
    syncSemitoneFromKeys();
  });

  if (els.preferFlats) {
    els.preferFlats.addEventListener("change", function () {
      syncKeysFromSemitone();
    });
  }

  els.transposeBtn.addEventListener("click", runTranspose);
  els.copyBtn.addEventListener("click", copyOutput);

  populateKeySelects();
  initTransposeViewFromStorage();
  wireTransposeViewRadios();
  wireSimpleMethodRadios();
  wireEngineRadios();

  syncSemitoneFromKeys();
  syncSemitoneControlsFromNumber();

  refreshLibVersionHint();
})();
